import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';

export type Currency = {
  code: string;
  name: string;
  symbol: string;
};

export type Transaction = {
  id: string;
  amount: number;
  accountId: string;
  date: string;
  notes?: string;
  currencyCode: string;
  type: 'expense' | 'income';
  categoryId?: string;
  targetId?: string;
};

export const currencies: Currency[] = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
];

export type Category = {
  id: string;
  name: string;
  color: string;
  icon?: string;
};

export type Account = {
  id: string;
  name: string;
  type: 'cash' | 'paypal' | 'credit' | 'debit' | 'online' | 'other';
  balance: number;
  limit?: number;
  currencyCode: string;
  icon?: string;
};

export type Budget = {
  id: string;
  timeFrame: 'weekly' | 'monthly' | 'yearly';
  totalAmount: number;
  startDate: string;
  categoryAllocations: {
    categoryId: string;
    amount: number;
  }[];
  currencyCode: string;
};

export type Target = {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  categoryId?: string;
  currencyCode: string;
};

const defaultCategories: Category[] = [
  { id: 'clothing', name: 'Clothing', color: '#FF6B6B', icon: 'clothing' },
  { id: 'dining', name: 'Dining', color: '#4ECDC4', icon: 'dining' },
  { id: 'education', name: 'Education', color: '#45B7D1', icon: 'education' },
  { id: 'entertainment', name: 'Entertainment', color: '#96CEB4', icon: 'entertainment' },
  { id: 'groceries', name: 'Groceries', color: '#4CAF50', icon: 'groceries' },
  { id: 'health', name: 'Health', color: '#FF6B6B', icon: 'health' },
  { id: 'personal-care', name: 'Personal Care', color: '#FFD93D', icon: 'personal-care' },
  { id: 'rent', name: 'Rent', color: '#6C5B7B', icon: 'rent' },
  { id: 'subscriptions', name: 'Subscriptions', color: '#C06C84', icon: 'subscriptions' },
  { id: 'transport', name: 'Transport', color: '#355C7D', icon: 'transport' },
  { id: 'travel', name: 'Travel', color: '#F8B195', icon: 'travel' },
  { id: 'utilities', name: 'Utilities', color: '#F67280', icon: 'utilities' },
];

type ExpenseStore = {
  transactions: Transaction[];
  categories: Category[];
  accounts: Account[];
  budgets: Budget[];
  targets: Target[];
  defaultCurrency: Currency;
  darkMode: boolean;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
  addCategory: (category: Omit<Category, 'id'>) => void;
  editCategory: (id: string, name: string, color: string) => void;
  deleteCategory: (id: string) => void;
  addAccount: (account: Omit<Account, 'id'>) => void;
  updateAccount: (id: string, account: Partial<Account>) => void;
  deleteAccount: (id: string) => void;
  addBudget: (budget: Omit<Budget, 'id'>) => void;
  updateBudget: (id: string, budget: Omit<Budget, 'id'>) => void;
  deleteBudget: (id: string) => void;
  addTarget: (target: Omit<Target, 'id'>) => void;
  updateTarget: (id: string, amount: number) => void;
  deleteTarget: (id: string) => void;
  setDefaultCurrency: (currency: Currency) => void;
  toggleDarkMode: () => void;
  resetApp: () => void;
};

