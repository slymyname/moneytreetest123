import React from 'react';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion';

type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  animate?: boolean;
};

export function Card({ 
  children, 
  className = '', 
  animate = true,
  ...props 
}: CardProps) {
  const Component = animate ? motion.div : 'div';

  return (
    <Component
      className={cn('card', className)}
      initial={animate ? { opacity: 0, y: 20 } : undefined}
      animate={animate ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.3 }}
      {...props}
    >
      {children}
    </Component>
  );
}