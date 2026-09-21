import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import '../css/auth.css'; // Import the shared authentication CSS

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [passwordStrength, setPasswordStrength] = useState({
    percent: 0,
    text: 'Password Strength',
    color: '#ef4444'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  useEffect(() => {
    const pwd = formData.password;
    if (!pwd) {
      setPasswordStrength({ percent: 0, text: 'Password Strength', color: '#ef4444' });
      return;
    }

    let score = 0;
    if (pwd.length >= 6) score += 20;
    if (/[a-z]/.test(pwd)) score += 20;
    if (/[A-Z]/.test(pwd)) score += 20;
    if (/[0-9]/.test(pwd)) score += 20;
    if (/[^a-zA-Z0-9]/.test(pwd)) score += 20;

    let text = 'Weak';
    let color = '#ef4444';

    if (score >= 80) {
      text = 'Strong';
      color = '#10b981';
    } else if (score >= 40) {
      text = 'Medium';
      color = '#f59e0b';
    }

    setPasswordStrength({ percent: score, text, color });
  }, [formData.password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (formData.password !== formData.confirmPassword) {
        toast.error('Passwords do not match.');
        return;
      }
      const response = await api.post('/Account/Register', formData);
      
      if (response.data.success) {
        toast.success('Registration successful! Redirecting to verification...');
        setTimeout(() => {
          navigate(`/verify-email?email=${encodeURIComponent(formData.email)}`);
        }, 2000);
      } else {
        if (response.data.errors) {
          toast.error(response.data.errors.join(' '));
        } else {
          toast.error('Registration failed.');
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
      if (error.response?.data?.errors) {
        toast.error(error.response.data.errors.join(' '));
      } else {
        toast.error('An unexpected error occurred. Please try again.');
      }
    }finally{
      setLoading(false);
    }
  };

  return (
    <div className="auth-body-wrapper">
      {loading && (
        <div className='loading-overlay'>
          <div className='spinner'></div>
        </div>
      )}
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
            <h1 className="auth-title">Register</h1>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {/* Full Name */}
            <div className="form-group">
              <label htmlFor="fullName">Full Name</label>
              <div className="input-wrapper">
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Username */}
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <div className="input-wrapper">
                <input
                  type="text"
                  id="username"
                  name="username"
                  placeholder="johndoe"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <div className="input-wrapper">
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="username@gmail.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  placeholder="••••••••"
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

              <div className="password-strength-container">
                <div className="password-strength-bar">
                  <div
                    className="strength-fill"
                    style={{
                      width: `${passwordStrength.percent}%`,
                      backgroundColor: passwordStrength.color
                    }}
                  ></div>
                </div>
                <span className="strength-text">{passwordStrength.text}</span>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className="input-wrapper">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" className="submit-btn">Sign Up</button>
          </form>

          <div className="divider">or continue with</div>

          <div className="social-login-row">
            <a href="http://localhost:5051/Account/ExternalLogin?provider=Google" className="social-icon-btn google-btn" title="Sign up with Google">
              <i className="fa-brands fa-google google-icon"></i>
            </a>
            <a href="#" className="social-icon-btn github-btn" title="Sign up with GitHub">
              <i className="fa-brands fa-github github-icon"></i>
            </a>
            <a href="#" className="social-icon-btn facebook-btn" title="Sign up with Facebook">
              <i className="fa-brands fa-facebook facebook-icon"></i>
            </a>
          </div>

          <div className="register-link-wrapper">
            <span>Already have an account? </span>
            <Link to="/login" className="register-link">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
