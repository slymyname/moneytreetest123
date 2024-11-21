import React from 'react';
import { format, parseISO } from 'date-fns';
import { useExpenseStore } from '../lib/store';
import { CategoryIcon } from '../components/CategoryIcon';
import { Dialog } from '@headlessui/react';
import toast from 'react-hot-toast';
import { ChevronDown, ArrowUpCircle, ArrowDownCircle, Trash2 } from 'lucide-react';

export function ExpensesOverviewPage() {
  const { transactions, categories, defaultCurrency, deleteTransaction } = useExpenseStore();
  const [selectedDate, setSelectedDate] = React.useState<string | null>(null);
  const [transactionToDelete, setTransactionToDelete] = React.useState<string | null>(null);

  // Get unique dates from transactions and sort them in reverse chronological order
  const uniqueDates = React.useMemo(() => {
    const dates = [...new Set(transactions.map(t => t.date))];
    return dates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  }, [transactions]);

  // Set initial selected date or update if current date is no longer valid
  React.useEffect(() => {
    if (uniqueDates.length > 0) {
      if (!selectedDate || !uniqueDates.includes(selectedDate)) {
        setSelectedDate(uniqueDates[0]);
      }
    } else {
      setSelectedDate(null);
    }
  }, [uniqueDates, selectedDate]);

  // Get transactions for selected date
  const selectedDateTransactions = React.useMemo(() => {
    if (!selectedDate) return [];
    return transactions
      .filter(t => t.date === selectedDate)
      .sort((a, b) => {
        // Sort by type (income first) and then by amount
        if (a.type !== b.type) {
          return a.type === 'income' ? -1 : 1;
        }
        return b.amount - a.amount;
      });
  }, [transactions, selectedDate]);

  // Group transactions by category
  const transactionsByCategory = React.useMemo(() => {
    if (!selectedDate) return [];
    
    return categories.map(category => {
      const categoryTransactions = selectedDateTransactions.filter(t => t.categoryId === category.id);
      const expenses = categoryTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      const income = categoryTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      
      return {
        ...category,
        transactions: categoryTransactions,
        expenses,
        income,
      };
    }).filter(category => category.transactions.length > 0);
  }, [categories, selectedDateTransactions, selectedDate]);

  // Calculate totals
  const { totalExpenses, totalIncome } = React.useMemo(() => {
    return selectedDateTransactions.reduce((acc, t) => {
      if (t.type === 'expense') {
        acc.totalExpenses += t.amount;
      } else {
        acc.totalIncome += t.amount;
      }
      return acc;
    }, { totalExpenses: 0, totalIncome: 0 });
  }, [selectedDateTransactions]);

  const handleDeleteTransaction = () => {
    if (transactionToDelete) {
      try {
        deleteTransaction(transactionToDelete);
        toast.success('Transaction deleted successfully');
        setTransactionToDelete(null);
      } catch (error) {
        toast.error('Failed to delete transaction. Please try again.');
      }
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDate = e.target.value;
    if (newDate && uniqueDates.includes(newDate)) {
      setSelectedDate(newDate);
    }
  };

  if (uniqueDates.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Transactions Overview</h1>
        <div className="rounded-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 shadow-lg text-center">
          <p className="text-gray-500 dark:text-gray-400">No transactions recorded yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Transactions Overview</h1>
        <div className="relative">
          <select
            value={selectedDate || ''}
            onChange={handleDateChange}
            className="w-full sm:w-auto appearance-none rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-green-500 focus:ring-green-500 text-base sm:text-sm dark:bg-gray-800 dark:text-gray-200 py-2 pl-4 pr-10"
          >
            {uniqueDates.map(date => (
              <option key={date} value={date}>
                {format(parseISO(date), 'MMMM d, yyyy')}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {selectedDate && selectedDateTransactions.length > 0 ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-4 sm:p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                Summary for {format(parseISO(selectedDate), 'MMM d, yyyy')}
              </h2>
              <div className="space-y-1 text-right">
                {totalIncome > 0 && (
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                    <ArrowUpCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      +{defaultCurrency.symbol}{totalIncome.toFixed(2)}
                    </span>
                  </div>
                )}
                {totalExpenses > 0 && (
                  <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                    <ArrowDownCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      -{defaultCurrency.symbol}{totalExpenses.toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  Net: {defaultCurrency.symbol}{(totalIncome - totalExpenses).toFixed(2)}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {selectedDateTransactions.map(transaction => {
                const category = categories.find(c => c.id === transaction.categoryId);
                if (!category) return null;

                return (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700 last:border-0"
                  >
                    <div className="flex items-center gap-2">
                      {category.icon && <CategoryIcon category={category.icon} />}
                      <div>
                        <span
                          className="rounded-full px-2.5 py-0.5 text-xs font-medium"
                          style={{
                            backgroundColor: category.color + '20',
                            color: category.color,
                          }}
                        >
                          {category.name}
                        </span>
                        {transaction.notes && (
                          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            {transaction.notes}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`font-medium ${
                        transaction.type === 'income' 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}
                        {defaultCurrency.symbol}{transaction.amount.toFixed(2)}
                      </span>
                      <button
                        onClick={() => setTransactionToDelete(transaction.id)}
                        className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                        aria-label="Delete transaction"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-4 sm:p-6 shadow-lg">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
              Category Summary
            </h2>
            <div className="space-y-6">
              {transactionsByCategory.map(category => (
                <div key={category.id} className="space-y-3">
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
                  <div className="pl-4 sm:pl-8">
                    {category.income > 0 && (
                      <div className="text-sm font-medium text-green-600 dark:text-green-400">
                        Income: +{defaultCurrency.symbol}{category.income.toFixed(2)}
                      </div>
                    )}
                    {category.expenses > 0 && (
                      <div className="text-sm font-medium text-red-600 dark:text-red-400">
                        Expenses: -{defaultCurrency.symbol}{category.expenses.toFixed(2)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 shadow-lg text-center">
          <p className="text-gray-500 dark:text-gray-400">No transactions recorded for this date.</p>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={transactionToDelete !== null}
        onClose={() => setTransactionToDelete(null)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
        
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-sm w-full rounded-xl bg-white dark:bg-gray-800 p-6 shadow-xl">
            <Dialog.Title className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Delete Transaction
            </Dialog.Title>
            
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Are you sure you want to delete this transaction? This action cannot be undone.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <button
                onClick={() => setTransactionToDelete(null)}
                className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md touch-manipulation"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteTransaction}
                className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 rounded-md touch-manipulation"
              >
                Delete
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}