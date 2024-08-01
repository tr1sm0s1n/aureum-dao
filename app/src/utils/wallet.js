import { detectConcordiumProvider } from '@concordium/browser-wallet-api-helpers'
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

export async function init(setConnectedAccount) {
  const client = await detectConcordiumProvider()
  // Listen for relevant events from the wallet.
  client.on('accountChanged', (account) => {
    console.debug('browserwallet event: accountChange', { account })
    setConnectedAccount(account)
  })
  client.on('accountDisconnected', () => {
    console.debug('browserwallet event: accountDisconnected')
    client.getMostRecentlySelectedAccount().then(setConnectedAccount)
  })
  client.on('chainChanged', (chain) => {
    console.debug('browserwallet event: chainChanged', { chain })
  })
  client.getMostRecentlySelectedAccount().then(setConnectedAccount)

  return client
}

export async function connect(client, setConnectedAccount) {
  const account = await client.connect()
  return setConnectedAccount(account)
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
  client,
  description,
  amount,
  senderAddress,
) {
  const connectedToTestnet = await checkConnectedToTestnet(client)
  if (connectedToTestnet) {
    const txHash = await client.sendTransaction(
      senderAddress,
      AccountTransactionType.Update,
      {
        amount: CcdAmount.fromMicroCcd(BigInt(0)),
        //Check whehter we need amount as it is not needed in our contract since we not transferring any tokens
        address: { index: BigInt(CONTRACT_INDEX), subindex: BigInt(0) },
        receiveName: 'DAO.create_proposal',
        maxContractExecutionEnergy: BigInt(30000),
      },
      {
        description: description,
        amount: CcdAmount.fromMicroCcd(BigInt(amount)),
      },
      RAW_SCHEMA_BASE64,
    )
    console.log({ txHash })
    return txHash
  }
}

export async function renounceVotes(
  client,
  contractIndex,
  proposalID,
  votes,
  senderAddress,
) {
  const connectedToTestnet = await checkConnectedToTestnet(client)
  if (connectedToTestnet) {
    const txHash = await client.sendTransaction(
      senderAddress,
      AccountTransactionType.Update,
      {
        amount: CcdAmount.fromMicroCcd(BigInt(0)),
        //Check whehter we need amount as it is not needed in our contract since we not transferring any tokens
        address: { index: BigInt(contractIndex), subindex: BigInt(0) },
        receiveName: 'DAO.create_proposal',
        maxContractExecutionEnergy: BigInt(30000),
      },
      {
        proposal_id: proposalID,
        votes: votes,
      },
      RAW_SCHEMA_BASE64,
    )
    console.log({ txHash })
    return txHash
  }
}

export async function insertFunds(client, amount, senderAddress) {
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
      }, //Only sending funds no parameters involved.
    )
    console.log({ txHash })
    return txHash
  }
}

export async function voteForProposal(
  client,
  contractIndex,
  proposalID,
  vote_decision,
  senderAddress,
) {
  const connectedToTestnet = await checkConnectedToTestnet(client)
  if (connectedToTestnet) {
    const txHash = await client.sendTransaction(
      senderAddress,
      AccountTransactionType.Update,
      {
        // amount: CcdAmount.fromMicroCcd(BigInt(0)),
        address: { index: BigInt(contractIndex), subindex: BigInt(0) },
        receiveName: 'DAO.vote',
        maxContractExecutionEnergy: BigInt(30000),
      },
      {
        proposal_id: proposalID,
        vote_for: vote_decision,
      },
      RAW_SCHEMA_BASE64,
    )
    console.log({ txHash })
    return txHash
  }
}

export async function withdrawFunds(
  client,
  contractIndex,
  proposalID,
  senderAddress,
) {
  const connectedToTestnet = await checkConnectedToTestnet(client)
  if (connectedToTestnet) {
    const txHash = await client.sendTransaction(
      senderAddress,
      AccountTransactionType.Update,
      {
        // amount: CcdAmount.fromMicroCcd(BigInt(0)),
        address: { index: BigInt(contractIndex), subindex: BigInt(0) },
        receiveName: 'DAO.withdraw',
        maxContractExecutionEnergy: BigInt(30000),
      },
      {
        proposalID, //Need to check because it is not having any key in the schema.bin file so we have to pass only proposalID or with header need to work on it.
      },
      RAW_SCHEMA_BASE64,
    )
    console.log({ txHash })
    return txHash
  }
}

export async function getAllMembers(client) {
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

export async function getPower(client, account) {
  let param = serializeUpdateContractParameters(
    ContractName.fromString(CONTRACT_NAME),
    EntrypointName.fromString('get_power'),
    account,
    toBuffer(RAW_SCHEMA_BASE64, 'base64'),
    SchemaVersion.V2,
    true,
  )

  const res = await client.getGrpcClient().invokeContract({
    contract: { index: BigInt(CONTRACT_INDEX), subindex: BigInt(0) },
    method: 'DAO.get_power',
    paramter: param,
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

export async function getAllProposals(client) {
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
