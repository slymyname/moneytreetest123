import React from 'react';
import { Dialog } from '@headlessui/react';
import { Plus, X, Pencil, Trash2 } from 'lucide-react';
import { useExpenseStore } from '../lib/store';
import { AccountIcon } from '../components/AccountIcon';
import toast from 'react-hot-toast';

export function AccountsPage() {
  const { accounts, addAccount, updateAccount, deleteAccount, defaultCurrency } = useExpenseStore();
  const [showAddForm, setShowAddForm] = React.useState(false);
  const [showEditForm, setShowEditForm] = React.useState(false);
  const [selectedAccount, setSelectedAccount] = React.useState<string | null>(null);

  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);
  const totalCredit = accounts
    .filter(account => account.type === 'credit' && account.limit)
    .reduce((sum, account) => sum + (account.limit || 0), 0);
  const availableCredit = accounts
    .filter(account => account.type === 'credit' && account.limit)
    .reduce((sum, account) => sum + (account.limit || 0) + account.balance, 0);

  const handleDeleteAccount = (id: string) => {
    if (accounts.length <= 1) {
      toast.error('Cannot delete the last account');
      return;
    }
    deleteAccount(id);
    toast.success('Account deleted successfully');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Accounts & Balance</h1>
        <button
          onClick={() => setShowAddForm(true)}
          className="inline-flex items-center gap-2 rounded-md bg-gradient-to-r from-green-600 to-yellow-500 px-4 py-2 text-sm font-medium text-white hover:from-green-700 hover:to-yellow-600"
        >
          <Plus className="h-5 w-5" />
          Add Account
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 shadow-lg">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Total Balance</h3>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">
            {defaultCurrency.symbol}{totalBalance.toFixed(2)}
          </p>
        </div>

        <div className="rounded-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 shadow-lg">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Total Credit Limit</h3>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {defaultCurrency.symbol}{totalCredit.toFixed(2)}
          </p>
        </div>

        <div className="rounded-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 shadow-lg">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Available Credit</h3>
          <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
            {defaultCurrency.symbol}{availableCredit.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {accounts.map((account) => (
          <div
            key={account.id}
            className="rounded-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <AccountIcon type={account.type} />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">{account.name}</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setSelectedAccount(account.id);
                    setShowEditForm(true);
                  }}
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Pencil className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleDeleteAccount(account.id)}
                  className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500 dark:text-gray-400">Balance</span>
                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                  {defaultCurrency.symbol}{account.balance.toFixed(2)}
                </span>
              </div>
              {account.limit !== undefined && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Credit Limit</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {defaultCurrency.symbol}{account.limit.toFixed(2)}
                  </span>
                </div>
              )}
              {account.type === 'credit' && account.limit !== undefined && (
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500 dark:text-gray-400">Available Credit</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {defaultCurrency.symbol}{(account.limit + account.balance).toFixed(2)}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-600 to-yellow-500"
                      style={{
                        width: `${Math.max(
                          0,
                          ((account.limit + account.balance) / account.limit) * 100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <AccountForm
        open={showAddForm}
        onClose={() => setShowAddForm(false)}
      />

      {selectedAccount && (
        <AccountForm
          open={showEditForm}
          onClose={() => {
            setShowEditForm(false);
            setSelectedAccount(null);
          }}
          accountId={selectedAccount}
        />
      )}
    </div>
  );
}

type AccountFormProps = {
  open: boolean;
  onClose: () => void;
  accountId?: string;
};

function AccountForm({ open, onClose, accountId }: AccountFormProps) {
  const { accounts, addAccount, updateAccount, defaultCurrency } = useExpenseStore();
  const account = accountId ? accounts.find(a => a.id === accountId) : null;

  const [name, setName] = React.useState(account?.name || '');
  const [type, setType] = React.useState(account?.type || 'cash');
  const [balance, setBalance] = React.useState(account?.balance.toString() || '0');
  const [limit, setLimit] = React.useState(account?.limit?.toString() || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const accountData = {
      name,
      type: type as 'cash' | 'paypal' | 'credit' | 'debit' | 'online' | 'other',
      balance: parseFloat(balance),
      limit: limit ? parseFloat(limit) : undefined,
      currencyCode: defaultCurrency.code,
    };

    if (accountId) {
      updateAccount(accountId, accountData);
      toast.success('Account updated successfully');
    } else {
      addAccount(accountData);
      toast.success('Account added successfully');
    }

    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-md w-full rounded-xl bg-white dark:bg-gray-800 p-6 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <Dialog.Title className="text-lg font-semibold text-gray-900 dark:text-white">
              {accountId ? 'Edit Account' : 'Add New Account'}
            </Dialog.Title>
            <button
              onClick={onClose}
              className="rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Account Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Account Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm dark:bg-gray-700 dark:text-white"
              >
                <option value="cash">Cash</option>
                <option value="paypal">PayPal</option>
                <option value="credit">Credit Card</option>
                <option value="debit">Debit Card</option>
                <option value="online">Online Payment</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Current Balance ({defaultCurrency.symbol})
              </label>
              <input
                type="number"
                step="0.01"
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                required
              />
            </div>

            {type === 'credit' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Credit Limit ({defaultCurrency.symbol})
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={limit}
                  onChange={(e) => setLimit(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                />
              </div>
            )}

            <button
              type="submit"
              className="w-full rounded-md bg-gradient-to-r from-green-600 to-yellow-500 px-4 py-2 text-sm font-medium text-white hover:from-green-700 hover:to-yellow-600"
            >
              {accountId ? 'Update Account' : 'Add Account'}
            </button>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}