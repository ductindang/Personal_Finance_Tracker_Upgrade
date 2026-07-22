import axios from "axios";

//Initialize an axios instance with default configuration.
const api = axios.create({
    // Origin Url connect to backend
    baseURL: '',
    // Include a login cookie in every request (this is crucial for the Cookie Auth mechanism)
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    }
});


// ========================================================
// MIDDLEWARE: Axios Response Interceptor
// Tự động bắt mọi phản hồi trả về từ Backend ASP.NET Core
// ========================================================
api.interceptors.response.use(
    (response) => {
        // Nếu request thành công, cho phép dữ liệu đi tiếp bình thường
        return response;
    },

    (error) => {
        // Nếu Backend trả về lỗi 401 (Chưa đăng nhập / Hết hạn cookie)
        if (error.response && error.response.status === 401) {
            // Chặn đứng và tự động chuyển hướng ngay lập tức về trang Login
            // (Loại trừ trường hợp đang ở sẵn trang login/register để tráng lặp vô tận)
            if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
                window.location.href = '/login';
            }
        }
        // Trả lỗi về cho component để xử lý các lỗi khác (nếu có)
        return Promise.reject(error);
    }
)

export default api