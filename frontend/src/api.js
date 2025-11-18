import axios from 'axios';

// Tạo instance axios với cấu hình cơ sở
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8080/api',
  timeout: 10000,
});

// Interceptor (Can thiệp) trước khi gửi Request: Thêm token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      // Gắn token vào header Authorization
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor (Can thiệp) khi nhận Response: Xử lý lỗi
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Nếu lỗi là 401 (Không có quyền), token hỏng/hết hạn
    if (error.response?.status === 401) {
      // Xóa token hỏng
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Đưa người dùng về trang login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;