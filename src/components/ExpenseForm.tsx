import React from 'react';
import { useNavigate } from 'react-router-dom';
import { formatISO } from 'date-fns';
import toast from 'react-hot-toast';
import { useExpenseStore, parseAmount } from '../lib/store';
import { CategoryIcon } from './CategoryIcon';
import { AccountIcon } from './AccountIcon';

type ExpenseFormProps = {
  initialDate?: string;
  onSuccess?: () => void;
};

export function ExpenseForm({ initialDate, onSuccess }: ExpenseFormProps) {
  const navigate = useNavigate();
  const { categories, accounts, addTransaction, defaultCurrency } = useExpenseStore();
  const [amount, setAmount] = React.useState('');
  const [categoryId, setCategoryId] = React.useState(categories[0]?.id || '');
  const [accountId, setAccountId] = React.useState(accounts[0]?.id || '');
  const [date, setDate] = React.useState(initialDate || formatISO(new Date(), { representation: 'date' }));
  const [notes, setNotes] = React.useState('');

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Allow only numbers, commas, dots, and currency symbols
    const sanitized = value.replace(/[^\d.,€$£¥]/g, '');
    
    // If EUR, allow European format
    if (defaultCurrency.code === 'EUR') {
      // Allow one comma for decimal separator and dots for thousands
      const parts = sanitized.split(',');
      if (parts.length <= 2) {
        setAmount(sanitized);
      }
    } else {
      // For other currencies, use standard format
      const parts = sanitized.split('.');
      if (parts.length <= 2) {
        setAmount(sanitized);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !categoryId || !date || !accountId) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const parsedAmount = parseAmount(amount, defaultCurrency);
      const selectedAccount = accounts.find(a => a.id === accountId);

      if (!selectedAccount) {
        toast.error('Please select a valid account');
        return;
      }

      // Check credit limit for credit accounts
      if (selectedAccount.type === 'credit' && selectedAccount.limit !== undefined) {
        const newBalance = selectedAccount.balance - parsedAmount;
        if (Math.abs(newBalance) > selectedAccount.limit) {
          toast.error(`This expense would exceed your credit limit of ${defaultCurrency.symbol}${selectedAccount.limit}`);
          return;
        }
      }

      // Check sufficient balance for non-credit accounts
      if (selectedAccount.type !== 'credit' && selectedAccount.balance < parsedAmount) {
        toast.error(`Insufficient balance in ${selectedAccount.name}. Available: ${defaultCurrency.symbol}${selectedAccount.balance.toFixed(2)}`);
        return;
      }

      addTransaction({
        amount: parsedAmount,
        categoryId,
        accountId,
        date,
        notes,
        currencyCode: defaultCurrency.code,
        type: 'expense',
      });

      toast.success('Expense added successfully');
      
      // Reset form
      setAmount('');
      setNotes('');
      
      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/');
      }
    } catch (error) {
      toast.error('Invalid amount format');
    }
  };

  const selectedCategory = categories.find(c => c.id === categoryId);
  const selectedAccount = accounts.find(a => a.id === accountId);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Amount
        </label>
        <div className="mt-1">
          <input
            type="text"
            id="amount"
            value={amount}
            onChange={handleAmountChange}
            placeholder={defaultCurrency.code === 'EUR' ? '1.234,56 €' : `${defaultCurrency.symbol}1,234.56`}
            className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm dark:bg-gray-700 dark:text-white"
            required
          />
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {defaultCurrency.code === 'EUR' ? 
              'Use comma (,) as decimal separator and dot (.) for thousands' :
              'Use dot (.) as decimal separator and comma (,) for thousands'
            }
          </p>
        </div>
      </div>

      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Category
        </label>
        <div className="mt-1">
          <select
            id="category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm dark:bg-gray-700 dark:text-white"
            required
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        {selectedCategory && (
          <div className="mt-2 flex items-center gap-2">
            {selectedCategory.icon && <CategoryIcon category={selectedCategory.icon} />}
            <span
              className="rounded-full px-2.5 py-0.5 text-xs font-medium"
              style={{
                backgroundColor: selectedCategory.color + '20',
                color: selectedCategory.color,
              }}
            >
              {selectedCategory.name}
            </span>
          </div>
        )}
      </div>

      <div>
        <label htmlFor="account" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Payment Method
        </label>
        <div className="mt-1">
          <select
            id="account"
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm dark:bg-gray-700 dark:text-white"
            required
          >
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name} ({defaultCurrency.symbol}{account.balance.toFixed(2)})
                {account.type === 'credit' && account.limit !== undefined && 
                  ` - Limit: ${defaultCurrency.symbol}${account.limit.toFixed(2)}`}
              </option>
            ))}
          </select>
        </div>
        {selectedAccount && (
          <div className="mt-2 flex items-center gap-2">
            <AccountIcon type={selectedAccount.type} />
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Available: {defaultCurrency.symbol}
              {selectedAccount.type === 'credit' 
                ? ((selectedAccount.limit || 0) + selectedAccount.balance).toFixed(2)
                : selectedAccount.balance.toFixed(2)}
            </span>
          </div>
        )}
      </div>

      <div>
        <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Date
        </label>
        <div className="mt-1">
          <input
            type="date"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm dark:bg-gray-700 dark:text-white"
            required
          />
        </div>
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Notes (Optional)
        </label>
        <div className="mt-1">
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>

      <button
        type="submit"
        className="w-full rounded-md bg-gradient-to-r from-green-600 to-yellow-500 px-4 py-2 text-sm font-medium text-white hover:from-green-700 hover:to-yellow-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
      >
        Add Expense
      </button>
    </form>
  );
}