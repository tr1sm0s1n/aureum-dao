use axum::{extract::State, http::StatusCode, Json};
use concordium_rust_sdk::id::{constants::{ArCurve, AttributeKind}, id_proof_types::Statement};

use crate::Server;

pub async fn get_statement(
    State(st): State<Server>,
) -> Result<Json<Statement<ArCurve, AttributeKind>>, (StatusCode, String)> {
    let statement = st.statement;

    Ok(Json(statement))
}