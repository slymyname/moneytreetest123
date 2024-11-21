import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type TooltipProps = {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
};

export function Tooltip({ 
  content, 
  children, 
  position = 'top' 
}: TooltipProps) {
  const [isVisible, setIsVisible] = React.useState(false);

  const positionStyles = {
    top: '-translate-y-full -translate-x-1/2 -mt-2 left-1/2',
    bottom: 'translate-y-full -translate-x-1/2 mt-2 left-1/2',
    left: '-translate-x-full -translate-y-1/2 -ml-2 top-1/2',
    right: 'translate-x-full -translate-y-1/2 ml-2 top-1/2',
  };

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            className={`absolute z-50 ${positionStyles[position]}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.15 }}
          >
            <div className="px-2 py-1 text-xs font-medium text-white bg-gray-900 rounded-md whitespace-nowrap">
              {content}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}