import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute({ children }) {
    // Lấy trạng thái từ "kho dùng chung" AuthContext
    const { isAuthenticated, loading } = useAuth();

    // Nếu đang kiểm tra thông tin cookie đăng nhập từ Backend, hiển thị màn hình chờ
    if (loading) {
        return (
            <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', color: 'var(--text-secondary' }}>
                Loading session...
            </div>
        );
    }

    // Nếu chưa đăng nhập, chuyển hướng về trang /login
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />
    }

    // Nếu đã đăng nhập, cho phép hiển thị trang con (children)
    return children;
}

export default ProtectedRoute;