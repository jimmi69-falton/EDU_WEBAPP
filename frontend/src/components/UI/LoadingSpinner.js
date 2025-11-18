import React from 'react';
import { motion } from 'framer-motion';

const LoadingSpinner = ({ size = 'md', color = 'primary', variant = 'default' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const colorClasses = {
    primary: 'border-[var(--primary-500)]',
    secondary: 'border-[var(--text-secondary)]',
    white: 'border-white',
    glass: 'border-[var(--glass-border)]',
  };

  const variantClasses = {
    default: 'border-2 border-t-transparent',
    glass: 'border-2 border-t-transparent backdrop-blur-sm',
    solid: 'border-2 border-t-transparent bg-[var(--glass-bg-secondary)]',
  };

  return (
    <div className="flex items-center justify-center">
      <motion.div
        className={`
          ${sizeClasses[size]} 
          ${colorClasses[color]} 
          ${variantClasses[variant]} 
          rounded-full
        `}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
    </div>
  );
};

export default LoadingSpinner;

