import React from 'react';
import { format } from 'date-fns';
import { useExpenseStore, type Budget, currencies } from '../lib/store';
import { CategoryIcon } from './CategoryIcon';
import { Dialog } from '@headlessui/react';
import { Trash2, AlertTriangle, Edit2 } from 'lucide-react';
import { BudgetForm } from './BudgetForm';
import toast from 'react-hot-toast';

type BudgetCardProps = {
  budget: Budget;
};

export function BudgetCard({ budget }: BudgetCardProps) {
  const { categories, transactions, deleteBudget } = useExpenseStore();
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const [showEditDialog, setShowEditDialog] = React.useState(false);
  const currency = currencies.find(c => c.code === budget.currencyCode);

  // Ensure we have all required data before processing
  if (!currency || !categories || !transactions) {
    return null;
  }

  const categorySpending = categories.map(category => {
    const allocation = budget.categoryAllocations.find(
      a => a.categoryId === category.id
    );
    
    // Only process transactions that match both category and currency
    const categoryTransactions = transactions.filter(t => 
      t.categoryId === category.id && 
      t.currencyCode === budget.currencyCode &&
      t.type === 'expense'
    );
    
    const spent = categoryTransactions.reduce((sum, t) => sum + t.amount, 0);
    
    return {
      ...category,
      allocated: allocation?.amount || 0,
      spent,
      isOverBudget: allocation && spent > allocation.amount,
    };
  }).filter(cat => cat.allocated > 0);

  const totalSpent = categorySpending.reduce((sum, cat) => sum + cat.spent, 0);
  const totalBudget = budget.totalAmount;
  const remaining = totalBudget - totalSpent;
  const progress = (totalSpent / totalBudget) * 100;
  const isOverBudget = totalSpent > totalBudget;

  const handleDelete = () => {
    try {
      deleteBudget(budget.id);
      toast.success('Budget deleted successfully');
      setShowDeleteDialog(false);
    } catch (error) {
      toast.error('Failed to delete budget. Please try again.');
    }
  };

  React.useEffect(() => {
    categorySpending.forEach(category => {
      if (category.isOverBudget) {
        toast.error(
          `Warning: ${category.name} expenses (${currency.symbol}${category.spent.toFixed(2)}) exceed budget (${currency.symbol}${category.allocated.toFixed(2)})`,
          { duration: 5000 }
        );
      }
    });

    if (isOverBudget) {
      toast.error(
        `Warning: Total expenses (${currency.symbol}${totalSpent.toFixed(2)}) exceed total budget (${currency.symbol}${totalBudget.toFixed(2)})`,
        { duration: 5000 }
      );
    }
  }, [categorySpending, isOverBudget, currency.symbol, totalSpent, totalBudget]);

  return (
    <>
      <div className="rounded-lg bg-white/80 backdrop-blur-sm p-6 shadow-lg dark:bg-gray-800/80">
        <div className="mb-6 flex justify-between items-start">
          <div>
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">
              {budget.timeFrame.charAt(0).toUpperCase() + budget.timeFrame.slice(1)} Budget
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Started {format(new Date(budget.startDate), 'MMMM d, yyyy')}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowEditDialog(true)}
              className="p-2 text-gray-400 hover:text-green-600 dark:text-gray-300 dark:hover:text-green-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Edit2 className="h-5 w-5" />
            </button>
            <button
              onClick={() => setShowDeleteDialog(true)}
              className="p-2 text-gray-400 hover:text-red-600 dark:text-gray-300 dark:hover:text-red-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {currency.symbol}{totalSpent.toFixed(2)} of {currency.symbol}{totalBudget.toFixed(2)}
            </span>
            <span className={`text-sm font-medium ${isOverBudget ? 'text-red-600 dark:text-red-400' : 'text-gray-700 dark:text-gray-300'}`}>
              {progress.toFixed(1)}%
            </span>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full ${isOverBudget ? 'bg-red-600' : 'bg-gradient-to-r from-green-600 to-yellow-500'}`}
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>

        <div className="space-y-4">
          {categorySpending.map((category) => (
            <div key={category.id} className="flex items-center justify-between">
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
                {category.isOverBudget && (
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                )}
              </div>
              <div className="text-sm">
                <span className={`font-medium ${category.isOverBudget ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
                  {currency.symbol}{category.spent.toFixed(2)}
                </span>
                <span className="text-gray-500 dark:text-gray-400">
                  {' '}/ {currency.symbol}{category.allocated.toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-between text-sm">
            <span className="font-medium text-gray-700 dark:text-gray-300">Remaining Budget</span>
            <span className={`font-medium ${remaining >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {currency.symbol}{remaining.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {showEditDialog && (
        <BudgetForm 
          onClose={() => setShowEditDialog(false)} 
          editBudget={budget}
        />
      )}

      <Dialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-sm rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
            <Dialog.Title className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Delete Budget
            </Dialog.Title>
            
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Are you sure you want to delete this budget? This action cannot be undone.
            </p>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteDialog(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 rounded-md"
              >
                Delete
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  );
}