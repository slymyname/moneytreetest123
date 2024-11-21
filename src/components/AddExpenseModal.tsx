import React from 'react';
import { Dialog } from '@headlessui/react';
import { X } from 'lucide-react';
import { ExpenseForm } from './ExpenseForm';
import { formatISO } from 'date-fns';

type AddExpenseModalProps = {
  initialDate: Date;
  onClose: () => void;
};

export function AddExpenseModal({ initialDate, onClose }: AddExpenseModalProps) {
  return (
    <Dialog open={true} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-md w-full rounded-xl bg-white p-6 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <Dialog.Title className="text-lg font-semibold">
              Add New Expense
            </Dialog.Title>
            <button
              onClick={onClose}
              className="rounded-full p-1 hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <ExpenseForm
            initialDate={formatISO(initialDate, { representation: 'date' })}
            onSuccess={onClose}
          />
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}