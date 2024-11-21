import React from 'react';
import { Dialog } from '@headlessui/react';
import { X, Plus } from 'lucide-react';
import { useExpenseStore, type Budget } from '../lib/store';
import { formatISO } from 'date-fns';
import toast from 'react-hot-toast';

type BudgetFormProps = {
  onClose: () => void;
  editBudget?: Budget;
};

export function BudgetForm({ onClose, editBudget }: BudgetFormProps) {
  const { categories, defaultCurrency, addBudget, addCategory, updateBudget } = useExpenseStore();
  const [timeFrame, setTimeFrame] = React.useState<'weekly' | 'monthly' | 'yearly'>(
    editBudget?.timeFrame || 'monthly'
  );
  const [totalAmount, setTotalAmount] = React.useState(
    editBudget?.totalAmount.toString() || ''
  );
  const [allocations, setAllocations] = React.useState(
    categories.map(category => {
      const existingAllocation = editBudget?.categoryAllocations.find(
        a => a.categoryId === category.id
      );
      return {
        categoryId: category.id,
        amount: existingAllocation?.amount || 0,
        selected: !!existingAllocation,
      };
    })
  );
  const [showNewCategory, setShowNewCategory] = React.useState(false);
  const [newCategoryName, setNewCategoryName] = React.useState('');
  const [newCategoryColor, setNewCategoryColor] = React.useState('#4CAF50');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const selectedAllocations = allocations
      .filter(a => a.selected && a.amount > 0)
      .map(({ categoryId, amount }) => ({ categoryId, amount }));

    if (selectedAllocations.length === 0) {
      toast.error('Please allocate budget to at least one category');
      return;
    }

    const budgetData = {
      timeFrame,
      totalAmount: parseFloat(totalAmount),
      startDate: editBudget?.startDate || formatISO(new Date(), { representation: 'date' }),
      categoryAllocations: selectedAllocations,
      currencyCode: defaultCurrency.code,
    };

    try {
      if (editBudget) {
        updateBudget(editBudget.id, budgetData);
        toast.success('Budget updated successfully');
      } else {
        addBudget(budgetData);
        toast.success('Budget created successfully');
      }
      onClose();
    } catch (error) {
      toast.error('Failed to save budget. Please try again.');
    }
  };

  const handleAddCategory = (e: React.MouseEvent) => {
    e.preventDefault();
    if (newCategoryName.trim()) {
      const newCategory = {
        name: newCategoryName.trim(),
        color: newCategoryColor,
      };
      addCategory(newCategory);
      
      setAllocations(prev => [
        ...prev,
        {
          categoryId: categories[categories.length - 1].id,
          amount: 0,
          selected: true,
        },
      ]);
      
      setNewCategoryName('');
      setNewCategoryColor('#4CAF50');
      setShowNewCategory(false);
    }
  };

  const handleAllocationChange = (categoryId: string, value: string) => {
    setAllocations(prev =>
      prev.map(allocation =>
        allocation.categoryId === categoryId
          ? { ...allocation, amount: parseFloat(value) || 0 }
          : allocation
      )
    );
  };

  const toggleCategorySelection = (categoryId: string) => {
    setAllocations(prev =>
      prev.map(allocation =>
        allocation.categoryId === categoryId
          ? { ...allocation, selected: !allocation.selected }
          : allocation
      )
    );
  };

  const totalAllocated = allocations
    .filter(a => a.selected)
    .reduce((sum, allocation) => sum + allocation.amount, 0);
  const remaining = parseFloat(totalAmount) - totalAllocated;

  return (
    <Dialog open={true} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-md w-full rounded-xl bg-white p-6 shadow-lg dark:bg-gray-800">
          <div className="flex items-center justify-between mb-6">
            <Dialog.Title className="text-lg font-semibold text-gray-900 dark:text-white">
              {editBudget ? 'Edit Budget' : 'Create New Budget'}
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
                Time Frame
              </label>
              <select
                value={timeFrame}
                onChange={(e) => setTimeFrame(e.target.value as any)}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm dark:bg-gray-700 dark:text-white"
              >
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Total Budget ({defaultCurrency.symbol})
              </label>
              <input
                type="number"
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                required
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Select Categories
                </label>
                <button
                  type="button"
                  onClick={() => setShowNewCategory(!showNewCategory)}
                  className="inline-flex items-center text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add New Category
                </button>
              </div>

              {showNewCategory && (
                <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Category Name
                    </label>
                    <input
                      type="text"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Color
                    </label>
                    <input
                      type="color"
                      value={newCategoryColor}
                      onChange={(e) => setNewCategoryColor(e.target.value)}
                      className="mt-1 h-9 w-full rounded-md border-gray-300 dark:border-gray-600"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddCategory}
                    className="w-full rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                  >
                    Add Category
                  </button>
                </div>
              )}

              <div className="space-y-3 max-h-64 overflow-y-auto">
                {categories.map((category) => (
                  <div key={category.id} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={allocations.find(a => a.categoryId === category.id)?.selected}
                        onChange={() => toggleCategorySelection(category.id)}
                        className="rounded border-gray-300 dark:border-gray-600 text-green-600 focus:ring-green-500"
                      />
                      <span
                        className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                        style={{
                          backgroundColor: category.color + '20',
                          color: category.color,
                        }}
                      >
                        {category.name}
                      </span>
                    </div>
                    {allocations.find(a => a.categoryId === category.id)?.selected && (
                      <input
                        type="number"
                        value={allocations.find(a => a.categoryId === category.id)?.amount || ''}
                        onChange={(e) => handleAllocationChange(category.id, e.target.value)}
                        className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-gray-700 dark:text-gray-300">
                Total Allocated: {defaultCurrency.symbol}{totalAllocated.toFixed(2)}
              </span>
              <span className={remaining < 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}>
                Remaining: {defaultCurrency.symbol}{remaining.toFixed(2)}
              </span>
            </div>

            <button
              type="submit"
              className="w-full rounded-md bg-gradient-to-r from-green-600 to-yellow-500 px-4 py-2 text-sm font-medium text-white hover:from-green-700 hover:to-yellow-600"
              disabled={remaining < 0 || !allocations.some(a => a.selected)}
            >
              {editBudget ? 'Update Budget' : 'Create Budget'}
            </button>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}