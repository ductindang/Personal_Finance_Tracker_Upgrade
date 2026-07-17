import React from 'react';
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
  // Mock data for user profile - we will connect this to Authentication Context later
  const user = {
    name: 'Tin Dang',
    avatar: 'https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/712020:e878da9b-63da-4d9d-895d-92478f695579/152fb82e-dd1a-44a4-bdca-57ab9feb5d58/48',
    role: 'Authenticated'
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
          <button className="logout-btn" title="Log Out">
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
