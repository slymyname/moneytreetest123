import React from 'react';
import { cn } from '../lib/utils';
import { Loader2 } from 'lucide-react';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'default' | 'outline';
  isLoading?: boolean;
  icon?: React.ReactNode;
};

export function Button({ 
  children, 
  className = '', 
  variant = 'default',
  isLoading = false,
  icon,
  disabled,
  ...props 
}: ButtonProps) {
  return (
    <button
      className={cn(
        'btn',
        variant === 'outline' && 'btn-outline',
        isLoading && 'opacity-70 cursor-not-allowed',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : icon ? (
        <span className="mr-2">{icon}</span>
      ) : null}
      {children}
    </button>
  );
}