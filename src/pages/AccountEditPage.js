import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from '../api/axios';
import './AccountEditPage.css';

const AccountEditPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('nickname');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // 닉네임 변경 관련
  const [nickname, setNickname] = useState('');
  const [newNickname, setNewNickname] = useState('');
  const [nicknameLoading, setNicknameLoading] = useState(false);
  
  // 비밀번호 변경 관련
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);

  // 비밀번호 인증 확인
  useEffect(() => {
    const verified = location.state?.verified;
    const timestamp = location.state?.timestamp;
    const now = Date.now();
    
    // 인증되지 않았거나 5분 이상 지난 경우
    if (!verified || !timestamp || (now - timestamp) > 5 * 60 * 1000) {
      alert('본인 확인이 필요합니다.');
      navigate('/account/verify-password');
      return;
    }

    // 현재 닉네임 가져오기
    const fetchMemberInfo = async () => {
      try {
        const response = await axios.get('/member/account-info');
        setNickname(response.data.nickname);
        setNewNickname(response.data.nickname);
      } catch (error) {
        console.error('정보 불러오기 실패:', error);
      }
    };
    fetchMemberInfo();
  }, [navigate, location.state]);

  // 닉네임 변경
  const handleNicknameUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newNickname === nickname) {
      setError('현재 닉네임과 동일합니다.');
      return;
    }

    if (newNickname.length < 2 || newNickname.length > 20) {
      setError('닉네임은 2-20자 사이여야 합니다.');
      return;
    }

    setNicknameLoading(true);
    try {
      await axios.put('/member/update-name', null, {
        params: { newNickname: newNickname }
      });
      
      setSuccess('닉네임이 성공적으로 변경되었습니다.');
      setNickname(newNickname);
      
      setTimeout(() => {
        navigate('/account');
      }, 1500);
    } catch (error) {
      console.error('닉네임 변경 실패:', error);
      if (error.response?.status === 409) {
        setError('이미 사용 중인 닉네임입니다.');
      } else {
        setError('닉네임 변경에 실패했습니다.');
      }
    } finally {
      setNicknameLoading(false);
    }
  };

  // 비밀번호 변경
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // 비밀번호 유효성 검증
    if (passwordData.newPassword.length < 8) {
      setError('비밀번호는 최소 8자 이상이어야 합니다.');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    setPasswordLoading(true);
    try {
      await axios.post('/member/change-password', {
        newPassword: passwordData.newPassword
      });
      
      setSuccess('비밀번호가 성공적으로 변경되었습니다.');
      setPasswordData({ newPassword: '', confirmPassword: '' });
      
      setTimeout(() => {
        navigate('/account');
      }, 1500);
    } catch (error) {
      console.error('비밀번호 변경 실패:', error);
      setError('비밀번호 변경에 실패했습니다.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="account-edit-container">
      <div className="account-edit-box">
        <h2>계정 정보 수정</h2>

        <div className="tab-buttons">
          <button
            className={`tab-button ${activeTab === 'nickname' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('nickname');
              setError('');
              setSuccess('');
            }}
          >
            닉네임 변경
          </button>
          <button
            className={`tab-button ${activeTab === 'password' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('password');
              setError('');
              setSuccess('');
            }}
          >
            비밀번호 변경
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        {activeTab === 'nickname' && (
          <form onSubmit={handleNicknameUpdate} className="edit-form">
            <div className="form-group">
              <label htmlFor="currentNickname">현재 닉네임</label>
              <input
                type="text"
                id="currentNickname"
                value={nickname}
                disabled
                className="disabled-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="newNickname">새 닉네임</label>
              <input
                type="text"
                id="newNickname"
                value={newNickname}
                onChange={(e) => setNewNickname(e.target.value)}
                placeholder="새 닉네임을 입력하세요"
                minLength={2}
                maxLength={20}
                required
              />
              <small className="input-hint">2-20자 사이로 입력해주세요</small>
            </div>

            <button
              type="submit"
              className="submit-button"
              disabled={nicknameLoading || newNickname === nickname}
            >
              {nicknameLoading ? '변경 중...' : '닉네임 변경'}
            </button>
          </form>
        )}

        {activeTab === 'password' && (
          <form onSubmit={handlePasswordChange} className="edit-form">
            <div className="form-group">
              <label htmlFor="newPassword">새 비밀번호</label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordInputChange}
                placeholder="새 비밀번호를 입력하세요"
                minLength={8}
                required
              />
              <small className="input-hint">최소 8자 이상 입력해주세요</small>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">비밀번호 확인</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordInputChange}
                placeholder="비밀번호를 다시 입력하세요"
                minLength={8}
                required
              />
            </div>

            <button
              type="submit"
              className="submit-button"
              disabled={passwordLoading}
            >
              {passwordLoading ? '변경 중...' : '비밀번호 변경'}
            </button>
          </form>
        )}

        <button
          type="button"
          className="cancel-button"
          onClick={() => navigate('/account')}
        >
          취소
        </button>
      </div>
    </div>
  );
};

export default AccountEditPage;
