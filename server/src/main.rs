mod handlers;
mod types;
use crate::handlers::*;
use crate::types::*;

use std::{
    collections::HashMap,
    fs,
    sync::{Arc, Mutex},
};

use axum::response::Redirect;
use axum::routing::post;
use axum::{routing::get, Router};
use concordium_rust_sdk::{
    id::{
        constants::{ArCurve, AttributeKind},
        id_proof_types::Statement,
    },
    v2::BlockIdentifier,
};
use tonic::transport::ClientTlsConfig;
use tower_http::services::ServeDir;
use tower_http::{
    cors::{Any, CorsLayer},
    trace::TraceLayer,
};
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    let file = fs::read_to_string("./config/statement.json").expect("Unable to read statement");
    let statement: Statement<ArCurve, AttributeKind> =
        serde_json::from_str(&file).expect("JSON does not have correct format");

    let endpoint =
        concordium_rust_sdk::v2::Endpoint::from_static("https://grpc.testnet.concordium.com:20000")
            .tls_config(ClientTlsConfig::new())?;
    let mut client = concordium_rust_sdk::v2::Client::new(endpoint).await?;

    let global_context = client
        .get_cryptographic_parameters(BlockIdentifier::LastFinal)
        .await?
        .response;

    let state = Server {
        client,
        statement,
        challenges: Arc::new(Mutex::new(HashMap::new())),
        global_context: Arc::new(global_context),
        tokens: Arc::new(Mutex::new(HashMap::new())),
    };

    // logging middleware
    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "concordium_dao_server=debug,tower_http=debug".into()),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();

    // run it
    let listener = tokio::net::TcpListener::bind("127.0.0.1:4800").await?;

    tracing::debug!("Listening on http://{}", listener.local_addr()?);
    axum::serve(listener, app(state)).await?;
    Ok(())
}

fn app(state: Server) -> Router {
    // build our application with multiple routes
    Router::new()
        .nest_service("/", ServeDir::new("../dist"))
        .route("/dashboard", get(|| async { Redirect::permanent("/") }))
        .route("/hello", get(hello))
        .route("/statement", get(get_statement))
        .route("/challenge", get(get_challenge))
        .route("/prove", post(provide_proof))
        .layer(
            CorsLayer::new()
                .allow_origin(Any)
                .allow_methods(Any)
                .allow_headers(Any),
        )
        .layer(TraceLayer::new_for_http())
        .with_state(state)
}

async fn hello() -> &'static str {
    "Hello, World!"
}
