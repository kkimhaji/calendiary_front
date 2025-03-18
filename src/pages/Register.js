import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../store/authSlice';
import '../styles/Register.css';
import axios from '../api/axios';

function Register() {
    const navigate = useNavigate();
    const dispatch = useDispatch(); // Redux dispatch 사용
    
    const [step, setStep] = useState(1);  // 1: 기본 정보, 2: 인증번호
    const [timeLeft, setTimeLeft] = useState(300); // 5분 = 300초
    const [timerActive, setTimerActive] = useState(false);

    const [formData, setFormData] = useState({
        email: '',
        nickname: '',
        password: '',
        verificationCode: ''
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        let timer;
        if (timerActive && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            alert('인증 시간이 만료되었습니다. 다시 시도해주세요.');
            setTimerActive(false);
        }
        return () => clearInterval(timer);
    }, [timerActive, timeLeft]);

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleInitialSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post('/auth/register', {
                email: formData.email,
                nickname: formData.nickname,
                password: formData.password
            });
            setStep(2);  // 인증번호 입력 단계로 전환
            setTimeLeft(300);  // 타이머 초기화
            setTimerActive(true);  // 타이머 시작
        } catch (error) {
            console.error('Registration failed:', error);
            alert('회원가입 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerification = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.post('/auth/verify', {
                email: formData.email,
                verificationCode: formData.verificationCode
            });
            
            const { accessToken, refreshToken } = response.data;
            
            // Redux store에 인증 정보 저장
            dispatch(setCredentials({
                access: accessToken,
                refresh: refreshToken,
                rememberMe: true
            }));
            
            // 로컬 스토리지에도 토큰 저장 (Redux Persist와 함께 작동)
            localStorage.setItem('accessToken', accessToken);
            
            // axios 기본 헤더 설정
            axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
            
            alert('회원가입이 완료되었습니다.');
            navigate('/');
        } catch (error) {
            console.error('Verification failed:', error);
            console.error('Verification failed:', error.response?.data || error.message);
            alert('인증번호가 올바르지 않습니다.');
        } finally {
            setLoading(false);
        }
    };

    const handleResendCode = async () => {
        try {
            await axios.post('/auth/resend', {
                email: formData.email
            });
            setTimeLeft(300);  // 타이머 재설정
            setTimerActive(true);  // 타이머 재시작
            alert('인증 메일이 재전송되었습니다.');
        } catch (error) {
            console.error('Resend failed:', error);
            alert('인증 메일 재전송에 실패했습니다.');
        }
    };

    return (
        <div className="register-container">
            <h2>회원가입</h2>
            {step === 1 ? (
                <form onSubmit={handleInitialSubmit}>
                    <div className="form-group">
                        <input
                            type="email"
                            name="email"
                            placeholder="이메일"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <input
                            type="text"
                            name="nickname"
                            placeholder="닉네임"
                            value={formData.nickname}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <input
                            type="password"
                            name="password"
                            placeholder="비밀번호"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <button type="register-submit" disabled={loading}>
                        {loading ? '처리중...' : '회원가입'}
                    </button>
                </form>
            ) : (
                <form onSubmit={handleVerification}>
                    <div className="verification-info">
                        <div className="form-group">
                            <input
                                type="text"
                                value={formData.email}
                                disabled
                                className="disabled-input"
                            />
                        </div>

                        <p>인증 메일은 5분 동안 유효합니다.</p>
                        <p className="timer">남은 시간: {formatTime(timeLeft)}</p>

                        <div className="form-group verification-group">
                            <input
                                type="text"
                                name="verificationCode"
                                placeholder="인증번호"
                                value={formData.verificationCode}
                                onChange={handleChange}
                                required
                            />
                            <button
                                type="button"
                                onClick={handleResendCode}
                                className="resend-button"
                            >
                                재전송
                            </button>
                        </div>
                        <button type="submit" disabled={loading}>
                            {loading ? '인증중...' : '인증 완료'}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}

export default Register;
