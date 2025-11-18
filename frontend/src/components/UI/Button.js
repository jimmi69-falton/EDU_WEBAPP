import React from 'react';
import { motion } from 'framer-motion';
import LoadingSpinner from './LoadingSpinner';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon: Icon,
  iconPosition = 'left',
  className = '',
  onClick,
  type = 'button',
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium glass-transition focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-xl shadow-sm';
  
  const variantClasses = {
    primary: 'bg-gradient-to-r from-[var(--primary-500)] to-[var(--primary-600)] text-white hover:from-[var(--primary-600)] hover:to-[var(--primary-700)] border border-[var(--primary-500)]',
    secondary: 'glass-button bg-[var(--glass-bg-secondary)] text-[var(--text-primary)] hover:bg-[var(--glass-bg-hover)]',
    danger: 'bg-gradient-to-r from-[var(--status-danger)] to-[var(--apple-red)] text-white hover:from-[var(--apple-red)] hover:to-[var(--apple-red-dark)] border border-[var(--status-danger)]',
    success: 'bg-gradient-to-r from-[var(--status-healthy)] to-[var(--apple-green)] text-white hover:from-[var(--apple-green)] hover:to-[var(--apple-green-dark)] border border-[var(--status-healthy)]',
    glass: 'glass-button bg-[var(--gradient-glass)] text-[var(--text-primary)] hover:bg-[var(--gradient-glass-hover)]',
  };

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm rounded-lg',
    md: 'px-6 py-3 text-base rounded-xl',
    lg: 'px-8 py-4 text-lg rounded-2xl',
  };

  const isDisabled = disabled || loading;

  return (
    <motion.button
      type={type}
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
      disabled={isDisabled}
      onClick={onClick}
      whileHover={!isDisabled ? { scale: 1.01, y: -0.5 } : {}}
      whileTap={!isDisabled ? { scale: 0.99 } : {}}
      transition={{ duration: 0.1, ease: "easeOut" }}
      {...props}
    >
      {loading ? (
        <LoadingSpinner size="sm" />
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon className="w-5 h-5 mr-2" />}
          {children}
          {Icon && iconPosition === 'right' && <Icon className="w-5 h-5 ml-2" />}
        </>
      )}
    </motion.button>
  );
};

export default Button;
