import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { AddExpensePage } from './pages/AddExpensePage';
import { AddIncomePage } from './pages/AddIncomePage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { CalendarPage } from './pages/CalendarPage';
import { ExpensesOverviewPage } from './pages/ExpensesOverviewPage';
import { BudgetPlannerPage } from './pages/BudgetPlannerPage';
import { AccountsPage } from './pages/AccountsPage';
import { SettingsPage } from './pages/SettingsPage';
import { BillScannerPage } from './pages/BillScannerPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="add-income" element={<AddIncomePage />} />
          <Route path="add" element={<AddExpensePage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="overview" element={<ExpensesOverviewPage />} />
          <Route path="budget" element={<BudgetPlannerPage />} />
          <Route path="accounts" element={<AccountsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="scan" element={<BillScannerPage />} />
        </Route>
      </Routes>
      <Toaster 
        position="top-right"
        toastOptions={{
          className: 'dark:bg-gray-800 dark:text-white',
          duration: 3000,
        }}
      />
    </BrowserRouter>
  );
}