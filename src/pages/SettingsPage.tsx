import React from 'react';
import { useExpenseStore, currencies, formatAmount } from '../lib/store';
import { Trash2, Moon, Sun, Plus, RotateCcw } from 'lucide-react';
import { Card } from '../components/Card';
import { Dialog } from '@headlessui/react';
import toast from 'react-hot-toast';

export function SettingsPage() {
  const { 
    categories, 
    addCategory, 
    deleteCategory, 
    editCategory, 
    defaultCurrency, 
    setDefaultCurrency,
    darkMode,
    toggleDarkMode,
    resetApp
  } = useExpenseStore();
  
  const [newCategoryName, setNewCategoryName] = React.useState('');
  const [newCategoryColor, setNewCategoryColor] = React.useState('#4CAF50');
  const [showNewCategory, setShowNewCategory] = React.useState(false);
  const [showResetConfirmation, setShowResetConfirmation] = React.useState(false);

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCategoryName.trim()) {
      addCategory({
        name: newCategoryName.trim(),
        color: newCategoryColor,
      });
      setNewCategoryName('');
      setNewCategoryColor('#4CAF50');
      setShowNewCategory(false);
      toast.success('Category added successfully');
    }
  };

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCurrency = currencies.find(c => c.code === e.target.value);
    if (newCurrency) {
      setDefaultCurrency(newCurrency);
      toast.success(`Currency changed to ${newCurrency.name}. Number format updated to match locale.`);
    }
  };

  const handleResetApp = () => {
    resetApp();
    setShowResetConfirmation(false);
    toast.success('App has been reset to default settings');
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 sm:px-0">
      <Card>
        <div className="flex items-center justify-between p-4 sm:p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">Appearance</h2>
          <button
            onClick={toggleDarkMode}
            className="inline-flex items-center justify-center rounded-full p-3 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-400 touch-manipulation"
          >
            {darkMode ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
            <span className="ml-2 hidden sm:inline">{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
        </div>
      </Card>

      <Card>
        <div className="p-4 sm:p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Currency</h2>
          <div className="space-y-2">
            <select
              value={defaultCurrency.code}
              onChange={handleCurrencyChange}
              className="block w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-green-500 focus:ring-green-500 text-base sm:text-sm min-h-[44px] touch-manipulation"
            >
              {currencies.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name} ({c.symbol}) - Example: {formatAmount(3400.50, c)}
                </option>
              ))}
            </select>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Numbers will be formatted according to the selected currency's locale
            </p>
          </div>
        </div>
      </Card>

      <Card>
        <div className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Categories</h2>
            <button
              onClick={() => setShowNewCategory(!showNewCategory)}
              className="inline-flex items-center gap-2 rounded-full p-2 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 touch-manipulation"
            >
              <Plus className="h-5 w-5" />
              <span className="hidden sm:inline">Add Category</span>
            </button>
          </div>

          {showNewCategory && (
            <form onSubmit={handleAddCategory} className="mb-6 space-y-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category Name
                </label>
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Enter category name"
                  className="block w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-green-500 focus:ring-green-500 text-base sm:text-sm min-h-[44px]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Color
                </label>
                <input
                  type="color"
                  value={newCategoryColor}
                  onChange={(e) => setNewCategoryColor(e.target.value)}
                  className="h-11 w-full rounded-lg border-gray-300 dark:border-gray-600 p-1 touch-manipulation"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-gradient-to-r from-green-600 to-yellow-500 px-4 py-2 text-base sm:text-sm font-medium text-white hover:from-green-700 hover:to-yellow-600 min-h-[44px] touch-manipulation"
                >
                  Add Category
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewCategory(false)}
                  className="rounded-lg px-4 py-2 text-base sm:text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 min-h-[44px] touch-manipulation"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          <div className="space-y-4">
            {categories.map((category) => (
              <div
                key={category.id}
                className="flex flex-col sm:flex-row sm:items-center gap-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 p-4"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div
                    className="h-8 w-8 rounded-full flex-shrink-0"
                    style={{ backgroundColor: category.color }}
                  />
                  <input
                    type="text"
                    value={category.name}
                    onChange={(e) =>
                      editCategory(category.id, e.target.value, category.color)
                    }
                    className="flex-1 rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-base sm:text-sm focus:border-green-500 focus:ring-green-500 min-h-[44px]"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={category.color}
                    onChange={(e) =>
                      editCategory(category.id, category.name, e.target.value)
                    }
                    className="h-11 w-20 rounded-lg border-gray-300 dark:border-gray-600 p-1 touch-manipulation"
                  />
                  <button
                    onClick={() => deleteCategory(category.id)}
                    className="p-3 text-gray-400 hover:text-red-500 dark:text-gray-300 dark:hover:text-red-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600 touch-manipulation"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <Card>
        <div className="p-4 sm:p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Reset App</h2>
          <div className="space-y-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Reset the app to its default state. This will delete all transactions, budgets, and targets.
              Your categories and accounts will be preserved.
            </p>
            <button
              onClick={() => setShowResetConfirmation(true)}
              className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 border border-red-600 dark:border-red-400"
            >
              <RotateCcw className="h-4 w-4" />
              Reset App
            </button>
          </div>
        </div>
      </Card>

      <Dialog
        open={showResetConfirmation}
        onClose={() => setShowResetConfirmation(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
        
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-sm w-full rounded-xl bg-white dark:bg-gray-800 p-6 shadow-xl">
            <Dialog.Title className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Reset App
            </Dialog.Title>
            
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Are you sure you want to reset the app? This will delete all your data and cannot be undone.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <button
                onClick={() => setShowResetConfirmation(false)}
                className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md touch-manipulation"
              >
                Cancel
              </button>
              <button
                onClick={handleResetApp}
                className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 rounded-md touch-manipulation"
              >
                Reset App
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}