import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearError } from '../store/authSlice';
import './Login.css';
import axios from '../api/axios';

function Login() {
    const dispatch = useDispatch();
    const { loading } = useSelector(state => state.auth);
    const [showReset, setShowReset] = useState(false);
    const [resetEmail, setResetEmail] = useState('');
    const [loginData, setLoginData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    const redirectUrl = new URLSearchParams(location.search).get('redirectUrl') || '/';

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        if (params.get('expired') === 'true') {
            setError('세션이 만료되었습니다. 다시 로그인해주세요.');
        }
        dispatch(clearError());
    }, []); // 마운트 시 1회만 실행 - location 변경 시 clearError가 에러를 지우는 문제 방지

    const handleChange = (e) => {
        const { name, value } = e.target;
        setLoginData(prev => ({ ...prev, [name]: value }));
    };

    const handlePasswordReset = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/auth/get-temp-password', { email: resetEmail });
            alert('임시 비밀번호가 이메일로 발송되었습니다.');
            setShowReset(false);
            setResetEmail('');
        } catch {
            alert('이메일 주소를 확인해주세요.');
        }
    };

    const resendVerificationCode = async (email) => {
        try {
            await axios.post('/auth/resend-verification', { email });
            alert('인증 코드가 이메일로 재발송되었습니다.');
            navigate('/verify-email', { state: { email } });
        } catch {
            alert('인증 코드 재발송에 실패했습니다. 다시 시도해주세요.');
        }
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); // 로컬 에러만 초기화

        const resultAction = await dispatch(loginUser(loginData));

        if (loginUser.fulfilled.match(resultAction)) {
            navigate(redirectUrl);
            return;
        }

        // rejected 처리 - 로컬 state에만 저장하여 Redux 타이밍 문제 회피
        const errorCode = resultAction.payload?.code;
        const errorMessage = resultAction.payload?.message;
        const email = resultAction.payload?.email;

        switch (errorCode) {
            case 'INVALID_CREDENTIALS':
                setError('이메일 또는 비밀번호가 올바르지 않습니다.');
                break;
            case 'ACCOUNT_NOT_VERIFIED': {
                const confirmResend = window.confirm(
                    '계정 인증이 완료되지 않았습니다.\n인증 코드를 다시 받으시겠습니까?'
                );
                if (confirmResend) await resendVerificationCode(email);
                break;
            }
            case 'VERIFICATION_CODE_EXPIRED':
                setError(errorMessage || '인증 코드가 만료되었습니다.');
                break;
            case 'INVALID_VERIFICATION_CODE':
                setError(errorMessage || '인증 코드가 일치하지 않습니다.');
                break;
            default:
                setError(errorMessage || '이메일 또는 비밀번호를 확인해주세요.');
                break;
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <h2>로그인</h2>

                {error && (
                    <div className="error-message">{error}</div>
                )}

                {redirectUrl !== '/' && (
                    <div className="alert-message">계속하려면 로그인이 필요합니다.</div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>이메일</label>
                        <input
                            type="email"
                            name="email"
                            value={loginData.email}
                            onChange={handleChange}
                            placeholder="이메일을 입력하세요"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>비밀번호</label>
                        <input
                            type="password"
                            name="password"
                            value={loginData.password}
                            onChange={handleChange}
                            placeholder="비밀번호를 입력하세요"
                            required
                        />
                    </div>

                    <button type="submit" className="login-button" disabled={loading}>
                        {loading ? '로그인 중...' : '로그인'}
                    </button>
                </form>

                <div className="register-link">
                    <p>계정이 없으신가요?</p>
                    <Link to="/register" className="register-button">회원가입</Link>
                </div>
                <div className="password-reset-link">
                    <button className="text-link" onClick={() => setShowReset(!showReset)}>
                        비밀번호를 잊으셨나요?
                    </button>
                    {showReset && (
                        <form className="reset-form" onSubmit={handlePasswordReset}>
                            <input
                                type="email"
                                placeholder="등록된 이메일 주소"
                                value={resetEmail}
                                onChange={(e) => setResetEmail(e.target.value)}
                                required
                            />
                            <button type="submit">임시 비밀번호 발급</button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Login;