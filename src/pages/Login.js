import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../store/authSlice';
import '../styles/Login.css';
import ToggleButton from '../components/ToggleButton';
import axios from '../api/axios';

function Login() {
    const dispatch = useDispatch();
    const { loading, error: authError } = useSelector(state => state.auth);
    const [showReset, setShowReset] = useState(false);
    const [resetEmail, setResetEmail] = useState('');
    const [loginData, setLoginData] = useState({
        email: '',
        password: '',
        rememberMe: false
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const location = useLocation();
    
    // URL에서 리다이렉트 URL 가져오기
    const params = new URLSearchParams(location.search);
    const errorReason = params.get('reason');
    const redirectUrl = params.get('redirectUrl') || '/boardList';

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setLoginData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleToggleChange = () => {
        setLoginData((prev) => ({
            ...prev,
            rememberMe: !prev.rememberMe,
        }));
    };

    const handlePasswordReset = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/reset-password', { email: resetEmail });
            alert('임시 비밀번호가 이메일로 발송되었습니다.');
            setShowReset(false);
        } catch (error) {
            alert('이메일 주소를 확인해주세요.');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        try {
            // Redux 액션 디스패치
            const resultAction = await dispatch(loginUser(loginData));
            
            if (!resultAction.error){
                navigate(redirectUrl);
            }
        } catch (err) {
            setError('로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.');
            console.error('Login error:', err);
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <h2>로그인</h2>
                {(error || authError) && <div className="error-message">{error || authError}</div>}
                
                {/* 리다이렉트 URL이 있는 경우 안내 메시지 표시 */}
                {redirectUrl !== '/boardList' && (
                    <div className="alert-message">
                        계속하려면 로그인이 필요합니다.
                    </div>
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

                    <div className="remember-me">
                        <ToggleButton checked={loginData.rememberMe} onChange={handleToggleChange} />
                        <label>로그인 유지</label>
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
                <button 
                    className="text-link"
                    onClick={() => setShowReset(!showReset)}
                >
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
            {errorReason === 'session_expired' && (
                <div className="alert-message">
                    세션이 만료되어 자동 로그아웃 되었습니다
                </div>
            )}
        </div>
    );
}

export default Login;
