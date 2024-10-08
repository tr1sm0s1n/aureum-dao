import {
  SmartContractParameters,
  WalletApi,
} from '@concordium/browser-wallet-api-helpers'
import {
  AccountTransactionType,
  CcdAmount,
  ContractName,
  EntrypointName,
  deserializeReceiveReturnValue,
  toBuffer,
  SchemaVersion,
  UpdateContractPayload,
  ConcordiumGRPCClient,
  ContractAddress,
  ReceiveName,
  BlockHash,
  TransactionHash,
  TransactionSummaryType,
  TransactionKindString,
} from '@concordium/web-sdk'
import {
  CONTRACT_INDEX,
  CONTRACT_NAME,
  RAW_SCHEMA_BASE64,
  TESTNET_GENESIS_BLOCK_HASH,
} from '../config/config'
import Swal from 'sweetalert2'

// Check if the user is connected to the testnet chain by checking if the testnet genesisBlock exists.
async function checkConnectedToTestnet(client: WalletApi) {
  let grpcClient = new ConcordiumGRPCClient(client.grpcTransport)
  return grpcClient
    .getCryptographicParameters(
      BlockHash.fromHexString(TESTNET_GENESIS_BLOCK_HASH)
    )
    .then((result) => {
      if (result === undefined) {
        Swal.fire({
          title: 'Cannot Proceed',
          text: 'Check if your Concordium browser wallet is connected to testnet!',
          icon: 'warning',
        })
        return false
      }
      return true
    })
}

export async function createProposal(
  client: WalletApi,
  description: string,
  amount: number,
  senderAddress: string
) {
  const connectedToTestnet = await checkConnectedToTestnet(client)
  if (connectedToTestnet) {
    const txHash = await client.sendTransaction(
      senderAddress,
      AccountTransactionType.Update,
      {
        maxContractExecutionEnergy: BigInt(30000),
        amount: CcdAmount.fromMicroCcd(BigInt(0)),
        address: { index: BigInt(CONTRACT_INDEX), subindex: BigInt(0) },
        receiveName: 'DAO.create_proposal',
      } as unknown as UpdateContractPayload,
      {
        description: description,
        amount: CcdAmount.fromMicroCcd(BigInt(amount)),
      } as unknown as SmartContractParameters,
      RAW_SCHEMA_BASE64
    )
    console.log({ txHash })
    return txHash
  }
}
export async function renounceVotes(
  client: WalletApi,
  proposalID: bigint,
  votes: bigint,
  senderAddress: string
) {
  const connectedToTestnet = await checkConnectedToTestnet(client)
  if (connectedToTestnet) {
    const txHash = await client.sendTransaction(
      senderAddress,
      AccountTransactionType.Update,
      {
        amount: CcdAmount.fromMicroCcd(BigInt(0)),
        address: { index: BigInt(CONTRACT_INDEX), subindex: BigInt(0) },
        receiveName: 'DAO.renounce',
        maxContractExecutionEnergy: BigInt(30000),
      } as unknown as UpdateContractPayload,
      {
        proposal_id: proposalID,
        votes: votes,
      } as unknown as SmartContractParameters,
      RAW_SCHEMA_BASE64
    )
    console.log({ txHash })
    return txHash
  }
}

export async function insertFunds(
  client: WalletApi,
  amount: number,
  senderAddress: string
) {
  const connectedToTestnet = await checkConnectedToTestnet(client)
  if (connectedToTestnet) {
    const txHash = await client.sendTransaction(
      senderAddress,
      AccountTransactionType.Update,
      {
        amount: CcdAmount.fromMicroCcd(BigInt(amount)), //Payable
        address: { index: BigInt(CONTRACT_INDEX), subindex: BigInt(0) },
        receiveName: 'DAO.insert',
        maxContractExecutionEnergy: BigInt(30000),
      } as unknown as UpdateContractPayload //Only sending funds no parameters involved.
    )
    console.log({ txHash })
    return txHash
  }
}

