import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Squares2X2Icon,
  BookOpenIcon,
  ClipboardDocumentListIcon,
  CalendarDaysIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
  Bars3Icon,
  XMarkIcon,
  UserGroupIcon,
  AcademicCapIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';


const NewSidebar = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { user } = useAuth();
  const { t } = useLanguage();
  const { theme } = useTheme();

  // Menu items based on user role
  const getNavigationItems = () => {
    const baseItems = [
      {
        name: 'Dashboard',
        href: '/dashboard',
        icon: Squares2X2Icon,
      },
    ];

    if (user?.role === 'student') {
      return [
        ...baseItems,
        {
          name: 'Bài học',
          href: '/lessons',
          icon: BookOpenIcon,
        },
        {
          name: 'Bài tập',
          href: '/assignments',
          icon: ClipboardDocumentListIcon,
        },
        {
          name: 'Lịch học',
          href: '/calendar',
          icon: CalendarDaysIcon,
        },
        {
          name: 'Thời gian học',
          href: '/study-time',
          icon: ClockIcon,
        },
        {
          name: 'Chatbot',
          href: '/chatbot',
          icon: ChatBubbleLeftRightIcon,
        },
      ];
    } else if (user?.role === 'teacher') {
      return [
        ...baseItems,
        {
          name: 'Quản lý bài học',
          href: '/teacher/lessons',
          icon: BookOpenIcon,
        },
        {
          name: 'Bài tập',
          href: '/assignments',
          icon: ClipboardDocumentListIcon,
        },
        {
          name: 'Lịch học',
          href: '/calendar',
          icon: CalendarDaysIcon,
        },
        {
          name: 'Chatbot',
          href: '/chatbot',
          icon: ChatBubbleLeftRightIcon,
        },
      ];
    } else if (user?.role === 'admin') {
      return [
        ...baseItems,
        {
          name: 'Quản lý người dùng',
          href: '/admin/users',
          icon: UserGroupIcon,
        },
        {
          name: 'Lịch hệ thống',
          href: '/calendar',
          icon: CalendarDaysIcon,
        },
        {
          name: 'Chatbot',
          href: '/chatbot',
          icon: ChatBubbleLeftRightIcon,
        },
      ];
    }

    return baseItems;
  };

  const navigationItems = getNavigationItems();

  const NavItem = ({ item }) => (
    <NavLink
      to={item.href}
      className={({ isActive }) => `
        relative group flex items-center px-4 py-3 mx-3 rounded-xl transition-all duration-300
        ${isActive 
          ? theme === 'dark'
            ? 'glass-button bg-gradient-to-r from-[var(--primary-500)] to-[var(--primary-600)] text-white shadow-lg'
            : 'glass-button bg-[var(--glass-bg-hover)] text-[var(--text-primary)] shadow-md'
          : 'glass-button text-[var(--text-secondary)] hover:bg-[var(--glass-bg-hover)] hover:text-[var(--text-primary)]'
        }
      `}
      style={({ isActive }) => ({
        boxShadow: isActive 
          ? theme === 'dark'
            ? '0 6px 12px -4px rgba(0, 0, 0, 0.2), 0 3px 6px -2px rgba(0, 0, 0, 0.15)'
            : '0 4px 8px -2px rgba(0, 0, 0, 0.12), 0 2px 4px -1px rgba(0, 0, 0, 0.08)'
          : '0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 1px 2px -1px rgba(0, 0, 0, 0.04)'
      })}
      onClick={() => setIsMobileOpen(false)}
    >
      {({ isActive }) => (
        <>
          <item.icon 
            className={`w-5 h-5 flex-shrink-0 ${isActive ? (theme === 'dark' ? 'text-white' : 'text-[var(--text-primary)]') : ''}`} 
          />
          <span 
            className={`ml-3 font-medium text-sm ${isActive ? (theme === 'dark' ? 'text-white' : 'text-[var(--text-primary)]') : ''}`}
          >
            {item.name}
          </span>
        </>
      )}
    </NavLink>
  );

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile menu button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 rounded-lg bg-white shadow-md"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? (
          <XMarkIcon className="w-6 h-6 text-[var(--neutral-700)]" />
        ) : (
          <Bars3Icon className="w-6 h-6 text-[var(--neutral-700)]" />
        )}
      </button>

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:relative top-4 left-4 lg:top-4 lg:left-4 z-40
          glass-sidebar rounded-2xl overflow-hidden
          transition-all duration-300 ease-in-out shadow-md
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          w-64 h-[calc(100%-2rem)]
        `}
        style={{ boxShadow: '0 -5px 15px -3px rgba(0, 0, 0, 0.2), 0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 4px 6px -2px rgba(0, 0, 0, 0.1)' }}
      >
        <div className="flex flex-col h-full">
          {/* Header */}

          <div className="p-5 border-b border-[var(--glass-border)]">
            <AnimatePresence mode="wait">
              {true ? (
                <motion.div
                  className="flex flex-col items-center space-y-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="w-full rounded-xl flex items-center justify-center overflow-hidden">
                    <motion.img
                      key={theme}
                      src="/newlogo.png"
                      alt="Education Extracurricular Classes Logo"
                      className="w-full h-auto object-contain transition-all duration-500"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.4, ease: 'easeInOut' }}
                    />
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  className="flex justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="w-full rounded-xl flex items-center justify-center overflow-hidden">
                    <motion.img
                      key={theme}
                      src="/newlogo.png"
                      alt="Education Extracurricular Classes Logo"
                      className="w-full h-auto object-contain transition-all duration-500"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.4, ease: 'easeInOut' }}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>


          {/* Navigation */}
          <nav className="flex-1 py-6 space-y-2 overflow-y-auto">
            {navigationItems.map((item) => (
              <NavItem key={item.name} item={item} />
            ))}
          </nav>

          {/* User Info */}
          <div className="p-4 border-t border-[var(--glass-border)]">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--primary-500)] to-[var(--primary-600)] flex items-center justify-center text-white font-semibold shadow-lg" style={{ boxShadow: '0 4px 8px -2px rgba(0, 0, 0, 0.12), 0 2px 4px -1px rgba(0, 0, 0, 0.08)' }}>
                {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
              </div>
              <AnimatePresence>
                {true && (
                  <motion.div
                    className="flex-1 min-w-0"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <p className="text-[var(--text-primary)] font-medium text-sm truncate">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-[var(--text-secondary)] text-xs truncate">
                      ID: {user?.id || 'N/A'}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default NewSidebar;

