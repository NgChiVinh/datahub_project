import axios from 'axios';

// Tạo một instance của axios
const api = axios.create({
  // NEXT_PUBLIC_API_URL sẽ được dùng khi deploy, localhost:5000 dùng cho máy cá nhân
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor để tự động đính kèm Token vào mọi request
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor để xử lý lỗi tập trung (ví dụ: Token hết hạn)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Nếu lỗi 401 (Unauthorized), có thể tự động logout hoặc xóa token
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
