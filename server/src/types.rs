use core::fmt;
use std::{
    collections::HashMap,
    sync::{Arc, Mutex},
    time::SystemTime,
};

use concordium_rust_sdk::{
    base as concordium_base,
    common::{SerdeBase16Serialize, Serial, Serialize, Versioned},
    id::{
        constants::{ArCurve, AttributeKind},
        id_proof_types::{Proof, Statement},
        types::{AccountAddress, GlobalContext},
    },
    types::CredentialRegistrationID,
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

#[derive(serde::Deserialize)]
pub struct Params {
    pub address: AccountAddress,
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

#[derive(serde::Deserialize, serde::Serialize, Debug, Clone)]
pub struct ChallengedProof {
    pub challenge: Challenge,
    pub proof: ProofWithContext,
}

#[derive(serde::Deserialize, serde::Serialize, Debug, Clone)]
pub struct ProofWithContext {
    pub credential: CredentialRegistrationID,
    pub proof: Versioned<Proof<ArCurve, AttributeKind>>,
}

#[derive(Clone)]
pub struct TokenStatus {
    pub created_at: SystemTime,
}

#[derive(Debug)]
pub enum InjectStatementError {
    Credential,
    InvalidProofs,
    LockingError,
    NotAllowed,
    UnknownSession,
    Other,
}

impl fmt::Display for InjectStatementError {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        match *self {
            InjectStatementError::Credential => write!(f, "Given token was expired."),
            InjectStatementError::InvalidProofs => write!(f, "Invalid proof."),
            InjectStatementError::LockingError => write!(f, "Error acquiring internal lock."),
            InjectStatementError::NotAllowed => write!(f, "Not allowed."),
            InjectStatementError::UnknownSession => {
                write!(f, "Proof provided for an unknown session.")
            }
            InjectStatementError::Other => write!(f, "Other error."),
        }
    }
}

impl std::error::Error for InjectStatementError {}
