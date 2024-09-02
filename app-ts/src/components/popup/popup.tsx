import { useEffect } from 'react';

interface TransactionAlertProps {
    txHash: string | undefined;
  }

  const TransactionAlert: React.FC<TransactionAlertProps> = ({ txHash }) => {
    useEffect(() => {
      if (txHash) {
        alert(`Transaction successful! Hash: ${txHash}`);
      }
    }, [txHash]);
  
    return null; // This component only handles the alert, so it returns null
  };

export default TransactionAlert
