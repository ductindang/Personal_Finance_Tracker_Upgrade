import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, ArrowLeft, Mail, KeyRound, Lock } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import '../css/auth.css';

function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // Step 1: Nhập email, Step 2: Nhập OTP, Step 3: Đổi pass
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (resendCooldown === 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // BƯỚC 1: GỬI MÃ XÁC THỰC QUA EMAIL
  const handleSendCode = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Please enter your email.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/Account/SendVerificationCode', { email: email.trim() });
      if (res.data?.success) {
        toast.success(res.data.message || 'Verification code sent to your email.');
        setResendCooldown(30);
        setStep(2);
      } else {
        toast.error(res.data?.message || 'Failed to send verification code.');
      }
    } catch (error) {
      const serverMessage = error.response?.data?.message || error.message;
      toast.error(serverMessage || 'Failed to send verification code.');
    } finally {
      setLoading(false);
    }
  };

  // BƯỚC 2: XÁC THỰC MÃ OTP 6 SỐ
  const handleVerifyCode = async (e) => {
    e.preventDefault();
    if (!code.trim() || code.trim().length !== 6) {
      toast.error('Verification code must be 6 digits.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/Account/VerifyCode', {
        email: email.trim(),
        code: code.trim()
      });

      if (res.data?.success) {
        toast.success(res.data.message || 'Code verified successfully.');
        setStep(3);
      } else {
        toast.error(res.data?.message || 'Invalid or expired verification code.');
      }
    } catch (error) {
      const serverMessage = error.response?.data?.message || error.message;
      toast.error(serverMessage || 'Failed to verify code.');
    } finally {
      setLoading(false);
    }
  };

  // BƯỚC 3: ĐẶT MẬT KHẨU MỚI
  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Confirm password does not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/Account/ResetPassword', {
        email: email.trim(),
        code: code.trim(),
        password: password,
        confirmPassword: confirmPassword
      });

      if (res.data?.success) {
        toast.success('Password reset successfully! Redirecting to login...');
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      } else {
        toast.error(res.data?.message || 'Failed to reset password.');
      }
    } catch (error) {
      const serverMessage = error.response?.data?.message || error.message;
      toast.error(serverMessage || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-body-wrapper">
      {/* Loading overlay */}
      {loading && (
        <div className="loading-overlay">
          <div className="spinner"></div>
        </div>
      )}

      {/* Background blobs & Figma 3D shapes */}
      <div className="bg-blur blob-1"></div>
      <div className="bg-blur blob-2"></div>
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
            <h1 className="auth-title">
              {step === 1 && 'Forgot Password'}
              {step === 2 && 'Verify Code'}
              {step === 3 && 'Reset Password'}
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '6px' }}>
              {step === 1 && 'Enter your email address to receive a 6-digit verification code.'}
              {step === 2 && `Enter the 6-digit code sent to ${email}.`}
              {step === 3 && 'Create a new secure password for your account.'}
            </p>
          </div>

          {/* STEP 1: FORM NHẬP EMAIL */}
          {step === 1 && (
            <form onSubmit={handleSendCode} className="auth-form">
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <div className="input-wrapper">
                  <input
                    type="email"
                    id="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <button type="submit" className="submit-btn" disabled={loading}>
                Send Verification Code
              </button>
            </form>
          )}

          {/* STEP 2: FORM NHẬP MÃ OTP */}
          {step === 2 && (
            <form onSubmit={handleVerifyCode} className="auth-form">
              <div className="form-group">
                <label htmlFor="code">6-Digit Code</label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    id="code"
                    maxLength={6}
                    placeholder="123456"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    style={{ textAlign: 'center', letterSpacing: '4px', fontSize: '18px', fontWeight: 'bold' }}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="submit-btn" disabled={loading}>
                Verify Code
              </button>

                            {/* Resend Code với đếm ngược giống VerifyEmail */}
              <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '13px', color: 'rgba(255, 255, 255, 0.7)' }}>
                {resendCooldown > 0 ? (
                  <span>You will be able to request a new code in <strong style={{ color: 'var(--accent-color)' }}>{resendCooldown}s</strong></span>
                ) : (
                  <>
                    <span>Didn't receive the code? </span>
                    <button
                      type="button"
                      onClick={handleSendCode}
                      disabled={loading}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#fff',
                        fontWeight: '600',
                        cursor: 'pointer',
                        textDecoration: 'underline',
                        padding: 0
                      }}
                    >
                      Resend Code
                    </button>
                  </>
                )}
              </div>
            </form>
          )}

          {/* STEP 3: FORM NHẬP MẬT KHẨU MỚI */}
          {step === 3 && (
            <form onSubmit={handleResetPassword} className="auth-form">
              <div className="form-group">
                <label htmlFor="new-password">New Password</label>
                <div className="input-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="new-password"
                    placeholder="Enter new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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

              <div className="form-group">
                <label htmlFor="confirm-password">Confirm Password</label>
                <div className="input-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="confirm-password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="submit-btn" disabled={loading}>
                Update Password
              </button>
            </form>
          )}

          {/* Back to Login Link */}
          <div className="register-link-wrapper" style={{ marginTop: '24px' }}>
            <Link to="/login" className="register-link" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <ArrowLeft size={16} /> Back to Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;