import { detectConcordiumProvider, SmartContractParameters, WalletApi } from '@concordium/browser-wallet-api-helpers'
import {
  AccountTransactionType,
  CcdAmount,
  // ConcordiumGRPCClient,
  // ContractAddress,
  ContractName,
  EntrypointName,
  // ModuleReference,
  // ReceiveName,
  serializeUpdateContractParameters,
  Parameter,
  ReturnValue,
  deserializeReceiveReturnValue,
  toBuffer,
  SchemaVersion,
  Address,
  UpdateContractPayload,
} from '@concordium/web-sdk'
import {
  CONTRACT_INDEX,
  CONTRACT_NAME,
  RAW_SCHEMA_BASE64,
  TESTNET_GENESIS_BLOCK_HASH,
} from '../config/config'

BigInt.prototype.toJSON = function () {
  return this.toString()
}

// Check if the user is connected to the testnet chain by checking if the testnet genesisBlock exists.
async function checkConnectedToTestnet(client) {
  return client
    .getGrpcClient()
    .getCryptographicParameters(TESTNET_GENESIS_BLOCK_HASH.toString())
    .then((result) => {
      if (result === undefined || result?.value === null) {
        window.alert(
          'Check if your Concordium browser wallet is connected to testnet!',
        )
        return false
      }
      return true
    })
}

// export async function createElection(
//     client,
//     contractName,
//     description,
//     options,
//     deadlineMinutesInput,
//     moduleRef,
//     senderAddress
// ) {
//     const connectedToTestnet = await checkConnectedToTestnet(client);

//     if (connectedToTestnet) {
//         const deadlineMinutes = Number.parseInt(deadlineMinutesInput, 10);
//         const deadlineTimestamp = moment().add(deadlineMinutes, 'm').format();

//         const parameter = {
//             description,
//             options,
//             end_time: deadlineTimestamp,
//         };

//         const txHash = await client.sendTransaction(
//             senderAddress,
//             AccountTransactionType.InitContract,
//             {
//                 amount: CcdAmount.fromMicroCcd(BigInt(0)),
//                 moduleRef: ModuleReference.fromHexString(moduleRef),
//                 initName: contractName,
//                 maxContractExecutionEnergy: BigInt(30000),
//             },
//             parameter,
//             RAW_SCHEMA_BASE64
//         );
//         console.log({ txHash });
//         return txHash;
//     }
// }

// export async function getView(client, contractIndex) {
//     return client.getGrpcClient().invokeContract({
//         contract: { index: BigInt(contractIndex), subindex: BigInt(0) },
//         method: 'voting.view',
//     });
// }

// export async function getVotes(client, contractIndex, numOptions) {
//     const promises = [];

//     const grpcClient = new ConcordiumGRPCClient(client.grpcTransport);
//     for (let i = 0; i < numOptions; i++) {
//         const param = serializeUpdateContractParameters(
//             ContractName.fromString('voting'),
//             EntrypointName.fromString('getNumberOfVotes'),
//             {
//                 vote_index: i,
//             },
//             toBuffer(RAW_SCHEMA_BASE64, 'base64')
//         );

//         const promise = grpcClient.invokeContract({
//             contract: ContractAddress.create(contractIndex, 0),
//             method: ReceiveName.fromString('voting.getNumberOfVotes'),
//             parameter: param,
//         });

//         promises.push(promise);
//     }

//     return Promise.all(promises);
// }

// export async function castVote(client, contractIndex, vote, senderAddress) {
//     if (vote === -1) {
//         window.alert('Select one option.');
//         return;
//     }

//     const connectedToTestnet = await checkConnectedToTestnet(client);
//     if (connectedToTestnet) {
//         const txHash = await client.sendTransaction(
//             senderAddress,
//             AccountTransactionType.Update,
//             {
//                 amount: CcdAmount.fromMicroCcd(BigInt(0)),
//                 address: { index: BigInt(contractIndex), subindex: BigInt(0) },
//                 receiveName: 'voting.vote',
//                 maxContractExecutionEnergy: BigInt(30000),
//             },
//             { vote_index: vote },
//             RAW_SCHEMA_BASE64
//         );
//         console.log({ txHash });
//         return txHash;
//     }
// }
export async function createProposal(
  client: WalletApi,
  description: string,
  amount: string,
  senderAddress: string,
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
      RAW_SCHEMA_BASE64,
    )
    console.log({ txHash })
    return txHash
  }
}
export async function renounceVotes(client: WalletApi, proposalID: string, votes: string, senderAddress: string) {
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
      RAW_SCHEMA_BASE64,
    )
    console.log({ txHash })
    return txHash
  }
}

export async function insertFunds(client: WalletApi, amount: string, senderAddress: string) {
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
      } as unknown as UpdateContractPayload, //Only sending funds no parameters involved.
    )
    console.log({ txHash })
    return txHash
  }
}

export async function voteForProposal(
  client: WalletApi,
  proposalID: string,
  vote_decision: string,
  senderAddress: string,
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
      RAW_SCHEMA_BASE64,
    )
    console.log({ txHash })
    return txHash
  }
}

export async function withdrawFunds(client: WalletApi, proposalID: string, senderAddress: string) {
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
      RAW_SCHEMA_BASE64,
    )
    console.log({ txHash })
    return txHash
  }
}

export async function getAllMembers(client:WalletApi) {
  const res = await client.getGrpcClient().invokeContract({
    contract: { index: BigInt(CONTRACT_INDEX), subindex: BigInt(0) },
    method: 'DAO.all_members',
  })

  let members = deserializeReceiveReturnValue(
    toBuffer(res.returnValue, 'hex'),
    toBuffer(RAW_SCHEMA_BASE64, 'base64'),
    ContractName.fromString(CONTRACT_NAME),
    EntrypointName.fromString('all_members'),
    SchemaVersion.V2,
  )

  console.log(members)
  return members
}

export async function getPower(client:WalletApi, account:string) {
  let param = serializeUpdateContractParameters(
    ContractName.fromString(CONTRACT_NAME),
    EntrypointName.fromString('get_power'),
    { address: account },
    toBuffer(RAW_SCHEMA_BASE64, 'base64'),
    SchemaVersion.V2,
    true,
  )

  const res = await client.getGrpcClient().invokeContract({
    contract: { index: BigInt(CONTRACT_INDEX), subindex: BigInt(0) },
    method: 'DAO.get_power',
    parameter: param,
  })

  console.log('SSS', res)

  // let power = deserializeReceiveReturnValue(
  //   toBuffer(res.returnValue, 'hex'),
  //   toBuffer(RAW_SCHEMA_BASE64, 'base64'),
  //   ContractName.fromString(CONTRACT_NAME),
  //   EntrypointName.fromString('get_power'),
  //   SchemaVersion.V2,
  // )

  // console.log('powww', power)

  // return power
}

export async function getAllProposals(client:WalletApi) {
  const res = await client.getGrpcClient().invokeContract({
    contract: { index: BigInt(CONTRACT_INDEX), subindex: BigInt(0) },
    method: 'DAO.all_proposals',
  })

  let proposals = deserializeReceiveReturnValue(
    toBuffer(res.returnValue, 'hex'),
    toBuffer(RAW_SCHEMA_BASE64, 'base64'),
    ContractName.fromString(CONTRACT_NAME),
    EntrypointName.fromString('all_proposals'),
    SchemaVersion.V2,
  )

  return proposals
}