export function formatAmount(amount: number, currency: Currency): string {
  if (currency.code === 'EUR') {
    const [whole, decimal] = amount.toFixed(2).split('.');
    const formattedWhole = whole.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `${formattedWhole},${decimal} ${currency.symbol}`;
  } else {
    return `${currency.symbol}${amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  }
}

export function parseAmount(value: string, currency: Currency): number {
  const cleaned = value.replace(currency.symbol, '').trim();
  
  if (currency.code === 'EUR') {
    const normalized = cleaned
      .replace(/\./g, '')
      .replace(',', '.');
    const amount = parseFloat(normalized);
    
    if (isNaN(amount)) {
      throw new Error('Invalid amount format');
    }
    
    return Math.round(amount * 100) / 100;
  } else {
    const normalized = cleaned.replace(/,/g, '');
    const amount = parseFloat(normalized);
    
    if (isNaN(amount)) {
      throw new Error('Invalid amount format');
    }
    
    return Math.round(amount * 100) / 100;
  }
}

export const useExpenseStore = create<ExpenseStore>()(
  persist(
    (set) => ({
      transactions: [],
      categories: defaultCategories,
      accounts: [
        {
          id: 'cash',
          name: 'Cash',
          type: 'cash',
          balance: 0,
          currencyCode: 'USD',
          icon: 'cash',
        },
      ],
      budgets: [],
      targets: [],
      defaultCurrency: currencies[0],
      darkMode: false,
      addTransaction: (transaction) =>
        set((state) => {
          const newTransaction = { ...transaction, id: crypto.randomUUID() };
          
          const updatedAccounts = state.accounts.map(account => {
            if (account.id === transaction.accountId) {
              const balanceChange = transaction.type === 'expense' ? -transaction.amount : transaction.amount;
              return {
                ...account,
                balance: account.balance + balanceChange
              };
            }
            return account;
          });

          return {
            transactions: [...state.transactions, newTransaction],
            accounts: updatedAccounts,
          };
        }),
      deleteTransaction: (id) =>
        set((state) => {
          const transaction = state.transactions.find(t => t.id === id);
          if (!transaction) return state;

          const updatedAccounts = state.accounts.map(account => {
            if (account.id === transaction.accountId) {
              const balanceChange = transaction.type === 'expense' ? transaction.amount : -transaction.amount;
              return {
                ...account,
                balance: account.balance + balanceChange
              };
            }
            return account;
          });

          return {
            transactions: state.transactions.filter((t) => t.id !== id),
            accounts: updatedAccounts,
          };
        }),
      addCategory: (category) =>
        set((state) => ({
          categories: [...state.categories, { ...category, id: crypto.randomUUID() }],
        })),
      editCategory: (id, name, color) =>
        set((state) => ({
          categories: state.categories.map((c) =>
            c.id === id ? { ...c, name, color } : c
          ),
        })),
      deleteCategory: (id) =>
        set((state) => ({
          categories: state.categories.filter((c) => c.id !== id),
        })),
      addAccount: (account) =>
        set((state) => ({
          accounts: [...state.accounts, { ...account, id: crypto.randomUUID() }],
        })),
      updateAccount: (id, account) =>
        set((state) => ({
          accounts: state.accounts.map((a) =>
            a.id === id ? { ...a, ...account } : a
          ),
        })),
      deleteAccount: (id) =>
        set((state) => ({
          accounts: state.accounts.filter((a) => a.id !== id),
        })),
      addBudget: (budget) =>
        set((state) => ({
          budgets: [...state.budgets, { ...budget, id: crypto.randomUUID() }],
        })),
      updateBudget: (id, budget) =>
        set((state) => ({
          budgets: state.budgets.map((b) =>
            b.id === id ? { ...b, ...budget } : b
          ),
        })),
      deleteBudget: (id) =>
        set((state) => ({
          budgets: state.budgets.filter((b) => b.id !== id),
        })),
      addTarget: (target) =>
        set((state) => ({
          targets: [...state.targets, { ...target, id: crypto.randomUUID() }],
        })),
      updateTarget: (id, amount) =>
        set((state) => ({
          targets: state.targets.map((t) =>
            t.id === id ? { ...t, currentAmount: amount } : t
          ),
        })),
      deleteTarget: (id) =>
        set((state) => ({
          targets: state.targets.filter((t) => t.id !== id),
        })),
      setDefaultCurrency: (currency) =>
        set(() => ({
          defaultCurrency: currency,
        })),
      toggleDarkMode: () =>
        set((state) => ({
          darkMode: !state.darkMode,
        })),
      resetApp: () =>
        set((state) => ({
          transactions: [],
          budgets: [],
          targets: [],
          categories: defaultCategories,
          accounts: [
            {
              id: 'cash',
              name: 'Cash',
              type: 'cash',
              balance: 0,
              currencyCode: state.defaultCurrency.code,
              icon: 'cash',
            },
          ],
        })),
    }),
    {
      name: 'expense-store',
    }
  )
);

export function useTransactionsByCategory(currencyCode: string) {
  const { transactions, categories } = useExpenseStore();
  
  return categories.map(category => {
    const categoryTransactions = transactions.filter(
      t => t.categoryId === category.id && t.currencyCode === currencyCode
    );
    const expenses = categoryTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    const income = categoryTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    return { ...category, expenses, income };
  });
}

export function useRecentTransactions(limit: number, currencyCode: string) {
  const { transactions, categories } = useExpenseStore();
  
  return transactions
    .filter(t => t.currencyCode === currencyCode)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit)
    .map(transaction => ({
      ...transaction,
      category: transaction.categoryId ? categories.find(c => c.id === transaction.categoryId) : undefined,
    }));
}

export function useTotalExpenses(currencyCode: string) {
  const { transactions } = useExpenseStore();
  
  return transactions
    .filter(t => t.type === 'expense' && t.currencyCode === currencyCode)
    .reduce((sum, t) => sum + t.amount, 0);
}

export function useTotalIncome(currencyCode: string) {
  const { transactions } = useExpenseStore();
  
  return transactions
    .filter(t => t.type === 'income' && t.currencyCode === currencyCode)
    .reduce((sum, t) => sum + t.amount, 0);
}

export function useCurrentBudget(timeFrame: 'weekly' | 'monthly' | 'yearly', currencyCode: string) {
  const { budgets } = useExpenseStore();
  const now = new Date();
  
  return budgets.find(budget => {
    const startDate = parseISO(budget.startDate);
    const endDate = endOfMonth(startDate);
    
    return (
      budget.timeFrame === timeFrame &&
      budget.currencyCode === currencyCode &&
      isWithinInterval(now, { start: startDate, end: endDate })
    );
  });
}

export function useTargetProgress(targetId: string) {
  const { targets } = useExpenseStore();
  const target = targets.find(t => t.id === targetId);
  
  if (!target) return 0;
  return (target.currentAmount / target.targetAmount) * 100;
}

export function useUniqueCurrencies() {
  const { transactions } = useExpenseStore();
  
  const uniqueCurrencyCodes = [...new Set(transactions.map(t => t.currencyCode))];
  return uniqueCurrencyCodes.map(code => currencies.find(c => c.code === code)!);
}