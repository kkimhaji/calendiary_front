import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../api/axios';
import './PasswordVerificationPage.css';

const PasswordVerificationPage = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const navigate = useNavigate();

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await axios.post('/member/verify-password', {
        currentPassword: password
      });

      if (response.data === true) {
        // 비밀번호 인증 성공
        navigate('/account/edit', {
          state: { verified: true, timestamp: Date.now() }
        });
      } else {
        setError('비밀번호가 일치하지 않습니다.');
      }
    } catch (error) {
      console.error('비밀번호 확인 실패:', error);
      if (error.response?.status === 401) {
        setError('비밀번호가 일치하지 않습니다.');
      } else {
        setError('비밀번호 확인 중 오류가 발생했습니다.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/auth/get-temp-password', { email: resetEmail });
      alert('임시 비밀번호가 이메일로 발송되었습니다.');
      setShowReset(false);
      setResetEmail('');
    } catch (error) {
      console.error('임시 비밀번호 발급 실패:', error);
      alert('이메일 주소를 확인해주세요.');
    }
  };

  return (
    <div className="password-verification-container">
      <div className="verification-box">
        <h2>본인 확인</h2>
        <p className="verification-description">
          회원님의 정보를 안전하게 보호하기 위해 비밀번호를 다시 한번 확인합니다.
        </p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleVerify}>
          <div className="form-group">
            <label htmlFor="password">비밀번호</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="현재 비밀번호를 입력하세요"
              required
              autoFocus
            />
          </div>

          <button
            type="submit"
            className="verify-button"
            disabled={isLoading || !password}
          >
            {isLoading ? '확인 중...' : '확인'}
          </button>
        </form>

        <div className="password-reset-section">
          <button
            type="button"
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

        <button
          type="button"
          className="cancel-button"
          onClick={() => navigate('/account-info')}
        >
          취소
        </button>
      </div>
    </div>
  );
};

export default PasswordVerificationPage;
