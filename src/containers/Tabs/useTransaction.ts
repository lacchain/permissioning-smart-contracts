// Libs
import { useState, useCallback } from 'react';

export default () => {
  const [transactions, setTransactions] = useState(new Map<string, string>());

  const addTransaction = useCallback((identifier: string, status: string) => {
    console.log('add', transactions, identifier, status);
    setTransactions(transactions => {
      const updatedTransactions = new Map(transactions);
      updatedTransactions.set(identifier, status);
      return updatedTransactions;
    });
  }, []);

  const updateTransaction = useCallback((identifier: string, status: string) => addTransaction(identifier, status), [
    addTransaction
  ]);

  const deleteTransaction = useCallback((identifier: string) => {
    console.log('delete', transactions, identifier);
    setTransactions(transactions => {
      const updatedTransactions = new Map(transactions);
      updatedTransactions.delete(identifier);
      return updatedTransactions;
    });
  }, []);

  return {
    transactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    setTransactions
  };
};
