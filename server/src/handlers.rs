use std::time::SystemTime;

use crate::types::*;

use axum::{extract::{Query, State}, http::StatusCode, Json};
use concordium_rust_sdk::{common::base16_encode_string, id::{constants::{ArCurve, AttributeKind}, id_proof_types::Statement, types::AccountAddress}};
use rand::Rng;

use crate::Server;

pub async fn get_statement(
    State(st): State<Server>,
) -> Result<Json<Statement<ArCurve, AttributeKind>>, (StatusCode, String)> {
    let statement = st.statement;

    Ok(Json(statement))
}

pub async fn get_challenge(
    Query(address): Query<AccountAddress>,
    State(st): State<Server>,
) -> Result<Json<ChallengeResponse>, (StatusCode, String)> {
    let state = st.clone();
    tracing::debug!("Parsed statement. Generating challenge");
    match get_challenge_worker(state, address).await {
        Ok(r) => Ok(Json(r)),
        Err(e) => {
            Err((StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))
        }
    }
}

async fn get_challenge_worker(
    state: Server,
    address: AccountAddress,
) -> Result<ChallengeResponse, InjectStatementError> {
    let mut challenge = [0u8; 32];
    rand::thread_rng().fill(&mut challenge[..]);
    let mut sm = state
        .challenges
        .lock()
        .map_err(|_| InjectStatementError::LockingError)?;
    tracing::debug!("Generated challenge: {:?}", challenge);
    let challenge = Challenge(challenge);

    sm.insert(
        base16_encode_string(&challenge.0),
        ChallengeStatus {
            address,
            created_at: SystemTime::now(),
        },
    );
    Ok(ChallengeResponse { challenge })
}