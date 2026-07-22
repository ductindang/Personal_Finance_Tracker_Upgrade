import React from 'react';
import {useAuth} from '../context/AuthContext';
import { NavLink } from 'react-router-dom'; // Using NavLink automatically applies active class when matches URL
import { 
  Wallet, 
  LayoutDashboard, 
  Receipt, 
  PiggyBank, 
  Target, 
  RefreshCw, 
  Sliders, 
  LogOut, 
  Moon 
} from 'lucide-react';
import '../css/sidebar.css';

function Sidebar() {
  // Lấy thông tin user hiện tại và hàm logout từ AuthContext
  const {user: authUser, logout} = useAuth();

  // Tạo một đối tượng user mặc định đề phòng tường hợp thiếu thông tin
  const user = {
    name: authUser?.username || 'Guest',
    avatar: authUser?.profilePictureUrl || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y',
    role: authUser ? 'Authenticated' : 'Guest'
  };

  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div className="brand">
        <div className="logo-icon">
          <Wallet size={20} />
        </div>
        <span className="brand-name">AURA</span>
      </div>

      {/* Navigation Links */}
      <nav className="nav-menu">
        <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/transactions" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Receipt size={18} />
          <span>Transactions</span>
        </NavLink>
        <NavLink to="/budgets" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <PiggyBank size={18} />
          <span>Budgets</span>
        </NavLink>
        <NavLink to="/savings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Target size={18} />
          <span>Savings Goals</span>
        </NavLink>
        <NavLink to="/recurring" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <RefreshCw size={18} />
          <span>Recurring</span>
        </NavLink>
        <NavLink to="/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Sliders size={18} />
          <span>Settings</span>
        </NavLink>
      </nav>

      {/* Sidebar Footer with Profile & Theme Toggle */}
      <div className="sidebar-footer">
        <div className="user-profile-widget">
          <img src={user.avatar} alt="Avatar" className="user-avatar" />
          <div className="user-info">
            <span className="user-name">{user.name}</span>
            <span className="user-role">{user.role}</span>
          </div>
          <button className="logout-btn" title="Log Out" onClick={logout}>
            <LogOut size={16} />
          </button>
        </div>

        <button className="theme-btn">
          <Moon size={16} />
          <span>Dark Mode</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
