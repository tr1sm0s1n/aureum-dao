interface Challenge {
    challenge: Uint8Array; 
}

interface ProofWithContext {
    credential: string; 
    proof: any; 
}

interface ChallengedProof {
    challenge: Challenge;
    proof: ProofWithContext;
}

export type {
    Challenge,
    ProofWithContext
}