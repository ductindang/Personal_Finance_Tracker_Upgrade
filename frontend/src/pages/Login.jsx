import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import api from '../services/api';
import '../css/register.css'; // Tái sử dụng file CSS của phần Auth đăng ký

function Login() {
    const navigate = useNavigate();

    // State lưu trữ thông tin Username/Email và Password
    const [formData, setFormData] = useState({
        usenameOrEmail: '',
        password: ''
    });

    const [showPassword, setShowPassword] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // Lắng nghe thay đổi dữ liệu nhập vào
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    // Xử lý gửi thông tin đăng nhập lên ASP.NET Backend
    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        setSuccessMessage('');

        try{
            // Gọi API đăng nhập POST /Account/Login
            const response = await api.post('/Account/Login', formData);

            if(response.data.success){
                setSuccessMessage('Login successful! Redirecting to dashboard...');

                // Chuyển hướng người dùng về trang chủ Dashboard sau 1.5 giây
                setTimeout(() => {
                    navigate('/');
                    // Load lại trang để Sidebar cập nhật thông tin User vừa đăng nhập
                    window.location.reload();
                }, 1500);
            } else if(response.data.requiresVerification){
                // Xử lý lỗi trả về tử Backend (sai mật khẩu/tài khoản)
                if(response.data.errors){
                    setErrorMessage(response.data.errors.join(' '));
                } else {
                    setErrorMessage('Invalid login credentials.');
                }
            }
        }catch (error){
            console.error('Login error: ', error);
            if(error.response?.data?.errors){
                setErrorMessage(error.response.data.errors.join(' '));
            }else{
                setErrorMessage('An error occurred during login. Please try again.');
            }
        }
    };

    return (
        <div className='auth-body'>
            <div className='auth-card'>
                <div className='auth-header'>
                    <div className='auth-logo-text'>AURA FINANCE</div>
                    <h1 className='auth-title'>Login</h1>
                </div>

                {/* Hiển thị thông báo Alert lỗi/thành công */}
                {errorMessage && <div className='auth-alert'>{errorMessage}</div>}
                {successMessage && <div className='auth-alert-success'>{successMessage}</div>}

                <form onSubmit={handleSubmit} className='auth-form'>
                    {/* Username / Email */}
                    <div className='form-group'>
                        <label htmlFor="usernameOrEmail">Username or Email</label>
                        <div className='input-wrapper'>
                            <input 
                                type='text'
                                id='usernameOrEmail'
                                name='usernameOrEmail'
                                placeholder='username@gmail.com'
                                value={formData.usenameOrEmail}
                                onChange={handleChange}
                                required/>
                        </div>
                    </div>

                    {/* Password */}
                    <div className='form-group'>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                            <label htmlFor="password">Password</label>
                            {/* Nút Forgot Password */}
                            <Link to="/forgot-password" style={{fontSize: '0.8rem', color:'rav(--accent-color)', textDecoration: 'none'}}>
                                Forgot Password?
                            </Link>
                        </div>
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
                    </div>

                    <button type="submit" className="submit-btn">Sign In</button>
                </form>

                <div className="divider">or continue with</div>
                {/* Nút bấm Đăng nhập mạng xã hội */}
                <div className="social-login-row">
                    <button className="social-icon-btn" title="Sign in with Google">G</button>
                    <button className="social-icon-btn" title="Sign in with GitHub">GH</button>
                    <button className="social-icon-btn" title="Sign in with Facebook">F</button>
                </div>
                {/* Link chuyển trang sang Register */}
                <div className="register-link-wrapper">
                    <span>Don't have an account yet? </span>
                    <Link to="/register" className="register-link">Register for free</Link>
                </div>

            </div>
        </div>
    );
}

export default Login;

