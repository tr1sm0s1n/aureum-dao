use std::{
    collections::HashMap,
    sync::{Arc, Mutex},
    time::SystemTime,
};

use concordium_rust_sdk::{
    id::{
        constants::{ArCurve, AttributeKind},
        id_proof_types::Statement,
        types::{AccountAddress, GlobalContext},
    },
    v2::Client,
};

#[derive(Clone)]
pub struct Server {
    pub client: Client,
    pub challenges: Arc<Mutex<HashMap<String, ChallengeStatus>>>,
    pub global_context: Arc<GlobalContext<ArCurve>>,
    pub statement: Statement<ArCurve, AttributeKind>,
    pub tokens: Arc<Mutex<HashMap<String, TokenStatus>>>,
}

#[derive(Clone)]
pub struct ChallengeStatus {
    pub address: AccountAddress,
    pub created_at: SystemTime,
}

#[derive(Clone)]
pub struct TokenStatus {
    pub created_at: SystemTime,
}
