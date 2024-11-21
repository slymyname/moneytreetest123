import React from 'react';
import { format } from 'date-fns';
import { useExpenseStore } from '../lib/store';
import { CategoryIcon } from './CategoryIcon';

export function ExpenseList() {
  const { expenses, categories, currency } = useExpenseStore();

  const sortedExpenses = [...expenses].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Category
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Amount
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Notes
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {sortedExpenses.map((expense) => {
            const category = categories.find((c) => c.id === expense.categoryId);
            return (
              <tr key={expense.id}>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                  {format(new Date(expense.date), 'MMM d, yyyy')}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                  <div className="flex items-center gap-2">
                    {category?.icon && <CategoryIcon category={category.icon} />}
                    <span
                      className="rounded-full px-2.5 py-0.5 text-xs font-medium"
                      style={{ backgroundColor: category?.color + '20', color: category?.color }}
                    >
                      {category?.name}
                    </span>
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                  {currency.symbol}{expense.amount.toFixed(2)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {expense.notes || '-'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}