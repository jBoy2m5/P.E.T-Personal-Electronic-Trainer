import axios from 'axios';

// Cấu hình URL mặc định của Spring Boot Backend
const axiosClient = axios.create({
    baseURL: 'http://localhost:8080/api', // Thay đổi nếu server chạy cổng khác
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor cho Request: Tự động đính kèm Token (nếu có) trước khi gửi API
axiosClient.interceptors.request.use(
    (config) => {
        // Lấy token từ localStorage (do Auth.jsx lưu sau khi đăng nhập thành công)
        const token = localStorage.getItem('jwt-token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor cho Response: Xử lý lỗi chung (VD: hết hạn Token)
axiosClient.interceptors.response.use(
    (response) => {
        return response.data; // Chỉ trả về data, bỏ qua các thông tin rườm rà của axios
    },
    (error) => {
        // Nếu server trả về 401 Unauthorized (Chưa đăng nhập hoặc Token hết hạn)
        if (error.response && error.response.status === 401) {
            console.error('Unauthorized! Token missing or invalid.');
            // Có thể thêm code logout tự động ở đây:
            // localStorage.removeItem('jwt-token');
            // window.location.href = '/auth';
        }
        return Promise.reject(error);
    }
);

export default axiosClient;
