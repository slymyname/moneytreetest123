import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { useTransactionsByCategory, useTotalExpenses, useTotalIncome, useUniqueCurrencies, useExpenseStore, type Currency } from '../lib/store';
import { Card } from '../components/Card';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

type CurrencyAnalyticsProps = {
  currency: Currency;
  key: string; // Add key prop
};

function CurrencyAnalytics({ currency }: CurrencyAnalyticsProps) {
  const transactionsByCategory = useTransactionsByCategory(currency.code);
  const totalExpenses = useTotalExpenses(currency.code);
  const totalIncome = useTotalIncome(currency.code);

  const chartData = {
    labels: transactionsByCategory.map((category) => category.name),
    datasets: [
      {
        label: 'Income',
        data: transactionsByCategory.map((category) => category.income),
        backgroundColor: transactionsByCategory.map((category) => category.color + '80'),
        stack: 'Stack 0',
      },
      {
        label: 'Expenses',
        data: transactionsByCategory.map((category) => category.expenses),
        backgroundColor: transactionsByCategory.map((category) => category.color),
        stack: 'Stack 1',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          color: '#666',
          callback: (value: number) => `${currency.symbol}${value.toFixed(2)}`,
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#666',
        },
      },
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#666',
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const value = context.raw || 0;
            return `${context.dataset.label}: ${currency.symbol}${value.toFixed(2)}`;
          },
        },
      },
    },
  };

  if (transactionsByCategory.length === 0) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          {currency.name} ({currency.symbol}) Analytics
        </h2>
        <Card>
          <div className="p-6 text-center">
            <p className="text-gray-500 dark:text-gray-400">No transactions recorded in this currency yet.</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
        {currency.name} ({currency.symbol}) Analytics
      </h2>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Total Income</h3>
            <p className="mt-2 text-3xl font-bold text-green-600 dark:text-green-400">
              {currency.symbol}{totalIncome.toFixed(2)}
            </p>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Total Expenses</h3>
            <p className="mt-2 text-3xl font-bold text-red-600 dark:text-red-400">
              {currency.symbol}{totalExpenses.toFixed(2)}
            </p>
          </div>
        </Card>
      </div>

      <Card>
        <div className="p-6">
          <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">
            Category Breakdown
          </h3>
          <div className="h-96">
            <Bar
              data={chartData}
              options={chartOptions}
            />
          </div>
        </div>
      </Card>

      <Card>
        <div className="p-6">
          <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">
            Category Details
          </h3>
          <div className="space-y-4">
            {transactionsByCategory.map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0"
              >
                <div className="flex items-center">
                  <div
                    className="h-4 w-4 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="ml-2 text-sm font-medium text-gray-900 dark:text-white">
                    {category.name}
                  </span>
                </div>
                <div className="text-right space-y-1">
                  {category.income > 0 && (
                    <p className="text-sm font-medium text-green-600 dark:text-green-400">
                      Income: {currency.symbol}{category.income.toFixed(2)}
                    </p>
                  )}
                  {category.expenses > 0 && (
                    <p className="text-sm font-medium text-red-600 dark:text-red-400">
                      Expenses: {currency.symbol}{category.expenses.toFixed(2)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}

export function AnalyticsPage() {
  const { defaultCurrency } = useExpenseStore();
  const uniqueCurrencies = useUniqueCurrencies();
  const [key, setKey] = React.useState(0); // Add key state for forcing re-render

  // Update key when currency changes to force re-render
  React.useEffect(() => {
    setKey(prev => prev + 1);
  }, [defaultCurrency.code]);

  // If no transactions yet, show default currency analytics
  const currenciesToShow = uniqueCurrencies.length > 0 
    ? uniqueCurrencies.filter(Boolean)
    : [defaultCurrency];

  return (
    <div className="space-y-8">
      {currenciesToShow.map(currency => (
        currency && (
          <CurrencyAnalytics 
            key={`${currency.code}-${key}`} // Use compound key
            currency={currency} 
          />
        )
      ))}
    </div>
  );
}