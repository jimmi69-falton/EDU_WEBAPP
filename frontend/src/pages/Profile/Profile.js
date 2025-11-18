import React, { useState } from 'react';
import {
  CameraIcon,
  PencilSquareIcon,
  CheckIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { notifications } from '../../utils/notifications';
// --- MỚI: Import Loading Spinner ---
import LoadingSpinner from '../../components/UI/LoadingSpinner'; 
// --- HẾT CODE MỚI ---

const Profile = () => {
  // const { user, updateUser } = useAuth();
  const { user, updateUser, updatePassword } = useAuth();
  const { t } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  // --- MỚI: Thêm state loading ---
  const [isSaving, setIsSaving] = useState(false);
  // --- HẾT CODE MỚI ---

  const [passwordData, setPasswordData] = useState({
      currentPassword: '', 
      newPassword: '',
      confirmPassword: '',
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Sử dụng tên trường của Frontend để tiện quản lý state
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
  });

  // --- SỬA LỖI LƯU: Xóa mock call và thêm API call thật ---
  const handleSave = async () => {
    setIsSaving(true);
    
    // 1. Map dữ liệu từ Frontend sang tên trường Backend
    const payload = {
      id: user?.id,
      name: formData.name,
      email: formData.email, // Email không nên thay đổi
      phone: formData.phone,
      address: formData.address,
    };

    // 2. Gọi hàm updateUser (sẽ được sửa trong AuthContext.js)
    try {
      const result = await updateUser(payload);

      if (result.success) {
        notifications.profileUpdated();
        setIsEditing(false);
      } else {
        notifications.actionFailed(result.error || t('updateProfile'));
      }
      
    } catch (e) {
      notifications.actionFailed(t('updateProfile') + ': ' + e.message);
    } finally {
      setIsSaving(false);
    }
  };
  // --- HẾT SỬA LỖI LƯU ---

  // --- THÊM HÀM XỬ LÝ INPUT MẬT KHẨU ---
   const handlePasswordChange = (e) => {
     setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
   };
// ------------------------------------

// --- THÊM HÀM XỬ LÝ ĐỔI MẬT KHẨU ---
   const handleChangePassword = async () => {
     const { currentPassword, newPassword, confirmPassword } = passwordData;

     if (newPassword.length < 6) {
        return notifications.warning(t('passwordLengthError'));
     }
     if (newPassword !== confirmPassword) {
        return notifications.warning(t('passwordMismatch'));
     }
     if (!currentPassword) { // <-- THÊM KIỂM TRA MẬT KHẨU HIỆN TẠI
        return notifications.warning(t('currentPasswordRequired')); 
        // (Bạn cần thêm key 'currentPasswordRequired' vào file ngôn ngữ)
    }

     setIsChangingPassword(true);

     try {
        const result = await updatePassword(currentPassword, newPassword);

        if (result.success) {
          // Reset form sau khi thành công (AuthContext đã xử lý logout)
          setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } else {
          if (result.error && result.error.includes("Mật khẩu hiện tại không chính xác")) {
        // Hiển thị thông báo rõ ràng, không bị thêm tiền tố "Không thể..."
            notifications.warning("Mật khẩu hiện tại không chính xác!"); 
        } else {
            // Dùng actionFailed cho các lỗi chung khác
            notifications.actionFailed(result.error || t('changePassword'));
    }
        }

     } catch (e) {
        notifications.actionFailed(t('changePassword') + ': ' + e.message);
     } finally {
        setIsChangingPassword(false);
     }
   };

  const handleCancel = () => {
    // Đảm bảo lấy lại dữ liệu mới nhất từ user context khi hủy
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || '',
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="h1">{t('myProfile')}</h1>
        {!isEditing ? (
          <button className="btn btn-primary" onClick={() => setIsEditing(true)}>
            <PencilSquareIcon className="w-5 h-5 mr-2" />
            {t('edit')}
          </button>
        ) : (
          <div className="flex space-x-3">
            <button className="btn btn-secondary" onClick={handleCancel} disabled={isSaving}>
              <XMarkIcon className="w-5 h-5 mr-2" />
              {t('cancel')}
            </button>
            <button className="btn btn-primary" onClick={handleSave} disabled={isSaving}>
              {isSaving ? <LoadingSpinner size="sm" /> : <CheckIcon className="w-5 h-5 mr-2" />}
              {t('save')}
            </button>
          </div>
        )}
      </div>

      {/* Avatar Section */}
      <div className="card p-8">
        <div className="flex items-center space-x-6">
          <div className="relative">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[var(--primary-600)] to-[var(--accent-600)] flex items-center justify-center text-white text-4xl font-bold">
              {formData.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <button
              className="absolute bottom-0 right-0 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
              onClick={() => notifications.avatarUpdated()}
            >
              <CameraIcon className="w-5 h-5 text-[var(--neutral-600)]" />
            </button>
          </div>
          <div>
            <h2 className="h2">{formData.name || 'Chưa có tên'}</h2>
            <p className="subtitle mt-1">{formData.email}</p>
            <div className="flex space-x-3 mt-3">
              <span className="badge badge-info">ID: {user?.id || 'N/A'}</span>
              <span className="badge badge-healthy">{user?.role || 'student'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <div className="card p-6">
        <h3 className="h3 mb-6">{t('personalInfo')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-[var(--neutral-700)] mb-2">Họ và tên</label>
            <input
              className="input"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              disabled={!isEditing}
              placeholder="Nhập họ và tên"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--neutral-700)] mb-2">Email</label>
            <input
              className="input"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              disabled={true} // Email không cho phép sửa
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--neutral-700)] mb-2">{t('phone')}</label>
            <input
              className="input"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              disabled={!isEditing}
              placeholder={t('enterPhone')}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--neutral-700)] mb-2">{t('address')}</label>
            <input
              className="input"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              disabled={!isEditing}
              placeholder={t('enterAddress')}
            />
          </div>
        </div>
      </div>

      {/* Role Information */}
      <div className="card p-6">
        <h3 className="h3 mb-6">Thông tin tài khoản</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-[var(--neutral-700)] mb-2">Vai trò</label>
            <input
              className="input"
              value={user?.role === 'admin' ? 'Quản trị viên' : user?.role === 'teacher' ? 'Giáo viên' : 'Học sinh'}
              disabled={true}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--neutral-700)] mb-2">Ngày tạo tài khoản</label>
            <input
              className="input"
              value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
              disabled={true}
            />
          </div>
        </div>
      </div>

      {/* Password Section */}
      <div className="card p-6">
        <h3 className="h3 mb-6">Đổi mật khẩu</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-[var(--neutral-700)] mb-2">Mật khẩu hiện tại</label>
            <input
              className="input"
              type="password"
              value={passwordData.currentPassword}
              onChange={handlePasswordChange}
              name="currentPassword"
              placeholder="Nhập mật khẩu hiện tại"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--neutral-700)] mb-2">Mật khẩu mới</label>
            <input
              className="input"
              type="password"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              name="newPassword"
              placeholder="Nhập mật khẩu mới"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--neutral-700)] mb-2">Xác nhận mật khẩu</label>
            <input
              className="input"
              type="password"
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
              name="confirmPassword"
              placeholder="Xác nhận mật khẩu mới"
            />
          </div>
        </div>
        <div className="mt-4">
          <button
            className="btn btn-primary"
            onClick={handleChangePassword}
            disabled={isChangingPassword}
          >
            {isChangingPassword ? <LoadingSpinner size="sm" /> : 'Đổi mật khẩu'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;