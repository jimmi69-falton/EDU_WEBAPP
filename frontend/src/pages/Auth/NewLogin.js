import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { 
  EyeIcon, 
  EyeSlashIcon, 
  UserIcon, 
  LockClosedIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import toast from 'react-hot-toast';

const NewLogin = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { t, language } = useLanguage();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError // --- MỚI: Đã có sẵn, sẽ dùng để set lỗi từ API ---
  } = useForm();

  const onSubmit = async (data) => {
    setIsLoading(true);
    const result = await login(data.email, data.password);
    
    if (!result.success) {
      // --- MỚI: Hiển thị lỗi API (ví dụ: "Sai mật khẩu") ---
      // Chúng ta sẽ đảm bảo AuthContext trả về lỗi này
      const errorMessage = result.error || (language === 'vi' ? 'Email hoặc mật khẩu không đúng' : 'Invalid email or password');
      setError('root', { message: errorMessage });
      // --- HẾT CODE MỚI ---
    }
    // Nếu success, AuthContext sẽ tự động điều hướng đi
    setIsLoading(false);
  };

  const handleGoogleLogin = () => {
    // TODO: Implement Google OAuth
    toast.info(t('googleLoginComingSoon'));
  };

  const handleFacebookLogin = () => {
    // TODO: Implement Facebook OAuth
    toast.info(t('facebookLoginComingSoon'));
  };

  return (
    <div 
    className="min-h-screen flex items-center justify-center p-4 bg-blue-50 bg-no-repeat bg-cover bg-center"
    style={{ backgroundImage: "url('/image0.jpg')" }}
    >
      <div className="w-full max-w-md">
        {/* Logo and Title */}

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

        {/* Login Form */}
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
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-[var(--neutral-700)] mb-2">
                {t('Email')}
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[var(--neutral-500)]" />
                <input
                  type="email"
                  {...register('email', {
                    required: language === 'vi' ? 'Email là bắt buộc' : 'Email is required',
                    pattern: {
                      value: /^\S+@\S+$/i,
                      message: language === 'vi' ? 'Email không hợp lệ' : 'Invalid email'
                    }
                  })}
                  //className="input pl-10"
                  className="w-full border border-gray-300 rounded-lg py-2 pl-10 pr-4 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all duration-200"
                  placeholder={t('enterEmail')}
                />
              </div>
              {errors.email && (
                <p className="text-[var(--status-danger)] text-sm mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-[var(--neutral-700)] mb-2">
                {t('Password')}
              </label>
              <div className="relative">
                <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[var(--neutral-500)]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password', {
                    required: language === 'vi' ? 'Mật khẩu là bắt buộc' : 'Password is required',
                    minLength: {
                      value: 6,
                      message: language === 'vi' ? 'Mật khẩu phải có ít nhất 6 ký tự' : 'Password must be at least 6 characters'
                    }
                  })}
                  //className="input pl-10 pr-12"
                  className="w-full border border-gray-300 rounded-lg py-2 pl-10 pr-4 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all duration-200"
                  placeholder={t('enterPassword')}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--neutral-500)] hover:text-[var(--neutral-700)]"
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
                <p className="text-[var(--status-danger)] text-sm mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Error Message */}
            {errors.root && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-[var(--status-danger)] text-sm">
                  {errors.root.message}
                </p>
              </div>
            )}

            {/* Remember Me */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-[var(--neutral-300)] text-[var(--primary-600)] focus:ring-[var(--primary-600)]"
                />
                <span className="ml-2 text-[var(--neutral-600)] text-sm">{t('rememberMe')}</span>
              </label>
              <button 
                type="button"
                className="text-[var(--primary-600)] hover:text-[var(--primary-800)] text-sm font-medium hover:underline"
              >
                {t('forgotPassword')}
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              //className="btn btn-primary w-full"
             className="w-full bg-gradient-to-br from-[#7dd3fc] to-[#38bdf8] hover:from-[#38bdf8] hover:to-[#0ea5e9] text-white font-semibold py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <LoadingSpinner size="sm" />
              ) : (
                t('login')
              )}
            </button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[var(--neutral-200)]" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-[var(--neutral-500)]">{t('or')}</span>
              </div>
            </div>

            {/* Social Login */}
             <div className="space-y-3">
              <motion.button
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center space-x-3 px-4 py-3 border border-[var(--neutral-200)] rounded-lg hover:bg-[var(--neutral-50)] transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="text-[var(--neutral-700)] font-medium">{t('continueWithGoogle')}</span>
              </motion.button>

              <motion.button
                onClick={handleFacebookLogin}
                className="w-full flex items-center justify-center space-x-3 px-4 py-3 border border-[var(--neutral-200)] rounded-lg hover:bg-[var(--neutral-50)] transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span className="text-[var(--neutral-700)] font-medium">{t('continueWithFacebook')}</span>
              </motion.button>
            </div>  
            
          </form>

          {/* Demo Credentials (Giữ nguyên, bị comment) */}
          {/* <div className="mt-6 p-4 bg-[var(--neutral-50)] rounded-lg border border-[var(--neutral-200)]">
            ...
          </div> */}
        </motion.div>

        {/* Register Link (Giữ nguyên) */}
        <motion.div 
          className="text-center mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <p className="text-[var(--neutral-600)]">
            {t('dontHaveAccount')}{' '}
            <Link
              to="/register"
              className="text-[var(--primary-600)] hover:text-[var(--primary-700)] font-medium hover:underline"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              {t('createAccount')}
            </Link>
          </p>
        </motion.div>

        {/* Footer (Giữ nguyên) */}
        <motion.div 
          className="text-center mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <p className="text-[var(--neutral-500)] text-sm">
            © 2025 Health Manager. All rights reserved.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default NewLogin;