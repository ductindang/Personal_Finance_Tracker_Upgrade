import React, { useState, useEffect } from 'react';
import {useNavigate, useSearchParams} from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import '../css/auth.css';

function VerifyEmail() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // Lấy email tự động từ thanh địa chỉ (Query String)
    const email = searchParams.get('email') || '';

    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);

    // xử lý gửi mã xác thực lên Backend
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try{
            // Gọi API POST /Account/VerifyEmail
            const response = await api.post(`/Account/VerifyEmail?email=${encodeURIComponent(email)}&code=${encodeURIComponent(code)}`);

            if(response.data.success){
                toast.success('Email verified successfully! Redirecting to login');
                setTimeout(() => {
                    navigate('login');
                }, 2000);
            }else{
                if(response.data.errors){
                    toast.error(response.data.errors.join(' '));
                }else{
                    toast.error('Verification failed. Please check your code.');
                }
            }
        }catch(error){
            console.error('Verification error:', error);
            if(error.response?.data?.errors){
                toast.error(error.response.data.errors.join(' '));
            }else{
                toast.error('An unexpected error occurred. Please try again.');
            }
        }finally{
            setLoading(false);
        }
    };

    // Xử lý gửi lại mã xác thực mới
    const handleResendCode = async () => {
        try{
            const response = await api.post(`/Account/ResendVerificationCode?email=${encodeURIComponent(email)}`);
            if(response.data.success){
                toast.success('A new verification code has been sent to your email');
            }else{
                toast.error('Failed to resend code.');
            }
        }catch(error){
            console.error('Resend error: ', error);
            toast.error('Failed to resend code. Please try again');
        }
    };

    return (
        <div className='auth-body-wrapper'>
            {loading && (
                <div className='loading-overlay'>
                    <div className='spinner'></div>
                </div>
            )}
            <div className='bg-blur blob-1'></div>
            <div className='bg-blur blob-2'></div>

            <div className='figma-shapes-container'>
                <img src='/images/figma_shape_101_16131.png' className='figma-shape shape-backdrop' alt=''/>
                <img src="/images/figma_shape_101_12080.png" className="figma-shape shape-top-left-wave" alt="" />
                <img src="/images/figma_shape_101_10074.png" className="figma-shape shape-top-ring" alt="" />
                <img src="/images/figma_shape_101_13083.png" className="figma-shape shape-right-spiral" alt="" />
            </div>

            <div className='auth-page'>
                <div className='auth-card'>
                    <div className='auth-header'>
                        <div className='auth-logo-text'>Your logo</div>
                        <h1 className='auth-title'>Verify Email</h1>
                        <p style={{color:'#bcbec0', fontSize:'13px', marginTop: '10px'}}>
                            We're sent a 6-digit verification code to: <br/>
                            <strong style={{color: '#fff'}}>{email}</strong>
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className='auth-form'>
                        <div className='form-group'>
                            <label htmlFor='code'>Verification Code</label>
                            <div className='input-wrapper'>
                                <input type='text' id='code' placeholder='123456' maxLength={6} value={code}
                                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} // Chỉ cho phép nhập số
                                />
                            </div>
                        </div>

                        <button type='submit' className='submit-btn' disabled={loading}>
                            {loading ? 'Verifying...' : 'Verify Account'}
                        </button>
                    </form>

                    <div style={{textAlign:'center', marginTop:'24px', fontSize:'13px', color:'rgba(255, 255, 255, 0, 7'}}>
                        <span>Didn't receive the code?</span>
                        <button type='button' onClick={handleResendCode} style={{background: 'transparent', border: 'none', color: '#fff', fontWeight:'600', cursor:'pointer', textDecoration:'underline', padding: 0}}>
                            Resend Code
                        </button>
                    </div>
                </div>
            </div>

        </div>
    );
}

export default VerifyEmail;

