import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
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

// 1. Tạo component con chứa logic sử dụng useLocation
function AppContent() {
  const location = useLocation();

  // Danh sách các đường dẫn của trang Đăng nhập / Đăng ký
  // (Lưu ý: nên gõ chính xác '/register' có dấu gạch chéo ở trước nhé)
  const authPaths = ['/login', '/register'];
  const isAuthPage = authPaths.includes(location.pathname);

  // Nếu là trang Login/Register, hiển thị tràn màn hình
  if (isAuthPage) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    );
  }

  // Nếu không phải, hiển thị Sidebar bên trái và Main Content bên phải
  return (
    <div className="app-layout">
      {/* Sidebar Left Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/budgets" element={<Budgets />} />
          <Route path="/savings" element={<Savings />} />
          <Route path="/recurring" element={<Recurring />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/categories" element={<Categories />} />
        </Routes>
      </main>
    </div>
  );
}

// 2. Component gốc App chỉ làm nhiệm vụ bọc Router ở ngoài cùng
function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;