import React from 'react';
import {
  Wallet,
  CreditCard,
  Building2,
  Globe,
  BanknoteIcon,
} from 'lucide-react';

const iconMap = {
  cash: BanknoteIcon,
  paypal: Globe,
  credit: CreditCard,
  debit: Building2,
  online: Globe,
  other: Wallet,
};

export function AccountIcon({ type }: { type: string }) {
  const Icon = iconMap[type as keyof typeof iconMap] || Wallet;
  return <Icon className="h-5 w-5" />;
}