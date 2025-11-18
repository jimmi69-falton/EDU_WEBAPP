import toast from 'react-hot-toast';

// Global notification manager - will be set by NotificationProvider
let notificationManager = null;

export const setNotificationManager = (manager) => {
  notificationManager = manager;
};

// Success notifications
export const notifySuccess = (message) => {
  toast.success(message, {
    duration: 3000,
    position: 'top-right',
  });
};

// Error notifications
export const notifyError = (message) => {
  toast.error(message, {
    duration: 4000,
    position: 'top-right',
  });
};

// Info notifications
export const notifyInfo = (message) => {
  toast(message, {
    duration: 3000,
    icon: 'ℹ️',
    position: 'top-right',
  });
};

// Add to notification center
const addToCenter = (type, title, message, link) => {
  if (notificationManager) {
    notificationManager.addNotification({
      type,
      title,
      message,
      link,
    });
  }
};

// Specific health notifications
export const notifications = {
  // Reminders
  reminderCreated: () => {
    notifySuccess('✅ Đã tạo nhắc nhở thành công');
    addToCenter('success', 'Nhắc nhở mới', 'Đã tạo nhắc nhở thành công', '/reminder');
  },
  reminderUpdated: () => {
    notifySuccess('✏️ Đã cập nhật nhắc nhở');
    addToCenter('info', 'Cập nhật nhắc nhở', 'Nhắc nhở đã được cập nhật', '/reminder');
  },
  reminderDeleted: () => {
    notifySuccess('🗑️ Đã xóa nhắc nhở');
  },
  reminderEnabled: () => notifyInfo('🔔 Đã bật nhắc nhở'),
  reminderDisabled: () => notifyInfo('🔕 Đã tắt nhắc nhở'),

  // Fitness
  workoutStarted: (title) => {
    notifySuccess(`💪 Bắt đầu: ${title}`);
    addToCenter('info', 'Bắt đầu tập luyện', `Đang tập: ${title}`, '/fitness');
  },
  workoutCompleted: (title) => {
    notifySuccess(`✅ Hoàn thành: ${title}! Tuyệt vời!`);
    addToCenter('success', 'Hoàn thành bài tập', `Đã hoàn thành: ${title}`, '/fitness');
  },
  workoutUncompleted: (title) => notifyInfo(`⏸️ Đã bỏ đánh dấu: ${title}`),

  // Profile
  profileUpdated: () => {
    notifySuccess('👤 Đã cập nhật hồ sơ');
    addToCenter('success', 'Cập nhật hồ sơ', 'Thông tin cá nhân đã được cập nhật', '/profile');
  },
  avatarUpdated: () => notifySuccess('🖼️ Đã đổi ảnh đại diện'),
  passwordChanged: () => {
    notifySuccess('🔒 Đã thay đổi mật khẩu');
    addToCenter('success', 'Bảo mật', 'Mật khẩu đã được thay đổi', '/profile');
  },

  // Settings
  settingsSaved: () => notifySuccess('⚙️ Đã lưu cài đặt'),
  languageChanged: (lang) => notifySuccess(`🌐 Đã chuyển sang ${lang === 'vi' ? 'Tiếng Việt' : 'English'}`),
  themeChanged: (theme) => notifyInfo(`${theme === 'dark' ? '🌙 Dark mode' : '☀️ Light mode'}`),

  // Measurements
  measurementAdded: () => {
    notifySuccess('📊 Đã thêm chỉ số sức khỏe');
    addToCenter('success', 'Chỉ số sức khỏe', 'Đã cập nhật chỉ số mới', '/dashboard');
  },
  
  // General
  loginSuccess: (name) => {
    notifySuccess(`Chào mừng, ${name}! 👋`);
    addToCenter('info', 'Đăng nhập thành công', `Chào mừng trở lại, ${name}`, '/dashboard');
  },
  logoutSuccess: () => notifySuccess('Đã đăng xuất'),
  actionFailed: (action) => notifyError(`❌ Không thể ${action}. Vui lòng thử lại.`),
  

  actionSuccess: (action) => {
    toast.success(` ${action} thành công!`);
  },
  // AI Chat
  aiThinking: () => notifyInfo('🤖 AI đang suy nghĩ...'),
  aiError: () => notifyError('⚠️ AI không thể trả lời lúc này'),

  //change password
  changedPasswordSuccess: (message) => {
     notifySuccess(message); 
  },

  deleteAccountSuccess: (message) => {
     notifySuccess(message); 
  },

  warning: (message) => {
    // Dùng notifyInfo hoặc notifyError, hoặc toast tùy chỉnh màu vàng
    // Tạm thời dùng notifyInfo với icon cảnh báo:
    toast(message, {
       duration: 3000,
       icon: '⚠️', // Icon cảnh báo
       position: 'top-right',
     });
  },
};

