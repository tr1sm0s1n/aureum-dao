use std::time::SystemTime;

use crate::types::*;

use axum::{
    extract::{Query, State},
    http::StatusCode,
    Json,
};
use concordium_rust_sdk::{
    common::{self as crypto_common, base16_encode_string},
    id::{
        constants::{ArCurve, AttributeKind},
        id_proof_types::Statement,
        types::{AccountAddress, AccountCredentialWithoutProofs},
    },
    v2::BlockIdentifier,
};
use rand::Rng;
use uuid::Uuid;

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
        Err(e) => Err((StatusCode::INTERNAL_SERVER_ERROR, e.to_string())),
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

pub async fn provide_proof(
    State(st): State<Server>,
    Json(req): Json<ChallengedProof>,
) -> Result<Json<Uuid>, (StatusCode, String)> {
    let client = st.client.clone();
    let state = st.clone();
    let statement = st.statement.clone();
    match check_proof_worker(client, state, req, statement).await {
        Ok(r) => Ok(Json(r)),
        Err(e) => Err((StatusCode::INTERNAL_SERVER_ERROR, e.to_string())),
    }
}

// A common function that validates the cryptographic proofs in the request.
async fn check_proof_worker(
    mut client: concordium_rust_sdk::v2::Client,
    state: Server,
    request: ChallengedProof,
    statement: Statement<ArCurve, AttributeKind>,
) -> Result<Uuid, InjectStatementError> {
    let status = {
        let challenges = state
            .challenges
            .lock()
            .map_err(|_| InjectStatementError::LockingError)?;

        challenges
            .get(&base16_encode_string(&request.challenge.0))
            .ok_or(InjectStatementError::UnknownSession)?
            .clone()
    };

    let cred_id = request.proof.credential;
    let acc_info = client
        .get_account_info(&status.address.into(), BlockIdentifier::LastFinal)
        .await
        .map_err(|_| InjectStatementError::Other)?;

    // TODO Check remaining credentials
    let credential = acc_info
        .response
        .account_credentials
        .get(&0.into())
        .ok_or(InjectStatementError::Credential)?;

    if crypto_common::to_bytes(credential.value.cred_id()) != crypto_common::to_bytes(&cred_id) {
        return Err(InjectStatementError::Credential);
    }

    let commitments = match &credential.value {
        AccountCredentialWithoutProofs::Initial { icdv: _, .. } => {
            return Err(InjectStatementError::NotAllowed);
        }
        AccountCredentialWithoutProofs::Normal { commitments, .. } => commitments,
    };
    let mut tokens = state
        .tokens
        .lock()
        .map_err(|_| InjectStatementError::LockingError)?;

    let mut challenges = state
        .challenges
        .lock()
        .map_err(|_| InjectStatementError::LockingError)?;

    if statement.verify(
        concordium_rust_sdk::id::id_proof_types::ProofVersion::Version1,
        &request.challenge.0,
        &state.global_context,
        cred_id.as_ref(),
        commitments,
        &request.proof.proof.value, // TODO: Check version.
    ) {
        challenges.remove(&base16_encode_string(&request.challenge.0));
        let token = Uuid::new_v4();
        tokens.insert(
            token.to_string(),
            TokenStatus {
                created_at: SystemTime::now(),
            },
        );
        Ok(token)
    } else {
        Err(InjectStatementError::InvalidProofs)
    }
}
