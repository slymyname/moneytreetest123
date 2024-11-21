import React from 'react';
import { Dialog } from '@headlessui/react';
import { X } from 'lucide-react';
import { useExpenseStore } from '../lib/store';
import { formatISO } from 'date-fns';

type TargetFormProps = {
  onClose: () => void;
};

export function TargetForm({ onClose }: TargetFormProps) {
  const { categories, defaultCurrency, addTarget } = useExpenseStore();
  const [name, setName] = React.useState('');
  const [targetAmount, setTargetAmount] = React.useState('');
  const [deadline, setDeadline] = React.useState(
    formatISO(new Date(), { representation: 'date' })
  );
  const [categoryId, setCategoryId] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    addTarget({
      name,
      targetAmount: parseFloat(targetAmount),
      currentAmount: 0,
      deadline,
      currencyCode: defaultCurrency.code,
      categoryId: categoryId || undefined,
    });
    
    onClose();
  };

  return (
    <Dialog open={true} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-md w-full rounded-xl bg-white p-6 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <Dialog.Title className="text-lg font-semibold">
              Create New Target
            </Dialog.Title>
            <button
              onClick={onClose}
              className="rounded-full p-1 hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Target Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Target Amount ({defaultCurrency.symbol})
              </label>
              <input
                type="number"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Deadline
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Category (Optional)
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
              >
                <option value="">No Category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="w-full rounded-md bg-gradient-to-r from-green-600 to-yellow-500 px-4 py-2 text-sm font-medium text-white hover:from-green-700 hover:to-yellow-600"
            >
              Create Target
            </button>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}