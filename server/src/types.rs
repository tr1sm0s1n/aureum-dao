use core::fmt;
use std::{
    collections::HashMap,
    sync::{Arc, Mutex},
    time::SystemTime,
};

use concordium_rust_sdk::{
    base as concordium_base,
    common::{SerdeBase16Serialize, Serial, Serialize},
    id::{
        constants::{ArCurve, AttributeKind},
        id_proof_types::Statement,
        types::{AccountAddress, GlobalContext},
    },
    v2::Client,
};

#[derive(
    Copy, Clone, Eq, PartialEq, Ord, PartialOrd, Hash, Debug, SerdeBase16Serialize, Serialize,
)]
pub struct Challenge(pub [u8; 32]);

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

#[derive(serde::Deserialize, serde::Serialize, Debug)]
pub struct ChallengeResponse {
    pub challenge: Challenge,
}

#[derive(Clone)]
pub struct TokenStatus {
    pub created_at: SystemTime,
}

#[derive(Debug,)]
pub enum InjectStatementError {
    LockingError,
}

impl fmt::Display for InjectStatementError {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        match *self {
            InjectStatementError::LockingError => write!(f, "Error acquiring internal lock."),
        }
    }
}