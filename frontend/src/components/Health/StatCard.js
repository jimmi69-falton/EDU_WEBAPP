import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { ArrowRightCircleIcon } from '@heroicons/react/24/outline';

const StatCard = ({ title, value, unit, unitPosition = 'after', subtitle, icon: Icon, color = 'primary', customIconBg, onClick, className }) => {
  const { theme } = useTheme();
  
  const colorClasses = {
    primary: 'from-blue-500 to-cyan-500',
    accent: 'from-green-500 to-emerald-500',
    danger: 'from-red-500 to-pink-500',
    warning: 'from-yellow-500 to-amber-500',
  };

  const iconBgClass = color === 'custom' ? customIconBg : `bg-gradient-to-br ${colorClasses[color]}`;

  return (
    <div
      onClick={onClick}
      // THAY ĐỔI CHÍNH NẰM Ở ĐÂY: p-4 thay cho p-6 và bỏ min-h
      className={`group p-2.5 rounded-xl shadow-lg border hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col ${
        theme === 'dark'
          ? 'bg-[var(--glass-bg-primary)] border-[var(--glass-border)]'
          : 'bg-white border-gray-200'
      } ${onClick ? 'cursor-pointer' : ''} ${className || ''}`}
      style={{ boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' }}
    >
      {/* Phần đầu */}
      <div className="flex items-start justify-between">
        <p className="text-[var(--text-primary)] text-base font-semibold">
          {title}
        </p>
        {Icon && (
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center ${iconBgClass}`}
          >
            <Icon className="w-6 h-6 text-white" />
          </div>
        )}
      </div>

      {/* Phần giữa */}
      <div className="flex-grow flex items-end">
        {subtitle ? (
          <p className="text-base font-semibold text-[var(--text-secondary)]">
            {subtitle}
          </p>
        ) : (
          <p className="text-xl font-semibold text-[var(--text-primary)]">
            {unitPosition === 'before' && <span className="text-base font-semibold text-[var(--text-secondary)]">{unit}</span>}
            {value}
            {unitPosition === 'after' && <span className="text-base font-semibold text-[var(--text-secondary)]">{unit}</span>}
          </p>
        )}
      </div>

      {/* Phần cuối (được đẩy xuống đáy) */}
      {onClick && (
        <div className="mt-auto self-end -mb-1 -mr-1">
          <ArrowRightCircleIcon className="w-7 h-7 text-gray-300 group-hover:text-[var(--primary-500)] transition-colors duration-300" />
        </div>
      )}
    </div>
  );
};

export default StatCard;