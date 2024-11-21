import React from 'react';
import { useNavigate } from 'react-router-dom';
import { formatISO } from 'date-fns';
import toast from 'react-hot-toast';
import { useExpenseStore } from '../lib/store';
import { AccountIcon } from '../components/AccountIcon';

export function AddIncomePage() {
  const navigate = useNavigate();
  const { accounts, targets, addTransaction, updateTarget, defaultCurrency } = useExpenseStore();
  const [amount, setAmount] = React.useState('');
  const [accountId, setAccountId] = React.useState('');
  const [targetId, setTargetId] = React.useState('');
  const [targetAmount, setTargetAmount] = React.useState('');
  const [date, setDate] = React.useState(formatISO(new Date(), { representation: 'date' }));
  const [notes, setNotes] = React.useState('');

  // Filter out credit card accounts
  const eligibleAccounts = accounts.filter(account => 
    account.type !== 'credit' && account.type !== 'online'
  );

  // Get active targets that need funding
  const activeTargets = targets.filter(target => 
    target.currentAmount < target.targetAmount
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !accountId || !date) {
      toast.error('Please fill in all required fields');
      return;
    }

    const incomeAmount = parseFloat(amount);
    const targetContribution = targetId && targetAmount ? parseFloat(targetAmount) : 0;

    if (targetContribution > incomeAmount) {
      toast.error('Target contribution cannot exceed income amount');
      return;
    }

    // Add income transaction
    addTransaction({
      amount: incomeAmount,
      accountId,
      date,
      notes,
      currencyCode: defaultCurrency.code,
      type: 'income',
      targetId: targetId || undefined
    });

    // Update target if selected
    if (targetId && targetContribution > 0) {
      const selectedTarget = targets.find(t => t.id === targetId);
      if (selectedTarget) {
        const newAmount = selectedTarget.currentAmount + targetContribution;
        if (newAmount <= selectedTarget.targetAmount) {
          updateTarget(targetId, newAmount);
          toast.success(`Added ${defaultCurrency.symbol}${targetContribution.toFixed(2)} to target "${selectedTarget.name}"`);
        } else {
          toast.error('Target contribution would exceed target amount');
          return;
        }
      }
    }

    toast.success('Income added successfully');
    
    // Reset form
    setAmount('');
    setTargetId('');
    setTargetAmount('');
    setNotes('');
    navigate('/');
  };

  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">Add Income</h1>
      <div className="rounded-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 shadow-lg">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Amount ({defaultCurrency.symbol})
            </label>
            <div className="mt-1">
              <input
                type="number"
                id="amount"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="account" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Deposit To
            </label>
            <div className="mt-1">
              <select
                id="account"
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                required
              >
                <option value="">Select an account</option>
                {eligibleAccounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name} (Current: {defaultCurrency.symbol}{account.balance.toFixed(2)})
                  </option>
                ))}
              </select>
            </div>
            {accountId && (
              <div className="mt-2 flex items-center gap-2">
                <AccountIcon type={accounts.find(a => a.id === accountId)?.type || 'other'} />
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Selected Account
                </span>
              </div>
            )}
          </div>

          {activeTargets.length > 0 && (
            <div className="space-y-4">
              <div>
                <label htmlFor="target" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Contribute to Target (Optional)
                </label>
                <div className="mt-1">
                  <select
                    id="target"
                    value={targetId}
                    onChange={(e) => setTargetId(e.target.value)}
                    className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">No Target</option>
                    {activeTargets.map((target) => {
                      const remaining = target.targetAmount - target.currentAmount;
                      return (
                        <option key={target.id} value={target.id}>
                          {target.name} (Needs {defaultCurrency.symbol}{remaining.toFixed(2)})
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              {targetId && (
                <div>
                  <label htmlFor="targetAmount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Contribution Amount ({defaultCurrency.symbol})
                  </label>
                  <div className="mt-1">
                    <input
                      type="number"
                      id="targetAmount"
                      step="0.01"
                      value={targetAmount}
                      onChange={(e) => setTargetAmount(e.target.value)}
                      className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

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
            Add Income
          </button>
        </form>
      </div>
    </div>
  );
}