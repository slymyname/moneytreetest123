import React from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { useExpenseStore, useTargetProgress, type Target, currencies } from '../lib/store';
import { CategoryIcon } from './CategoryIcon';
import { Dialog } from '@headlessui/react';
import { Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

type TargetCardProps = {
  target: Target;
};

export function TargetCard({ target }: TargetCardProps) {
  const { categories, deleteTarget } = useExpenseStore();
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const currency = currencies.find(c => c.code === target.currencyCode);
  const category = target.categoryId 
    ? categories.find(c => c.id === target.categoryId)
    : null;
  
  const progress = useTargetProgress(target.id);
  const remaining = target.targetAmount - target.currentAmount;
  const deadline = new Date(target.deadline);
  const timeLeft = formatDistanceToNow(deadline, { addSuffix: true });

  const handleDelete = () => {
    deleteTarget(target.id);
    toast.success('Target deleted successfully');
    setShowDeleteDialog(false);
  };

  if (!currency) return null;

  return (
    <>
      <div className="rounded-lg bg-white/80 backdrop-blur-sm p-6 shadow-lg dark:bg-gray-800/80">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">{target.name}</h3>
          <div className="flex items-center gap-4">
            {category && (
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
            )}
            <button
              onClick={() => setShowDeleteDialog(true)}
              className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {currency.symbol}{target.currentAmount.toFixed(2)} of {currency.symbol}{target.targetAmount.toFixed(2)}
            </span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {progress.toFixed(1)}%
            </span>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-600 to-yellow-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="text-sm text-gray-500 dark:text-gray-400">
          <p>Remaining: {currency.symbol}{remaining.toFixed(2)}</p>
          <p>Deadline: {format(deadline, 'MMMM d, yyyy')}</p>
          <p>Time left: {timeLeft}</p>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-sm rounded-lg bg-white dark:bg-gray-800 p-6 shadow-xl">
            <Dialog.Title className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Delete Target
            </Dialog.Title>
            
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Are you sure you want to delete this target? This action cannot be undone.
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