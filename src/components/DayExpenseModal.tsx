import React from 'react';
import { Dialog } from '@headlessui/react';
import { format, parseISO } from 'date-fns';
import { X, Pencil, Trash2, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { useExpenseStore } from '../lib/store';
import { CategoryIcon } from './CategoryIcon';
import { AccountIcon } from './AccountIcon';

type DayExpenseModalProps = {
  date: Date;
  onClose: () => void;
};

export function DayExpenseModal({ date, onClose }: DayExpenseModalProps) {
  const { transactions, categories, accounts, defaultCurrency, deleteTransaction } = useExpenseStore();
  const [showByCategory, setShowByCategory] = React.useState(false);
  const [transactionToDelete, setTransactionToDelete] = React.useState<string | null>(null);

  const dayTransactions = transactions.filter((transaction) =>
    format(parseISO(transaction.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
  );

  const transactionsByCategory = categories.map(category => {
    const categoryTransactions = dayTransactions.filter(transaction => transaction.categoryId === category.id);
    const expenses = categoryTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    const income = categoryTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    return {
      ...category,
      transactions: categoryTransactions.map(transaction => ({
        ...transaction,
        account: accounts.find(a => a.id === transaction.accountId),
      })),
      expenses,
      income,
    };
  }).filter(category => category.transactions.length > 0);

  const totalIncome = dayTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = dayTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const handleDeleteTransaction = () => {
    if (transactionToDelete) {
      deleteTransaction(transactionToDelete);
      setTransactionToDelete(null);
    }
  };

  return (
    <>
      <Dialog open={true} onClose={onClose} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-2xl w-full rounded-xl bg-white p-6 shadow-lg dark:bg-gray-800">
            <div className="flex items-center justify-between mb-6">
              <Dialog.Title className="text-lg font-semibold text-gray-900 dark:text-white">
                Transactions for {format(date, 'MMMM d, yyyy')}
              </Dialog.Title>
              <button
                onClick={onClose}
                className="rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-4 flex items-center justify-between">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {dayTransactions.length} transaction{dayTransactions.length !== 1 && 's'}
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowByCategory(!showByCategory)}
                  className={`text-sm font-medium ${
                    showByCategory ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {showByCategory ? 'Show List' : 'Show by Category'}
                </button>
                <div className="space-y-1 text-right">
                  {totalIncome > 0 && (
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                      <ArrowUpCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        {defaultCurrency.symbol}{totalIncome.toFixed(2)}
                      </span>
                    </div>
                  )}
                  {totalExpenses > 0 && (
                    <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                      <ArrowDownCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        {defaultCurrency.symbol}{totalExpenses.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {showByCategory ? (
                transactionsByCategory.map(category => (
                  <div
                    key={category.id}
                    className="rounded-lg border border-gray-200 dark:border-gray-700 p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {category.icon && <CategoryIcon category={category.icon} />}
                        <span
                          className="rounded-full px-2.5 py-0.5 text-xs font-medium"
                          style={{
                            backgroundColor: category.color + '20',
                            color: category.color,
                          }}
                        >
                          {category.name}
                        </span>
                      </div>
                      <div className="space-y-1 text-right">
                        {category.income > 0 && (
                          <span className="text-sm font-medium text-green-600 dark:text-green-400">
                            +{defaultCurrency.symbol}{category.income.toFixed(2)}
                          </span>
                        )}
                        {category.expenses > 0 && (
                          <span className="text-sm font-medium text-red-600 dark:text-red-400">
                            -{defaultCurrency.symbol}{category.expenses.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      {category.transactions.map(transaction => (
                        <div
                          key={transaction.id}
                          className="flex items-center justify-between text-sm"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-gray-600 dark:text-gray-400">
                              {transaction.notes || 'No description'}
                            </span>
                            {transaction.account && (
                              <div className="flex items-center gap-1 text-gray-400 dark:text-gray-500">
                                <span>•</span>
                                <AccountIcon type={transaction.account.type} />
                                <span>{transaction.account.name}</span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={transaction.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                              {transaction.type === 'income' ? '+' : '-'}
                              {defaultCurrency.symbol}{transaction.amount.toFixed(2)}
                            </span>
                            <button
                              onClick={() => setTransactionToDelete(transaction.id)}
                              className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {dayTransactions.map((transaction) => {
                    const category = categories.find(c => c.id === transaction.categoryId);
                    const account = accounts.find(a => a.id === transaction.accountId);
                    return (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between py-4 first:pt-0 last:pb-0"
                      >
                        <div className="flex items-center gap-4">
                          {category?.icon && (
                            <CategoryIcon category={category.icon} />
                          )}
                          <div>
                            <div className="flex items-center gap-2">
                              <span
                                className="rounded-full px-2.5 py-0.5 text-xs font-medium"
                                style={{
                                  backgroundColor: category?.color + '20',
                                  color: category?.color,
                                }}
                              >
                                {category?.name}
                              </span>
                              {account && (
                                <div className="flex items-center gap-1 text-gray-400 dark:text-gray-500">
                                  <AccountIcon type={account.type} />
                                  <span>{account.name}</span>
                                </div>
                              )}
                            </div>
                            {transaction.notes && (
                              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                {transaction.notes}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className={`text-sm font-medium ${
                            transaction.type === 'income' 
                              ? 'text-green-600 dark:text-green-400' 
                              : 'text-red-600 dark:text-red-400'
                          }`}>
                            {transaction.type === 'income' ? '+' : '-'}
                            {defaultCurrency.symbol}
                            {transaction.amount.toFixed(2)}
                          </span>
                          <div className="flex items-center">
                            <button
                              onClick={() => {
                                // TODO: Implement edit functionality
                              }}
                              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setTransactionToDelete(transaction.id)}
                              className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      {transactionToDelete && (
        <Dialog
          open={true}
          onClose={() => setTransactionToDelete(null)}
          className="relative z-50"
        >
          <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
          
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="mx-auto max-w-sm rounded-lg bg-white dark:bg-gray-800 p-6 shadow-xl">
              <Dialog.Title className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Delete Transaction
              </Dialog.Title>
              
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Are you sure you want to delete this transaction? This action cannot be undone.
              </p>
              
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setTransactionToDelete(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteTransaction}
                  className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 rounded-md"
                >
                  Delete
                </button>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>
      )}
    </>
  );
}