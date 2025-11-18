import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  BellIcon,
  SunIcon,
  MoonIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  XMarkIcon,
  GlobeAltIcon, // 🔸 Added for language toggle
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { useLanguage } from '../../contexts/LanguageContext';
// Thêm ICON mới: VI và EN
import LanguageVieIcon from '../../icons/LanguageVieIcon';
import LanguageEngIcon from '../../icons/LanguageEngIcon';


const Topbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { notifications: notifList, unreadCount, markAsRead, markAllAsRead, deleteNotification, clearAll } = useNotifications();
  const { t, language, changeLanguage } = useLanguage(); // 🔸 lấy language
  const navigate = useNavigate();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const notifRef = useRef(null);
  const userMenuRef = useRef(null);
  const searchRef = useRef(null);
  const [notifPosition, setNotifPosition] = useState({ top: 0, right: 0 });
  const [userMenuPosition, setUserMenuPosition] = useState({ top: 0, right: 0 });
  const [searchPosition, setSearchPosition] = useState({ top: 0, right: 0 });

  // 📍 Tính vị trí dropdown
  const calculateNotifPosition = () => {
    if (notifRef.current) {
      const rect = notifRef.current.getBoundingClientRect();
      setNotifPosition({
        top: rect.bottom + window.scrollY + 4,
        right: window.innerWidth - rect.right - window.scrollX,
      });
    }
  };

  const calculateSearchPosition = () => {
    if (searchRef.current) {
      const rect = searchRef.current.getBoundingClientRect();
      setSearchPosition({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  };

  const calculateUserMenuPosition = () => {
    if (userMenuRef.current) {
      const rect = userMenuRef.current.getBoundingClientRect();
      setUserMenuPosition({
        top: rect.bottom + window.scrollY + 4,
        right: window.innerWidth - rect.right - window.scrollX,
      });
    }
  };

  // 📍 Logic tìm kiếm
  const performSearch = (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    const allResults = [
      {
        id: 1,
        title: t('dashboard'),
        description: 'Xem tổng quan tiến trình học tập',
        type: 'page',
        path: '/dashboard',
        icon: '🏠'
      },
      {
        id: 2,
        title: 'Bài học',
        description: 'Xem danh sách bài học và tiến trình',
        type: 'page',
        path: '/lessons',
        icon: '📚'
      },
      {
        id: 3,
        title: 'Bài tập',
        description: 'Xem và làm bài tập',
        type: 'page',
        path: '/assignments',
        icon: '📝'
      },
      {
        id: 4,
        title: 'Lịch học',
        description: 'Xem lịch học và sự kiện',
        type: 'page',
        path: '/calendar',
        icon: '📅'
      },
      {
        id: 5,
        title: 'Thời gian học',
        description: 'Theo dõi thời gian học tập',
        type: 'page',
        path: '/study-time',
        icon: '⏱️'
      },
      {
        id: 6,
        title: t('chatbot'),
        description: 'Trợ lý AI hỗ trợ học tập',
        type: 'page',
        path: '/chatbot',
        icon: '🤖'
      },
      {
        id: 7,
        title: t('profile'),
        description: 'Thông tin cá nhân',
        type: 'page',
        path: '/profile',
        icon: '👤'
      },
      {
        id: 8,
        title: t('settings'),
        description: 'Cài đặt tài khoản',
        type: 'page',
        path: '/settings',
        icon: '⚙️'
      }
    ];

    // Thêm các kết quả dành cho giáo viên nếu là giáo viên
    if (user?.role === 'teacher' || user?.role === 'admin') {
      allResults.push({
        id: 9,
        title: 'Quản lý bài học',
        description: 'Tạo và quản lý bài học',
        type: 'page',
        path: '/teacher/lessons',
        icon: '📖'
      });
    }

    // Thêm các kết quả dành cho admin
    if (user?.role === 'admin') {
      allResults.push({
        id: 10,
        title: 'Quản lý người dùng',
        description: 'Quản lý tài khoản người dùng',
        type: 'page',
        path: '/admin/users',
        icon: '👥'
      });
    }

    const filteredResults = allResults.filter(item => 
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.description.toLowerCase().includes(query.toLowerCase())
    );

    setSearchResults(filteredResults);
    setShowSearchResults(true);
  };

  // 📍 Đóng khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 📍 Xử lý tìm kiếm
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch(searchQuery);
    }, 300); // Debounce 300ms

    return () => clearTimeout(timeoutId);
  }, [searchQuery, user?.role]);

  // 📍 Cập nhật vị trí khi mở dropdown
  useEffect(() => {
    if (showNotifications) calculateNotifPosition();
  }, [showNotifications]);

  useEffect(() => {
    if (showUserMenu) calculateUserMenuPosition();
  }, [showUserMenu]);

  useEffect(() => {
    if (showSearchResults) calculateSearchPosition();
  }, [showSearchResults]);

  // 📍 Cập nhật vị trí khi scroll hoặc resize
  useEffect(() => {
    const handleScroll = () => {
      if (showNotifications) calculateNotifPosition();
      if (showUserMenu) calculateUserMenuPosition();
    };

    const handleResize = () => {
      if (showNotifications) calculateNotifPosition();
      if (showUserMenu) calculateUserMenuPosition();
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, [showNotifications, showUserMenu]);

  return (
    <>
      <nav
        className="glass-topbar sticky top-4 z-40 ml-6 mr-8 rounded-2xl shadow-sm"
        style={{
          boxShadow:
            '0 -5px 15px -3px rgba(0, 0, 0, 0.2), 0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 4px 6px -2px rgba(0, 0, 0, 0.1)',
        }}
      >
        <div className="max-w-5xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            {/* Search */}
            <div className="flex-1 max-w-xl" ref={searchRef}>
              <div className="relative">
                <input
                  type="text"
                  placeholder={t('search')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => {
                    if (searchQuery.trim()) {
                      setShowSearchResults(true);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && searchResults.length > 0) {
                      navigate(searchResults[0].path);
                      setShowSearchResults(false);
                      setSearchQuery('');
                    }
                    if (e.key === 'Escape') {
                      setShowSearchResults(false);
                    }
                  }}
                  className="w-full pl-12 pr-12 py-3 text-[var(--text-primary)] placeholder-[var(--text-tertiary)] rounded-full bg-[var(--glass-bg-primary)] border-0 outline-none focus:ring-2 focus:ring-[var(--primary-100)] transition-all duration-300"
                  style={{ 
                    boxShadow: '0 4px 12px -2px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    backdropFilter: 'blur(10px)'
                  }}
                />
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[var(--neutral-400)] pointer-events-none" />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setShowSearchResults(false);
                    }}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[var(--neutral-400)] hover:text-[var(--neutral-600)] transition-colors"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center space-x-3 ml-6">
              {/* Theme Toggle */}
              <motion.button
                className="p-2.5 rounded-xl glass-button hover:bg-[var(--glass-bg-hover)] text-[var(--text-secondary)] transition-colors"
                onClick={toggleTheme}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  boxShadow:
                    '0 4px 8px -2px rgba(0, 0, 0, 0.12), 0 2px 4px -1px rgba(0, 0, 0, 0.08)',
                }}
              >
                {theme === 'dark' ? (
                  <SunIcon className="w-5 h-5" />
                ) : (
                  <MoonIcon className="w-5 h-5" />
                )}
              </motion.button>

              {/* 🔸 Added Language Toggle */}
              <motion.button
                className="p-2.5 rounded-xl glass-button hover:bg-[var(--glass-bg-hover)] text-[var(--text-secondary)] transition-colors flex items-center justify-center"
                onClick={() => changeLanguage(language === 'vi' ? 'en' : 'vi')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title={language === 'vi' ? 'Switch to English' : 'Chuyển sang Tiếng Việt'}
                style={{
                  width: '42px',
                  height: '42px',
                  boxShadow:
                    '0 4px 8px -2px rgba(0, 0, 0, 0.12), 0 2px 4px -1px rgba(0, 0, 0, 0.08)',
                }}
              >
                {language === 'vi' ? (
                  <LanguageVieIcon className="w-5 h-5" />
                ) : (
                  <LanguageEngIcon className="w-5 h-5" />
                )}
              </motion.button>


              {/* Notifications */}
              <div className="relative" ref={notifRef}>
                <motion.button
                  className="p-2.5 rounded-xl glass-button hover:bg-[var(--glass-bg-hover)] text-[var(--text-secondary)] transition-colors relative"
                  onClick={() => setShowNotifications(!showNotifications)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    boxShadow:
                      '0 4px 8px -2px rgba(0, 0, 0, 0.12), 0 2px 4px -1px rgba(0, 0, 0, 0.08)',
                  }}
                >
                  <BellIcon className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-[var(--status-danger)] text-white text-xs rounded-full flex items-center justify-center px-1.5 font-semibold">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </motion.button>
              </div>

              {/* User Menu */}
              <div className="relative" ref={userMenuRef}>
                <motion.button
                  className="flex items-center space-x-3 p-2 rounded-xl glass-button hover:bg-[var(--glass-bg-hover)] transition-colors"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  style={{
                    boxShadow:
                      '0 4px 8px -2px rgba(0, 0, 0, 0.12), 0 2px 4px -1px rgba(0, 0, 0, 0.08)',
                  }}
                >
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--primary-600)] to-[var(--accent-600)] flex items-center justify-center text-white font-semibold text-sm">
                    {user?.firstName?.charAt(0)}
                    {user?.lastName?.charAt(0)}
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="font-semibold text-sm text-[var(--neutral-800)]">
                      {user?.firstName} {user?.lastName}
                    </p>
                    {/* <p className="text-xs text-[var(--neutral-500)]">{user?.role || 'User'}</p> */}
                  </div>
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Notification Dropdown */}
      <AnimatePresence>
        {showNotifications && (
          <motion.div
            className="fixed inset-0 z-[9999]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowNotifications(false)}
          >
            <motion.div
              className="absolute w-96 glass-modal shadow-xl max-h-[80vh] overflow-hidden flex flex-col"
              style={{
                top: `${notifPosition.top}px`,
                right: `${notifPosition.right}px`,
              }}
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-[var(--glass-border)] flex items-center justify-between">
                <h3 className="font-semibold text-[var(--text-primary)]">
                  {t('notificationCenter')} {unreadCount > 0 && `(${unreadCount})`}
                </h3>
                <div className="flex space-x-2">
                  {unreadCount > 0 && (
                    <button
                      className="text-xs text-[var(--primary-600)] hover:underline"
                      onClick={markAllAsRead}
                    >
                      {t('markAsRead')}
                    </button>
                  )}
                  {notifList.length > 0 && (
                    <button
                      className="text-xs text-[var(--status-danger)] hover:underline"
                      onClick={clearAll}
                    >
                      {t('clearAll')}
                    </button>
                  )}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                {notifList.length === 0 ? (
                  <div className="p-12 text-center">
                    <BellIcon className="w-16 h-16 mx-auto text-[var(--neutral-300)] mb-3" />
                    <p className="text-[var(--neutral-500)] font-medium">{t('noNotifications')}</p>
                    <p className="text-xs text-[var(--neutral-400)] mt-1">
                      {t('language') === 'vi'
                        ? 'Các hoạt động của bạn sẽ xuất hiện ở đây'
                        : 'Your activities will appear here'}
                    </p>
                  </div>
                ) : (
                  notifList.map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-4 border-b border-[var(--neutral-200)] cursor-pointer ${
                        !notif.read ? 'bg-[var(--primary-50)]' : ''
                      }`}
                      onClick={() => {
                        markAsRead(notif.id);
                        if (notif.link) {
                          navigate(notif.link);
                          setShowNotifications(false);
                        }
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 pr-2">
                          <div className="flex items-center space-x-2 mb-1">
                            <span
                              className={`w-2 h-2 rounded-full flex-shrink-0 ${
                                notif.type === 'success'
                                  ? 'bg-[var(--status-healthy)]'
                                  : notif.type === 'error'
                                  ? 'bg-[var(--status-danger)]'
                                  : 'bg-[var(--status-info)]'
                              }`}
                            />
                            <h4 className="font-semibold text-sm text-[var(--neutral-800)]">
                              {notif.title}
                            </h4>
                            {!notif.read && (
                              <span className="w-2 h-2 bg-[var(--primary-600)] rounded-full flex-shrink-0 animate-pulse" />
                            )}
                          </div>
                          <p className="text-sm text-[var(--neutral-600)] ml-4">
                            {notif.message}
                          </p>
                          <p className="text-xs text-[var(--neutral-500)] mt-1 ml-4">
                            {formatTimestamp(notif.timestamp)}
                          </p>
                        </div>
                        <button
                          className="ml-2 p-1 hover:bg-[var(--neutral-200)] rounded flex-shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notif.id);
                          }}
                        >
                          <XMarkIcon className="w-4 h-4 text-[var(--neutral-500)]" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* User Dropdown */}
      <AnimatePresence>
        {showUserMenu && (
          <motion.div
            className="fixed inset-0 z-[9999]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowUserMenu(false)}
          >
            <motion.div
              className="absolute w-56 glass-modal shadow-xl"
              style={{
                top: `${userMenuPosition.top}px`,
                right: `${userMenuPosition.right}px`,
              }}
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-[var(--glass-border)]">
                <p className="font-semibold text-[var(--text-primary)]">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-[var(--text-secondary)] text-sm">{user?.email}</p>
              </div>
              <div className="py-2">
                <button
                  className="w-full px-4 py-2 text-left flex items-center space-x-3 text-[var(--text-primary)] rounded-lg mx-2"
                  onClick={() => {
                    setShowUserMenu(false);
                    navigate('/profile');
                  }}
                >
                  <UserCircleIcon className="w-5 h-5" />
                  <span>{t('profile')}</span>
                </button>
                <button
                  className="w-full px-4 py-2 text-left flex items-center space-x-3 text-[var(--text-primary)] rounded-lg mx-2"
                  onClick={() => {
                    setShowUserMenu(false);
                    navigate('/settings');
                  }}
                >
                  <Cog6ToothIcon className="w-5 h-5" />
                  <span>{t('settings')}</span>
                </button>
                <div className="border-t border-[var(--glass-border)] my-2" />
                <button
                  className="w-full px-4 py-2 text-left flex items-center space-x-3 text-[var(--status-danger)] rounded-lg mx-2"
                  onClick={() => {
                    logout();
                    setShowUserMenu(false);
                  }}
                >
                  <ArrowRightOnRectangleIcon className="w-5 h-5" />
                  <span>{t('logout')}</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Results Dropdown */}
      <AnimatePresence>
        {showSearchResults && (
          <motion.div
            className="fixed inset-0 z-[9999]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowSearchResults(false)}
          >
            <motion.div
              className="absolute glass-modal shadow-xl max-h-[60vh] overflow-hidden flex flex-col"
              style={{
                top: `${searchPosition.top}px`,
                left: `${searchPosition.left}px`,
                width: `${searchPosition.width}px`,
              }}
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-[var(--glass-border)]">
                <h3 className="font-semibold text-[var(--text-primary)]">
                  {t('search')} "{searchQuery}"
                </h3>
              </div>

              <div className="flex-1 overflow-y-auto">
                {searchResults.length === 0 ? (
                  <div className="p-8 text-center">
                    <MagnifyingGlassIcon className="w-12 h-12 mx-auto text-[var(--neutral-300)] mb-3" />
                    <p className="text-[var(--neutral-500)] font-medium">
                      {t('noData')}
                    </p>
                    <p className="text-xs text-[var(--neutral-400)] mt-1">
                      {t('tryDifferentSearch')}
                    </p>
                  </div>
                ) : (
                  searchResults.map((result) => (
                    <div
                      key={result.id}
                      className="p-4 border-b border-[var(--neutral-200)] cursor-pointer hover:bg-[var(--glass-bg-hover)] transition-colors"
                      onClick={() => {
                        navigate(result.path);
                        setShowSearchResults(false);
                        setSearchQuery('');
                      }}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="text-2xl">{result.icon}</div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm text-[var(--text-primary)] mb-1">
                            {result.title}
                          </h4>
                          <p className="text-xs text-[var(--text-secondary)]">
                            {result.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// Helper function
const formatTimestamp = (timestamp) => {
  const now = new Date();
  const date = new Date(timestamp);
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Vừa xong';
  if (diffMins < 60) return `${diffMins} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays < 7) return `${diffDays} ngày trước`;
  return date.toLocaleDateString('vi-VN');
};

export default Topbar;
  