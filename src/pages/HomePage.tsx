import React from 'react';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
} from 'chart.js';
import { useExpenseStore, type Currency, currencies } from '../lib/store';
import { format } from 'date-fns';
import { AccountIcon } from '../components/AccountIcon';
import { Moon, Sun, ArrowUpCircle, ArrowDownCircle, RotateCcw } from 'lucide-react';
import { Card } from '../components/Card';
import toast from 'react-hot-toast';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale);

type CurrencySectionProps = {
  currency: Currency;
  onResetView: () => void;
};

function CurrencySection({ currency, onResetView }: CurrencySectionProps) {
  const { transactions, categories, accounts } = useExpenseStore();
  const chartRef = React.useRef<ChartJS>(null);

  // Calculate transactions by category
  const transactionsByCategory = categories.map(category => {
    const categoryTransactions = transactions.filter(
      t => t.categoryId === category.id && t.currencyCode === currency.code
    );
    const expenses = categoryTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    const income = categoryTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    return { ...category, expenses, income };
  }).filter(category => category.expenses > 0 || category.income > 0);

  // Get recent transactions
  const recentTransactions = transactions
    .filter(t => t.currencyCode === currency.code)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  // Calculate account balances
  const accountBalances = accounts.map(account => ({
    ...account,
    transactions: transactions.filter(t => t.accountId === account.id),
  }));

  const chartData = {
    labels: transactionsByCategory.map((category) => category.name),
    datasets: [
      {
        data: transactionsByCategory.map((category) => category.expenses),
        backgroundColor: transactionsByCategory.map((category) => category.color),
        borderWidth: 1,
        borderColor: transactionsByCategory.map((category) => category.color),
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: document.documentElement.classList.contains('dark') ? '#f3f4f6' : '#374151',
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const value = context.raw;
            return `${currency.symbol}${value.toFixed(2)}`;
          },
        },
      },
    },
  };

  // Clean up chart on unmount
  React.useEffect(() => {
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, []);

  const totalIncome = transactions
    .filter(t => t.type === 'income' && t.currencyCode === currency.code)
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense' && t.currencyCode === currency.code)
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          {currency.name} ({currency.symbol}) Overview
        </h2>
        <button
          onClick={onResetView}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <RotateCcw className="h-4 w-4" />
          Reset View
        </button>
      </div>
      
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Total Income</h3>
              <div className="mt-2 flex items-center gap-2">
                <ArrowUpCircle className="h-5 w-5 text-green-500" />
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {currency.symbol}{totalIncome.toFixed(2)}
                </p>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Total Expenses</h3>
              <div className="mt-2 flex items-center gap-2">
                <ArrowDownCircle className="h-5 w-5 text-red-500" />
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {currency.symbol}{totalExpenses.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
          {transactionsByCategory.length > 0 ? (
            <div className="mt-6 h-64">
              <Pie
                ref={chartRef}
                data={chartData}
                options={chartOptions}
              />
            </div>
          ) : (
            <p className="mt-4 text-gray-600 dark:text-gray-400 text-center">No transactions in this currency yet</p>
          )}
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Account Balances</h3>
          <div className="space-y-4">
            {accountBalances.map((account) => (
              <div
                key={account.id}
                className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0"
              >
                <div className="flex items-center gap-2">
                  <AccountIcon type={account.type} />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{account.name}</p>
                    {account.type === 'credit' && account.limit && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Limit: {currency.symbol}{account.limit.toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>
                <p className={`font-medium ${
                  account.balance >= 0 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {currency.symbol}{account.balance.toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Recent Transactions</h3>
          <div className="space-y-4">
            {recentTransactions.length > 0 ? (
              recentTransactions.map((transaction) => {
                const category = categories.find(c => c.id === transaction.categoryId);
                const account = accounts.find(a => a.id === transaction.accountId);
                return (
                  <div
                    key={transaction.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0 gap-2"
                  >
                    <div>
                      <span
                        className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                        style={{
                          backgroundColor: category?.color + '20',
                          color: category?.color,
                        }}
                      >
                        {category?.name}
                      </span>
                      <div className="mt-1 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 flex-wrap">
                        <span>{format(new Date(transaction.date), 'MMM d, yyyy')}</span>
                        {account && (
                          <div className="flex items-center gap-1 text-gray-400 dark:text-gray-500">
                            <span>•</span>
                            <AccountIcon type={account.type} />
                            <span>{account.name}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <p className={`text-sm font-medium ${
                      transaction.type === 'income'
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}
                      {currency.symbol}{transaction.amount.toFixed(2)}
                    </p>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-600 dark:text-gray-400 text-center">No recent transactions</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

export function HomePage() {
  const { transactions, defaultCurrency, darkMode, toggleDarkMode } = useExpenseStore();
  const [key, setKey] = React.useState(0); // Add key for forcing re-render

  const uniqueCurrencies = React.useMemo(() => {
    const codes = [...new Set(transactions.map(t => t.currencyCode))];
    return codes.length > 0 
      ? codes.map(code => currencies.find(c => c.code === code)!).filter(Boolean)
      : [defaultCurrency];
  }, [transactions, defaultCurrency]);

  const handleResetView = () => {
    setKey(prev => prev + 1); // Force re-render of currency sections
    toast.success('Dashboard view has been reset');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <button
          onClick={toggleDarkMode}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white/80 dark:bg-gray-800/80 rounded-full shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors self-end sm:self-auto"
        >
          {darkMode ? (
            <>
              <Sun className="h-4 w-4" />
              Light Mode
            </>
          ) : (
            <>
              <Moon className="h-4 w-4" />
              Dark Mode
            </>
          )}
        </button>
      </div>

      {uniqueCurrencies.map((currency) => (
        currency && (
          <CurrencySection 
            key={`${currency.code}-${key}`} 
            currency={currency} 
            onResetView={handleResetView}
          />
        )
      ))}
    </div>
  );
}