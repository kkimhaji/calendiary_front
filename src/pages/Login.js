import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import './Login.css';

function Login() {
    const [loginData, setLoginData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setLoginData({
            ...loginData,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/auth/authenticate', loginData);
            const { accessToken } = response.data.accessToken;

            // 로그인 성공 시 토큰을 localStorage에 저장
            localStorage.setItem('token', accessToken);
            // 로그인 성공 시 /boardList로 이동
            navigate('/boardList');
        } catch (error) {
            setError('아이디 또는 비밀번호가 올바르지 않습니다.');
            console.error('Login error: ', error);
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <h2>로그인</h2>
                {error && <div className="error-message">{error}</div>}
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
                    <button type="submit" className="login-button">
                        로그인
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Login;
