import React, { useState, useEffect } from 'react';
import {useNavigate, Link} from 'react-router-dom';
import {Eye, EyeOff} from 'lucide-react';
import api from '../services/api';
import '../css/register.css';

function Register() {
    const navigate = useNavigate();

    // State lưu trữ dữ liệu form
    const [formData, setFormData] = useState({
        fullName: '',
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    // State điều khiển ẩn/hiện mật khẩu
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // State hiển thị thông báo lỗi/thành công từ API
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [validationErrors, setValidationErrors] = useState('');

    // State kiểm tra độ mạnh của mật khẩu
    const [passwordStrength, setPasswordStrength] = useState({
        percent: 0,
        text: 'Password Strength',
        color: '#ef4444'
    });

    // Hàm lắng nghe sự kiện ở các ô input
    const handleChange = (e) => {
        const {name, value} = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };


    // useEffect để đo độ mạnh của mật khẩu bất cứ khi nào ô password thay đổi
    useEffect(() => {
        const pwd = formData.password;
        if(!pwd){
            setPasswordStrength({percent: 0, text: 'Password Strength', color: '#ef4444'});
            return;
        }

        let score = 0;
        if(pwd.length >= 6) score += 20;
        if(/[a-z]/.test(pwd)) score += 20;
        if(/[A-Z]/.test(pwd)) score += 20;
        if(/[0-9]/.test(pwd)) score += 20;
        if(/[^a-zA-Z0-9]/.test(pwd)) score += 20;

        let text = 'Weak';
        let color = '#ef4444'; //red

        if(score >= 80){
            text = 'Strong';
            color = '#10b981'; // green
        }else if(score >= 40){
            text = 'Medium';
            color = '#f59e0b'; // Orange
        }

        setPasswordStrength({percent: score, text, color});
    }, [formData.password]);

    // Hàm xử lý khi nhấn submit đăng ký
    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        setSuccessMessage('');
        setValidationErrors({});

        // Client-side validation cơ bản
        if(formData.password !== formData.confirmPassword){
            setErrorMessage('Passwords do not match.');
            return;
        }

        try{
            // Gọi API đăng ký của ASP.NET Core
            const response = await api.post('/Account/Register', formData);

            if(response.data.success){
                setSuccessMessage('Registration successful! Redirecting to email verification...');
                // Chuyển sang trang xác minh email sau 2 giây
                setTimeout(() => {
                    navigate(`/verify-email?email=${encodeURIComponent(formData.email)}`);
                }, 2000);
            } else {
                // Xử lý khi Backend trả về lỗi logic
                if(response.data.errors){
                    setErrorMessage(response.data.errors.join(' '));
                }else{
                    setErrorMessage('Registration failed');
                }
            }
        }catch (error){
            // Xử lý lỗi hệ thống/mạng
            console.error('Registration error: ', error);
            if(error.response?.data?.errors){
                setErrorMessage(error.response.data.errors.join(''));
            } else{
                setErrorMessage('An unexpected error occurred. Please try again.');
            }
        }
    };

    return (
        <div className='auth-body'>
            <div className='auth-card'>
                <div className='auth-header'>
                    <div className='auth-logo-text'>AURA FINANCE</div>
                    <h1 className='auth-title'>Register</h1>
                </div>

                {/* Thông báo lỗi & Thành công */}
                {errorMessage && <div className='auth-alert'>{errorMessage}</div>}
                {successMessage && <div className='auth-alert-success'>{successMessage}</div>}

                <form onSubmit={handleSubmit} className='auth-form'>
                    {/* Full Name */}
                    <div className='form-group'>
                        <label htmlFor='fullName'> Full Name</label>
                        <div className='input-wrapper'>
                            <input type='text' 
                                id='fullName' 
                                placeholder='John Doe' 
                                value={formData.fullName} 
                                onChange={handleChange} 
                                required/>
                        </div>
                    </div>

                    {/* Username */}
                    <div className='form-group'>
                        <label htmlFor="username">Username</label>
                        <div className='input-wrapper'>
                            <input 
                                type='text'
                                id='username'
                                name='username'
                                placeholder='johndoe'
                                value={formData.username}
                                onChange={handleChange}
                                required/>
                        </div>
                    </div>

                    {/* Email */}
                    <div className='form-group'>
                        <label htmlFor="email">Email</label>
                        <div className='input-wrapper'>
                            <input 
                                type='email'
                                id='email'
                                name='email'
                                placeholder='username@gmail.com'
                                value={formData.email}
                                onChange={handleChange}
                                required/>
                        </div>
                    </div>

                    {/* Password */}
                    <div className='form'>
                        <label htmlFor="password">Password</label>
                        <div className='input-wrapper'>
                            <input 
                                type={showPassword ? 'text' : 'password'}
                                id='password'
                                name='password'
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                                required/>
                            
                            <button type='button' className='toggle-password' onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18}/>}
                            </button>
                        </div>

                        {/* Bộ đo độ mạnh mật khẩu */}
                        <div className='password-strenth-container'>
                            <div className='password-strength-bar'>
                                <div className='strength-fill'
                                    style={{
                                        width: `${passwordStrength.percent}%`,
                                        backgroundColor: passwordStrength.color
                                    }}></div>
                            </div>
                            <span className='strength-text'>{passwordStrength.text}</span>
                        </div>
                    </div>

                    {/* Confirm Password */}
                    <div className='form-group'>
                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <div className='input-wrapper'>
                            <input 
                                type={showConfirmPassword ? 'text' : 'password'}
                                id='confirmPassword'
                                name='confirmPassword'
                                placeholder='••••••••'
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required/>
                            
                            <button type='button' className='toggle-password' onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <button type='submit' className='submit-btn'>Sign Up</button>
                </form>
                <div className="divider">or continue with</div>
                {/* Nút bấm Đăng ký Mạng xã hội */}
                <div className="social-login-row">
                    <button className="social-icon-btn" title="Sign up with Google">
                        G
                    </button>
                    <button className="social-icon-btn" title="Sign up with GitHub">
                        GH
                    </button>
                    <button className="social-icon-btn" title="Sign up with Facebook">
                        F
                    </button>
                </div>
                {/* Link chuyển trang */}
                <div className="register-link-wrapper">
                    <span>Already have an account? </span>
                    <Link to="/login" className="register-link">Sign in</Link>
                </div>

            </div>
        </div>
    );

}

export default Register;


