import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { EyeIcon, EyeSlashIcon, UserIcon, EnvelopeIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import toast from 'react-hot-toast';
// --- MỚI: Thêm Spinner ---
import LoadingSpinner from '../../components/UI/LoadingSpinner'; 
// --- HẾT CODE MỚI ---

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { register: registerUser } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors },
  } = useForm();

  const password = watch('password');

  const onSubmit = async (data) => {
    setIsLoading(true);
    // Map data để gửi đúng format cho backend
    const registerData = {
      name: data.name,
      email: data.email,
      password: data.password,
      role: data.role || 'student', // Mặc định là student
      phone: data.phone || '',
      address: data.address || '',
    };
    const result = await registerUser(registerData);

    if (result.success) {
      //navigate('/dashboard'); 
    } else {
      const errorMessage = result.error || t('registrationError');
      
      if (errorMessage.includes('Email đã được sử dụng') || errorMessage.includes('email already exists')) {
          setError('email', { 
              type: 'manual', 
              message: errorMessage 
          });
      }
      toast.error(errorMessage);

    } 

    setIsLoading(false);
    
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 bg-no-repeat bg-cover bg-center"
      style={{ backgroundImage: "url('/image0.jpg')" }}
    >
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0 }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div 
            className="flex flex-col items-center mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
              <motion.img
              src="/newlogo.png"
              alt="Education Extracurricular Classes Logo"
              className="w-64 h-auto object-contain"
              whileHover={{ scale: 1.05, y: -10 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
            />
          </motion.div>
          <h1 className="text-4xl font-extrabold text-teal-600 drop-shadow-md mb-2">
            {t('createAccount')}
          </h1>
        </div>

        {/* Registration Form */}
        <motion.div
          className="card p-8"
          style={{
            backgroundColor: '#ffffff',
            color: '#1f2937',
            border: '1px solid #e5e7eb',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-[var(--neutral-700)] mb-2">
                Họ và tên
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[var(--neutral-400)]" />
                <input
                  {...register('name', { required: 'Vui lòng nhập họ và tên' })}
                  className="w-full border border-gray-200 rounded-lg py-3 pl-10 pr-4 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all duration-200"
                  placeholder="Nhập họ và tên"
                />
              </div>
              {errors.name && (
                <p className="text-[var(--status-danger)] text-xs mt-1">{errors.name.message}</p>
              )}
            </div>

            {/* Email (Đã đúng) */}
            <div>
              <label className="block text-sm font-medium text-[var(--neutral-700)] mb-2">
                {t('email')}
              </label>
              <div className="relative">
                <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[var(--neutral-400)]" />
                <input
                  {...register('email', {
                    required: t('emailRequired'),
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: t('invalidEmail')
                    }
                  })}
                  type="email"
                  className="w-full border border-gray-200 rounded-lg py-3 pl-10 pr-4 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all duration-200"
                  placeholder={t('enterEmail')}
                />
              </div>
              {errors.email && (
                <p className="text-[var(--status-danger)] text-xs mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-[var(--neutral-700)] mb-2">
                Mật khẩu
              </label>
              <div className="relative">
                <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[var(--neutral-400)]" />
                <input
                  {...register('password', {
                    required: 'Vui lòng nhập mật khẩu',
                    minLength: {
                      value: 6,
                      message: 'Mật khẩu phải có ít nhất 6 ký tự'
                    }
                  })}
                  type={showPassword ? 'text' : 'password'}
                  className="w-full border border-gray-200 rounded-lg py-3 pl-10 pr-4 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all duration-200"
                  placeholder="Nhập mật khẩu"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--neutral-400)] hover:text-[var(--neutral-600)]"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-[var(--status-danger)] text-xs mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-[var(--neutral-700)] mb-2">
                Xác nhận mật khẩu
              </label>
              <div className="relative">
                <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[var(--neutral-400)]" />
                <input
                  {...register('confirmPassword', {
                    required: 'Vui lòng xác nhận mật khẩu',
                    validate: value => value === password || 'Mật khẩu không khớp'
                  })}
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="w-full border border-gray-200 rounded-lg py-3 pl-10 pr-4 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all duration-200"
                  placeholder="Xác nhận mật khẩu"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--neutral-400)] hover:text-[var(--neutral-600)]"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-[var(--status-danger)] text-xs mt-1">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Role (chỉ admin mới được đăng ký, nhưng form vẫn có field này) */}
            <div>
              <label className="block text-sm font-medium text-[var(--neutral-700)] mb-2">
                Vai trò
              </label>
              <select
                {...register('role', { required: 'Vui lòng chọn vai trò' })}
                className="w-full border border-gray-200 rounded-lg py-3 px-4 text-[var(--neutral-800)] focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all duration-200"
                defaultValue="student"
              >
                <option value="student">Học sinh</option>
                <option value="teacher">Giáo viên</option>
                <option value="admin">Quản trị viên</option>
              </select>
              {errors.role && (
                <p className="text-[var(--status-danger)] text-xs mt-1">{errors.role.message}</p>
              )}
            </div>

            {/* Phone & Address (optional) */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--neutral-700)] mb-2">
                  Số điện thoại
                </label>
                <input
                  {...register('phone')}
                  type="tel"
                  className="w-full border border-gray-200 rounded-lg py-3 px-4 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all duration-200"
                  placeholder="Số điện thoại (tùy chọn)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--neutral-700)] mb-2">
                  Địa chỉ
                </label>
                <input
                  {...register('address')}
                  type="text"
                  className="w-full border border-gray-200 rounded-lg py-3 px-4 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all duration-200"
                  placeholder="Địa chỉ (tùy chọn)"
                />
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center space-x-2 bg-gradient-to-br from-sky-300 to-blue-400 text-white font-medium py-3 rounded-lg shadow-md hover:from-sky-400 hover:to-blue-500 transition-all duration-300"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isLoading ? (
                // --- SỬA LỖI: Dùng Spinner thay vì div xoay ---
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  <span>{t('createAcc')}</span>
                </>
              )}
            </motion.button>
          </form>

          {/* Login Link */}
          <div className="text-center mt-6">
            <p className="text-[var(--neutral-600)]">
              {t('alreadyHaveAccount')}{' '}
              <Link
                to="/login"
                className="text-[var(--primary-600)] hover:text-[var(--primary-700)] font-medium hover:underline"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              >
                {t('signIn')}
              </Link>
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Register;