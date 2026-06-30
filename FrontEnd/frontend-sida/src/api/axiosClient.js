import axios from 'axios';

// Cấu hình URL mặc định của Spring Boot Backend
const axiosClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Quan trọng: Cho phép gửi kèm HttpOnly Cookie
});

// Interceptor cho Request: Có thể dùng để đính kèm logic khác nếu cần
axiosClient.interceptors.request.use(
    (config) => {
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor cho Response: Xử lý lỗi chung (VD: hết hạn Token)
axiosClient.interceptors.response.use(
    (response) => {
        return response.data;
    },
    (error) => {
        // Nếu server trả về 401 Unauthorized (Chưa đăng nhập hoặc Token hết hạn)
        if (error.response && error.response.status === 401) {
            console.error('Unauthorized! Token missing or invalid.');
            localStorage.removeItem('user-data');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default axiosClient;
