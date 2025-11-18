import React from 'react';
import { motion } from 'framer-motion';

const Card = ({
  children,
  className = '',
  hover = false,
  padding = 'p-6',
  onClick,
  variant = 'default',
  ...props
}) => {
  const variantClasses = {
    default: 'glass-card',
    elevated: 'glass-card shadow-xl',
    flat: 'glass-card shadow-none',
    interactive: 'glass-card hover:shadow-glass-hover cursor-pointer',
  };

  const baseClasses = `${variantClasses[variant]} ${padding} ${onClick ? 'cursor-pointer' : ''}`;

  const Component = onClick ? motion.div : 'div';
  const motionProps = onClick ? {
    whileHover: { y: -1, scale: 1.005 },
    whileTap: { scale: 0.995 },
    transition: { type: "spring", stiffness: 400, damping: 25, duration: 0.1 }
  } : {};

  return (
    <Component
      className={`${baseClasses} ${className}`}
      onClick={onClick}
      {...motionProps}
      {...props}
    >
      {children}
    </Component>
  );
};

export default Card;
