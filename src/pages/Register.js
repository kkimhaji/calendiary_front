import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../store/authSlice';
import './Register.css';
import axios from '../api/axios';

function Register() {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [step, setStep] = useState(1);
    const [timeLeft, setTimeLeft] = useState(300);
    const [timerActive, setTimerActive] = useState(false);

    const [formData, setFormData] = useState({
        email: '',
        nickname: '',
        password: '',
        verificationCode: ''
    });
    const [loading, setLoading] = useState(false);

    const [passwordValidation, setPasswordValidation] = useState({
        length: false,
        lowercase: false,
        number: false,
        specialChar: false
    });
    const [isFormValid, setIsFormValid] = useState(false);

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
    
    const validatePassword = (password) => {
        const validations = {
            length: password.length >= 8,
            lowercase: /[a-z]/.test(password),
            number: /[0-9]/.test(password),
            specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
        };

        setPasswordValidation(validations);

        // 모든 조건이 충족되는지 확인
        return Object.values(validations).every(isValid => isValid);
    };

    useEffect(() => {
        if (step === 1) {
            const isPasswordValid = validatePassword(formData.password);
            const areAllFieldsFilled =
                formData.email.trim() !== '' &&
                formData.password.trim() !== '' &&
                formData.nickname.trim() !== '';

            setIsFormValid(isPasswordValid && areAllFieldsFilled);
        }
    }, [formData, step]);

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData({
            ...formData,
            [name]: value
        });

        // 비밀번호 입력 시 유효성 검사
        if (name === 'password') {
            validatePassword(value);
        }
    };

    const handleInitialSubmit = async (e) => {
        e.preventDefault();

        if (!validatePassword(formData.password)) {
            alert('비밀번호가 모든 조건을 충족해야 합니다.');
            return;
        }

        setLoading(true);
        try {
            await axios.post('/auth/register', {
                email: formData.email,
                nickname: formData.nickname,
                password: formData.password
            });
            setStep(2);
            setTimeLeft(300);
            setTimerActive(true);
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
            
            dispatch(setCredentials({
                accessToken: accessToken,
                refreshToken: refreshToken,
            }));

            localStorage.setItem('accessToken', accessToken);
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
            setTimeLeft(300);
            setTimerActive(true);
            alert('인증 메일이 재전송되었습니다.');
        } catch (error) {
            console.error('Resend failed:', error);
            alert('인증 메일 재전송에 실패했습니다.');
        }
    };

    return (
        <div className="register-container">
            <div className="register-box">
                <h2 className="register-title">회원가입</h2>
                {step === 1 ? (
                    <form onSubmit={handleInitialSubmit} className="register-form">
                        <div className="register-form-group">
                            <label className="register-label">이메일</label>
                            <input
                                type="email"
                                name="email"
                                placeholder="이메일"
                                value={formData.email}
                                onChange={handleChange}
                                className="register-input"
                                required
                            />
                        </div>
                        <div className="register-form-group">
                            <label className="register-label">닉네임</label>
                            <input
                                type="text"
                                name="nickname"
                                placeholder="닉네임"
                                value={formData.nickname}
                                onChange={handleChange}
                                className="register-input"
                                required
                            />
                        </div>
                        <div className="register-form-group">
                            <label className="register-label">비밀번호</label>
                            <input
                                type="password"
                                name="password"
                                placeholder="비밀번호"
                                value={formData.password}
                                onChange={handleChange}
                                className="register-input"
                                required
                            />
                            <div className="password-validation">
                                <p className={passwordValidation.length ? 'valid' : 'invalid'}>
                                    ✓ 8자 이상
                                </p>
                                <p className={passwordValidation.lowercase ? 'valid' : 'invalid'}>
                                    ✓ 소문자 포함
                                </p>
                                <p className={passwordValidation.number ? 'valid' : 'invalid'}>
                                    ✓ 숫자 포함
                                </p>
                                <p className={passwordValidation.specialChar ? 'valid' : 'invalid'}>
                                    ✓ 특수문자 포함
                                </p>
                            </div>
                        </div>
                        <button
                            type="submit"
                            className="register-submit-button"
                            disabled={loading}
                        >
                            {loading ? '처리중...' : '회원가입'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleVerification} className="register-form">
                        <div className="register-verification-info">
                            <div className="register-form-group">
                                <label className="register-label">이메일</label>
                                <input
                                    type="text"
                                    value={formData.email}
                                    disabled
                                    className="register-disabled-input"
                                />
                            </div>

                            <p className="register-info-text">인증 메일은 5분 동안 유효합니다.</p>
                            <p className="register-timer">남은 시간: {formatTime(timeLeft)}</p>

                            <div className="register-form-group register-verification-group">
                                <label className="register-label">인증 코드</label>
                                <div className="register-code-container">
                                    <input
                                        type="text"
                                        name="verificationCode"
                                        placeholder="인증번호"
                                        value={formData.verificationCode}
                                        onChange={handleChange}
                                        className="register-input register-code-input"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={handleResendCode}
                                        className="register-resend-button"
                                    >
                                        재전송
                                    </button>
                                </div>
                            </div>
                            <button
                                type="submit"
                                className="register-submit-button"
                                disabled={loading}
                            >
                                {loading ? '인증중...' : '인증 완료'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}

export default Register;
