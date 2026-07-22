import React, { useState } from 'react';
import {useAuth} from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import api from '../services/api';
import '../css/auth.css'; // Import the shared authentication CSS

function Login() {
  const navigate = useNavigate();
  const {checkAuthStatus} = useAuth(); // Gọi hàm cập nhật trạng thái

  const [formData, setFormData] = useState({
    usernameOrEmail: '',
    password: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await api.post('/Account/Login', formData);

      if (response.data.success) {
        setSuccessMessage('Login successful! Redirecting to dashboard...');
        // Gọi hàm cập nhật trạng thái đăng nhập lên react ngay lập tức
        await checkAuthStatus();
        // chuyển hướng về trang chủ
        navigate('/');
      } else if (response.data.requiresVerification) {
        setErrorMessage('Email not verified. Redirecting...');
        setTimeout(() => {
          navigate(response.data.redirectUrl);
        }, 2000);
      } else {
        if (response.data.errors) {
          setErrorMessage(response.data.errors.join(' '));
        } else {
          setErrorMessage('Invalid login credentials.');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      if (error.response?.data?.errors) {
        setErrorMessage(error.response.data.errors.join(' '));
      } else {
        setErrorMessage('An error occurred during login. Please try again.');
      }
    }
  };

  return (
    <div className="auth-body-wrapper">
      {/* Background blobs */}
      <div className="bg-blur blob-1"></div>
      <div className="bg-blur blob-2"></div>
      
      {/* Floating Figma 3D shapes */}
      <div className="figma-shapes-container">
        <img src="/images/figma_shape_101_16131.png" className="figma-shape shape-backdrop" alt="" />
        <img src="/images/figma_shape_101_12080.png" className="figma-shape shape-top-left-wave" alt="" />
        <img src="/images/figma_shape_101_10074.png" className="figma-shape shape-top-ring" alt="" />
        <img src="/images/figma_shape_101_13083.png" className="figma-shape shape-right-spiral" alt="" />
        <img src="/images/figma_shape_101_14125.png" className="figma-shape shape-bottom-left-torus" alt="" />
        <img src="/images/figma_shape_101_15128.png" className="figma-shape shape-bottom-right-wave" alt="" />
        <img src="/images/figma_shape_101_11077.png" className="figma-shape shape-extra-1" alt="" />
        <img src="/images/figma_shape_101_17134.png" className="figma-shape shape-extra-2" alt="" />
      </div>

      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-logo-text">Your logo</div>
            <h1 className="auth-title">Login</h1>
          </div>

          {errorMessage && <div className="auth-alert">{errorMessage}</div>}
          {successMessage && <div className="auth-alert-success">{successMessage}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            {/* Username / Email */}
            <div className="form-group">
              <label htmlFor="usernameOrEmail">Email or Username</label>
              <div className="input-wrapper">
                <input
                  type="text"
                  id="usernameOrEmail"
                  name="usernameOrEmail"
                  placeholder="username@gmail.com"
                  value={formData.usernameOrEmail}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label htmlFor="password">Password</label>
                <Link to="/forgot-password" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)', textDecoration: 'none' }}>
                  Forgot Password?
                </Link>
              </div>
              <div className="input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" className="submit-btn">Sign in</button>
          </form>

          <div className="divider">or continue with</div>

          {/* Social Logins */}
          <div className="social-login-row">
            <a href="http://localhost:5051/Account/ExternalLogin?provider=Google" className="social-icon-btn google-btn" title="Sign in with Google">
              <i className="fa-brands fa-google google-icon"></i>
            </a>
            <a href="#" className="social-icon-btn github-btn" title="Sign in with GitHub">
              <i className="fa-brands fa-github github-icon"></i>
            </a>
            <a href="#" className="social-icon-btn facebook-btn" title="Sign in with Facebook">
              <i className="fa-brands fa-facebook facebook-icon"></i>
            </a>
          </div>

          <div className="register-link-wrapper">
            <span>Don't have an account yet? </span>
            <Link to="/register" className="register-link">Register for free</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
