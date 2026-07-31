import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import {Toaster} from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext'; // Import AuthProvider
import ProtectedRoute from './components/ProtectedRoute'; // Import ProtectedRoute
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transaction';
import Categories from './pages/Categories';
import Budgets from './pages/Budgets';
import Savings from './pages/Savings';
import Recurring from './pages/Recurring';
import Settings from './pages/Settings';
import Register from './pages/Register';
import Login from './pages/Login';
import VerifyEmail from './pages/VerifyEmail';

// ====================================================
// MIDDLEWARE GATE: Chịu trách nhiệm phân luồng toàn bộ úng dụng
// ====================================================

// 1. Tạo component con chứa logic sử dụng useLocation
function AppContent() {
  const location = useLocation();
  const { isAuthenticated, loading } = useAuth();

  // Danh sách các đường dẫn của trang Đăng nhập / Đăng ký
  // (Lưu ý: nên gõ chính xác '/register' có dấu gạch chéo ở trước nhé)
  const authPaths = ['/login', '/register', '/verify-email'];
  const isAuthPage = authPaths.includes(location.pathname);

  // 1. Trong lúc hệ thống đang gửi API kiểm tra Session (Loading)
  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', background: '#0a0b10', color: '#9ca3af' }}>
        Checking authentication...
      </div>
    );
  }

  // 2. Nếu chưa đăng nhập và cố tình truy cập các trang khác (không phải Login/Register)
  // Nhảy thẳng về trang login ngay lập tức (Không render Sidebar hay khung trang)
  if (!isAuthenticated && !isAuthPage) {
    return <Navigate to="/login" replace />;
  }

  // 4. Nếu là trang Login/Register độc lập
  // Nếu là trang Login/Register, hiển thị tràn màn hình
  if (isAuthPage) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail/>}/>
      </Routes>
    );
  }

  // 5. Giao diện chính (Chỉ hiển thị khi ĐÃ ĐĂNG NHẬP)
  // Nếu không phải, hiển thị Sidebar bên trái và Main Content bên phải
  return (
    <div className="app-layout">
      {/* Sidebar Left Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="main-content">
        <Routes>
          {/* Bọc toàn bộ các trang chức năng trong ProtectedRoute */}
          <Route path="/" element={<ProtectedRoute><Dashboard />{/* Dashboard ở đây chính là 'children' trong file ProtectedRoute.jsx */} </ProtectedRoute>} />
          <Route path="/transactions" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
          <Route path="/budgets" element={<ProtectedRoute><Budgets /></ProtectedRoute>} />
          <Route path="/savings" element={<ProtectedRoute><Savings /></ProtectedRoute>} />
          <Route path="/recurring" element={<ProtectedRoute><Recurring /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/categories" element={<ProtectedRoute><Categories /></ProtectedRoute>} />
        </Routes>
      </main>
    </div>
  );
}

// 2. Component gốc App chỉ làm nhiệm vụ bọc Router ở ngoài cùng
function App() {
  return (
    <Router>
      {/* Bọc AuthProvider ở ngoài cùng để tất cả các route bên dưới đều truy cập được kho AuthContext */}
      <AuthProvider>
        <AppContent />
        {/* Thêm cấu hình Toaster hiển thị ở góc phải phía trên */}
        <Toaster 
          position='top-right'
          reverseOrder={false}
          toastOption={{style:{background: '#161929', color: '#fff', border: '1px solid rgba(255, 255, 255, 0.08'}}}
        />
      </AuthProvider>
    </Router>
  );
}

export default App;