export async function voteForProposal(
  client: WalletApi,
  proposalID: bigint,
  vote_decision: number,
  senderAddress: string
) {
  const connectedToTestnet = await checkConnectedToTestnet(client)
  if (connectedToTestnet) {
    const txHash = await client.sendTransaction(
      senderAddress,
      AccountTransactionType.Update,
      {
        amount: CcdAmount.fromMicroCcd(BigInt(0)),
        address: { index: BigInt(CONTRACT_INDEX), subindex: BigInt(0) },
        receiveName: 'DAO.vote',
        maxContractExecutionEnergy: BigInt(30000),
      } as unknown as UpdateContractPayload,
      {
        proposal_id: proposalID,
        votes: BigInt(vote_decision),
      } as unknown as SmartContractParameters,
      RAW_SCHEMA_BASE64
    )
    console.log({ txHash })
    return txHash
  }
}

export async function withdrawFunds(
  client: WalletApi,
  proposalID: bigint,
  senderAddress: string
) {
  const connectedToTestnet = await checkConnectedToTestnet(client)
  if (connectedToTestnet) {
    const txHash = await client.sendTransaction(
      senderAddress,
      AccountTransactionType.Update,
      {
        amount: CcdAmount.fromMicroCcd(BigInt(0)),
        address: { index: BigInt(CONTRACT_INDEX), subindex: BigInt(0) },
        receiveName: 'DAO.withdraw',
        maxContractExecutionEnergy: BigInt(30000),
      } as unknown as UpdateContractPayload,
      {
        proposal_id: proposalID,
      } as unknown as SmartContractParameters,
      RAW_SCHEMA_BASE64
    )
    console.log({ txHash })
    return txHash
  }
}

export async function getAllMembers(client: WalletApi) {
  const grpcClient = new ConcordiumGRPCClient(client.grpcTransport)
  const res = await grpcClient.invokeContract({
    contract: ContractAddress.create(CONTRACT_INDEX, 0),
    method: ReceiveName.fromString('DAO.all_members'),
  })

  let members = deserializeReceiveReturnValue(
    toBuffer(res.returnValue!.toString(), 'hex'),
    toBuffer(RAW_SCHEMA_BASE64, 'base64'),
    ContractName.fromString(CONTRACT_NAME),
    EntrypointName.fromString('all_members'),
    SchemaVersion.V2
  )

  return members
}

export async function getAllProposals(client: WalletApi) {
  const grpcClient = new ConcordiumGRPCClient(client.grpcTransport)
  const res = await grpcClient.invokeContract({
    contract: ContractAddress.create(CONTRACT_INDEX, 0),
    method: ReceiveName.fromString('DAO.all_proposals'),
  })

  let proposals = deserializeReceiveReturnValue(
    toBuffer(res.returnValue!.toString(), 'hex'),
    toBuffer(RAW_SCHEMA_BASE64, 'base64'),
    ContractName.fromString(CONTRACT_NAME),
    EntrypointName.fromString('all_proposals'),
    SchemaVersion.V2
  )

  return proposals
}

export async function getTransactionReceipt(client: WalletApi, txHash: string) {
  const grpcClient = new ConcordiumGRPCClient(client.grpcTransport)
  try {
    Swal.fire({
      text: 'Waiting for transaction receipt..',
      allowEscapeKey: false,
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading()
      },
    })
    const report = await grpcClient.waitForTransactionFinalization(
      TransactionHash.fromHexString(txHash)
    )
    Swal.close()
    if (
      report.summary.type === TransactionSummaryType.AccountTransaction &&
      report.summary.transactionType === TransactionKindString.Update
    ) {
      Swal.fire({
        title: 'Transaction successful!',
        text: `Transaction Hash: ${txHash}\n Blockhash: ${report.blockHash}`,
        icon: 'success',
      })
    } else {
      Swal.fire({
        title: 'Transaction failed!',
        text: `Transaction Hash: ${txHash}`,
        icon: 'error',
      })
    }
  } catch (error) {
    Swal.fire({
      title: 'Error occured!',
      text: String(error),
      icon: 'error',
    })
  }
}
