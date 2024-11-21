import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { 
  Home,
  PlusCircle,
  Calendar,
  FileText,
  Wallet,
  CreditCard,
  BarChart3,
  Settings,
  Menu,
  X,
  DollarSign,
  ScanLine
} from 'lucide-react';
import { useExpenseStore } from '../lib/store';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const navigation = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Add Income', href: '/add-income', icon: DollarSign },
  { name: 'Add Expense', href: '/add', icon: PlusCircle },
  { name: 'Scan Bill', href: '/scan', icon: ScanLine },
  { name: 'Calendar', href: '/calendar', icon: Calendar },
  { name: 'Overview', href: '/overview', icon: FileText },
  { name: 'Budget', href: '/budget', icon: Wallet },
  { name: 'Accounts', href: '/accounts', icon: CreditCard },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Layout() {
  const location = useLocation();
  const { darkMode } = useExpenseStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  return (
    <div className={cn(
      'min-h-screen bg-gradient-to-br from-green-50 to-yellow-50',
      darkMode && 'dark from-gray-900 to-gray-800'
    )}>
      <div className="flex min-h-screen">
        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="fixed top-4 left-4 z-50 md:hidden p-2 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? (
            <X className="h-6 w-6 text-gray-600 dark:text-gray-300" />
          ) : (
            <Menu className="h-6 w-6 text-gray-600 dark:text-gray-300" />
          )}
        </button>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Sidebar */}
        <motion.aside
          className={cn(
            "fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0",
            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="flex flex-col h-full overflow-y-auto bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-r border-gray-200 dark:border-gray-700">
            <div className="flex-shrink-0 p-6">
              <Link to="/" className="flex items-center gap-3" onClick={() => setIsMobileMenuOpen(false)}>
                <img 
                  src="/pleaselogo.svg" 
                  alt="MoneyTree Logo"
                  className="w-16 h-16 object-contain"
                />
                <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-yellow-500 bg-clip-text text-transparent">
                  MoneyTree
                </span>
              </Link>
            </div>

            <nav className="flex-1 px-4 pb-4 space-y-1">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      'nav-link group',
                      isActive && 'active'
                    )}
                  >
                    <item.icon
                      className={cn(
                        'h-5 w-5 flex-shrink-0 transition-colors',
                        isActive
                          ? 'text-white'
                          : 'text-gray-400 group-hover:text-gray-600 dark:text-gray-500 dark:group-hover:text-gray-300'
                      )}
                    />
                    <span className="truncate">{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </motion.aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <div className="px-4 py-6 md:px-8 md:py-8 mt-16 md:mt-0 max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}