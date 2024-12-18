import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import './Register.css';

function Register() {
    const navigate = useNavigate();
    const [fiormData, setFormData] = useState({
        nickname: '',
        email: '',
        password: '',
        verificationCode: ''
    });
    const [error, setError] = useState('');
    const [isEmailSent, setIsEmailSent] = useState(false);
    const [isVerified, setIsVerified] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // 이메일 인증 코드 전송
    const handleSendVerification = async (e) => {
        e.preventDefault();
        try {
            await api.post('/auth/email/verification', {
                email: formData.email
            });
            setIsEmailSent(true);
            setError('');
            alert('인증 코드가 이메일로 전송되었습니다.');
        } catch (error) {
            setError('이메일 전송에 실패했습니다. 다시 시도해주세요.');
        }
    };

       // 인증 코드 확인
       const handleVerifyCode = async (e) => {
        e.preventDefault();
        try {
            await api.post('/auth/email/verify', {
                email: formData.email,
                code: formData.verificationCode
            });
            setIsVerified(true);
            setError('');
            alert('이메일 인증이 완료되었습니다.');
        } catch (error) {
            setError('인증 코드가 일치하지 않습니다.');
        }
    };

    // 회원가입 제출
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isVerified) {
            setError('이메일 인증을 완료해주세요.');
            return;
        }

        try {
            await api.post('/auth/register', {
                nickname: formData.nickname,
                email: formData.email,
                password: formData.password
            });
            alert('회원가입이 완료되었습니다.');
            navigate('/login');
        } catch (error) {
            setError('회원가입에 실패했습니다. 다시 시도해주세요.');
        }
    };

    return (
        <div className="register-container">
            <div className="register-box">
                <h2>회원가입</h2>
                {error && <div className="error-message">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>닉네임</label>
                        <input
                            type="text"
                            name="nickname"
                            value={formData.nickname}
                            onChange={handleChange}
                            placeholder="닉네임을 입력하세요"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>이메일</label>
                        <div className="email-group">
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="이메일을 입력하세요"
                                required
                            />
                            <button 
                                type="button" 
                                onClick={handleSendVerification}
                                className="verification-button"
                                disabled={isVerified}
                            >
                                인증메일 전송
                            </button>
                        </div>
                    </div>
                    {isEmailSent && (
                        <div className="form-group">
                            <label>인증번호</label>
                            <div className="verification-group">
                                <input
                                    type="text"
                                    name="verificationCode"
                                    value={formData.verificationCode}
                                    onChange={handleChange}
                                    placeholder="인증번호를 입력하세요"
                                    disabled={isVerified}
                                />
                                <button 
                                    type="button" 
                                    onClick={handleVerifyCode}
                                    className="verify-button"
                                    disabled={isVerified}
                                >
                                    확인
                                </button>
                            </div>
                        </div>
                    )}
                    <div className="form-group">
                        <label>비밀번호</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="비밀번호를 입력하세요"
                            required
                        />
                    </div>
                    <button 
                        type="submit" 
                        className="register-button"
                        disabled={!isVerified}
                    >
                        회원가입
                    </button>
                </form>
            </div>
        </div>
    );

}