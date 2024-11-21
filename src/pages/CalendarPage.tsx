import React from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  parseISO,
} from 'date-fns';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { useExpenseStore } from '../lib/store';
import { DayExpenseModal } from '../components/DayExpenseModal';
import { AddExpenseModal } from '../components/AddExpenseModal';
import { cn } from '../lib/utils';
import { Card } from '../components/Card';

export function CalendarPage() {
  const [currentDate, setCurrentDate] = React.useState(new Date());
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const { transactions, defaultCurrency } = useExpenseStore();

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get transactions for each day
  const getDayTransactions = (date: Date) => {
    return transactions.filter((transaction) =>
      isSameDay(parseISO(transaction.date), date)
    );
  };

  // Calculate total transactions for a day
  const getDayTotal = (date: Date) => {
    const dayTransactions = getDayTransactions(date);
    const income = dayTransactions
      .filter(t => t.type === 'income')
      .reduce((total, t) => total + t.amount, 0);
    const expenses = dayTransactions
      .filter(t => t.type === 'expense')
      .reduce((total, t) => total + t.amount, 0);
    return { income, expenses };
  };

  const handlePreviousMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  return (
    <div className="space-y-6">
      <Card>
        <div className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {format(currentDate, 'MMMM yyyy')}
            </h2>
            <div className="flex gap-1">
              <button
                onClick={handlePreviousMonth}
                className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full touch-manipulation"
              >
                <ChevronLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </button>
              <button
                onClick={handleNextMonth}
                className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full touch-manipulation"
              >
                <ChevronRight className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div
                key={day}
                className="bg-gray-50 dark:bg-gray-800 py-2 text-center text-sm font-semibold text-gray-700 dark:text-gray-300"
              >
                <span className="hidden sm:inline">{day}</span>
                <span className="sm:hidden">{day[0]}</span>
              </div>
            ))}

            {daysInMonth.map((date, dayIdx) => {
              const dayTransactions = getDayTransactions(date);
              const hasTransactions = dayTransactions.length > 0;
              const { income, expenses } = getDayTotal(date);
              const netAmount = income - expenses;

              return (
                <div
                  key={date.toISOString()}
                  className={cn(
                    'relative bg-white dark:bg-gray-900 p-2 sm:p-3 min-h-[80px] sm:min-h-[120px]',
                    !isSameMonth(date, currentDate) && 'bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                  )}
                >
                  <div className="flex justify-between">
                    <button
                      onClick={() => setSelectedDate(date)}
                      className={cn(
                        'inline-flex h-6 w-6 items-center justify-center rounded-full text-sm touch-manipulation',
                        hasTransactions && (netAmount >= 0 
                          ? 'font-semibold bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400'
                          : 'font-semibold bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-400'
                        )
                      )}
                    >
                      {format(date, 'd')}
                    </button>
                    <button
                      onClick={() => {
                        setSelectedDate(date);
                        setIsAddModalOpen(true);
                      }}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full touch-manipulation"
                    >
                      <Plus className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                    </button>
                  </div>
                  {hasTransactions && (
                    <div className="mt-1 space-y-0.5 text-[10px] sm:text-xs">
                      {income > 0 && (
                        <div className="font-medium text-green-600 dark:text-green-400">
                          +{defaultCurrency.symbol}{income.toFixed(2)}
                        </div>
                      )}
                      {expenses > 0 && (
                        <div className="font-medium text-red-600 dark:text-red-400">
                          -{defaultCurrency.symbol}{expenses.toFixed(2)}
                        </div>
                      )}
                      <div className="text-gray-500 dark:text-gray-400">
                        {dayTransactions.length} transaction{dayTransactions.length !== 1 && 's'}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {selectedDate && !isAddModalOpen && (
        <DayExpenseModal
          date={selectedDate}
          onClose={() => setSelectedDate(null)}
        />
      )}

      {isAddModalOpen && (
        <AddExpenseModal
          initialDate={selectedDate || new Date()}
          onClose={() => {
            setIsAddModalOpen(false);
            setSelectedDate(null);
          }}
        />
      )}
    </div>
  );
}