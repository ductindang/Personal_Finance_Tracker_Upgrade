import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true); // Trạng thái load khi mới vào trang

    // Kiểm tra trạng thái đăng nhập từ backend khi mở trang web
    useEffect(() => {
        checkAuthStatus();
    }, []);

    // Hàm gọi lên ASP.NET Backend để hỏi xem cookie đăng nhập của user có còn hạn không
    const checkAuthStatus = async () => {
        try {
            const response = await api.get('/api/account/status');
            if (response.data.isAuthenticated) {
                setUser({
                    username: response.data.username,
                    email: response.data.email,
                    profilePictureUrl: response.data.profilePictureUrl
                });
                setIsAuthenticated(true);
            } else {
                setUser(null);
                setIsAuthenticated(false);
            }
        } catch (error) {
            console.error('Error checking auth status: ', error);
            setUser(null);
            setIsAuthenticated(false);
        } finally {
            setLoading(false);
        }
    };

    // Hàm xử lý logout
    const logout = async () => {
        try {
            await api.post('/api/account/logout');
        } catch (error) {
            console.error('Error during logout: ', error);
        } finally {
            setUser(null);
            setIsAuthenticated(false);
            window.location.href = '/login';
        }
    };

    // Cung cấp các biến và hàm này ra ngoài để bất kỳ component con nào cũng lấy về dùng được
    return (
        <AuthContext.Provider value={{ user, isAuthenticated, loading, logout, checkAuthStatus }}>
            {children} {/* children ở đây chính là toàn bộ ứng dụng của bạn */}
        </AuthContext.Provider>
    );

}

// Custom hook để gọi Auth nhanh hơn ở các trang khác
export function useAuth() {
    return useContext(AuthContext);
}