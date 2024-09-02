import { useEffect } from 'react';
import swal from 'sweetalert';

interface TransactionAlertProps {
    txHash: string | undefined;
  }

  const TransactionAlert: React.FC<TransactionAlertProps> = ({ txHash }) => {
    useEffect(() => {
      if (txHash) {
        // alert(`Transaction successful! Hash: ${txHash}`);
        swal("Transaction successful!", `Hash: ${txHash}`, "success");
      }
    }, [txHash]);
  
    return null; // This component only handles the alert, so it returns null
  };

export default TransactionAlert
