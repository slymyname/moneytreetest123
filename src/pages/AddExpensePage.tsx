import React from 'react';
import { ExpenseForm } from '../components/ExpenseForm';

export function AddExpensePage() {
  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-6 text-2xl font-bold text-gray-900 dark:text-gray-100">Add New Expense</h1>
      <div className="rounded-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 shadow-lg">
        <ExpenseForm />
      </div>
    </div>
  );
}