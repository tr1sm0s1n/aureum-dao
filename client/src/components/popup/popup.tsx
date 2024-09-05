import { WalletApi } from '@concordium/browser-wallet-api-helpers';
import { ConcordiumGRPCClient, TransactionHash, TransactionKindString, TransactionSummaryType } from '@concordium/web-sdk';
import { useEffect } from 'react';
import swal from 'sweetalert';

interface TransactionAlertProps {
    txHash: string | undefined;
    client:WalletApi | undefined;
  }

  const TransactionAlert: React.FC<TransactionAlertProps> = ({ txHash,client }) => {
    useEffect(() => {
      if (txHash && client) {
    // alert(`Transaction successful! Hash: ${txHash}`);
    const grpcClient = new ConcordiumGRPCClient(client.grpcTransport)
    grpcClient.waitForTransactionFinalization(TransactionHash.fromHexString(txHash)).then((report)=>{
      if (
        report.summary.type === TransactionSummaryType.AccountTransaction &&
        report.summary.transactionType === TransactionKindString.Update
      ) {
        const blockHash = report.blockHash;
        swal("Transaction successful!", `Hash: ${txHash} \n Blockhash: ${blockHash}`, "success");
      }else{
        swal("Transaction failed!", `Hash: ${txHash} \n`, "error");
      }
    });
        
      }
    }, [txHash]);
  
    return null; // This component only handles the alert, so it returns null
  };

export default TransactionAlert
