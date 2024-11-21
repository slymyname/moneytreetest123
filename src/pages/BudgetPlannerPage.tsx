import React from 'react';
import { PlusCircle } from 'lucide-react';
import { useExpenseStore } from '../lib/store';
import { BudgetForm } from '../components/BudgetForm';
import { TargetForm } from '../components/TargetForm';
import { BudgetCard } from '../components/BudgetCard';
import { TargetCard } from '../components/TargetCard';

export function BudgetPlannerPage() {
  const [showBudgetForm, setShowBudgetForm] = React.useState(false);
  const [showTargetForm, setShowTargetForm] = React.useState(false);
  const { budgets, defaultCurrency } = useExpenseStore();
  
  // Get active budgets (not expired)
  const activeBudgets = budgets.filter(budget => {
    const endDate = new Date(budget.startDate);
    endDate.setMonth(endDate.getMonth() + 1);
    return new Date() <= endDate;
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Budget Planner</h1>
        <div className="flex gap-4">
          <button
            onClick={() => setShowBudgetForm(true)}
            className="inline-flex items-center gap-2 rounded-md bg-gradient-to-r from-green-600 to-yellow-500 px-4 py-2 text-sm font-medium text-white hover:from-green-700 hover:to-yellow-600"
          >
            <PlusCircle className="h-5 w-5" />
            New Budget
          </button>
          <button
            onClick={() => setShowTargetForm(true)}
            className="inline-flex items-center gap-2 rounded-md border border-green-600 px-4 py-2 text-sm font-medium text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20"
          >
            <PlusCircle className="h-5 w-5" />
            New Target
          </button>
        </div>
      </div>

      {activeBudgets.length > 0 ? (
        <div className="space-y-6">
          {activeBudgets.map(budget => (
            <BudgetCard key={budget.id} budget={budget} />
          ))}
        </div>
      ) : (
        <div className="rounded-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 shadow-lg text-center">
          <p className="text-gray-500 dark:text-gray-300">No active budget. Create one to get started!</p>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <TargetsList />
      </div>

      {showBudgetForm && (
        <BudgetForm onClose={() => setShowBudgetForm(false)} />
      )}

      {showTargetForm && (
        <TargetForm onClose={() => setShowTargetForm(false)} />
      )}
    </div>
  );
}

function TargetsList() {
  const { targets } = useExpenseStore();

  if (targets.length === 0) {
    return (
      <div className="rounded-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 shadow-lg text-center">
        <p className="text-gray-500 dark:text-gray-300">No targets yet. Create one to start tracking!</p>
      </div>
    );
  }

  return targets.map((target) => (
    <TargetCard key={target.id} target={target} />
  ));
}