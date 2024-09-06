export interface ProposalArray extends Array<[bigint, ProposalData]> {}

export interface ProposalData {
  amount: string
  contributers: string[]
  description: string
  proposer: string
  status: ActiveStatus | ApprovedStatus | CollectedStatus
  votes: bigint
}

export type { Challenge, ProofWithContext }

interface Challenge {
  challenge: Uint8Array
}

interface ProofWithContext {
  credential: string
  proof: any
}

interface ActiveStatus {
  Active: any[]
}

interface ApprovedStatus {
  Approved: any[]
}

interface CollectedStatus {
  Collected: any[]
}