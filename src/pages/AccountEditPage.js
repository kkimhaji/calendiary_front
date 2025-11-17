import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from '../api/axios';
import { useDispatch } from 'react-redux';
import { fetchUserInfo, logoutUser } from '../store/authSlice';
import './AccountEditPage.css';

const AccountEditPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('nickname');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const dispatch = useDispatch();

  const [deletePassword, setDeletePassword] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

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

      dispatch(fetchUserInfo());

      setTimeout(() => {
        navigate('/account-info');
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
        navigate('/account-info');
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

  // 회원 탈퇴
  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!deletePassword) {
      setError('비밀번호를 입력해주세요.');
      return;
    }

    if (deleteConfirm !== '회원탈퇴') {
      setError('확인 문구를 정확히 입력해주세요.');
      return;
    }

    if (!window.confirm('정말로 탈퇴하시겠습니까?\n모든 데이터가 삭제되며 복구할 수 없습니다.')) {
      return;
    }

    setDeleteLoading(true);
    try {
      await axios.delete('/member/delete', {
        data: { password: deletePassword }
      });

      alert('회원 탈퇴가 완료되었습니다.');

      // 로그아웃 처리
      dispatch(logoutUser());
      navigate('/');
    } catch (error) {
      console.error('회원 탈퇴 실패:', error);
      if (error.response?.status === 401) {
        setError('비밀번호가 일치하지 않습니다.');
      } else {
        setError('회원 탈퇴 처리 중 오류가 발생했습니다.');
      }
    } finally {
      setDeleteLoading(false);
    }
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

          <button
            className={`tab-button ${activeTab === 'delete' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('delete');
              setError('');
              setSuccess('');
            }}
          >
            회원 탈퇴
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

        {activeTab === 'delete' && (
          <form onSubmit={handleDeleteAccount} className="edit-form delete-form">
            <div className="warning-box">
              <h3>⚠️ 경고</h3>
              <p>회원 탈퇴 시 다음 데이터가 모두 삭제됩니다:</p>
              <ul>
                <li>작성한 모든 일기 및 이미지</li>
                <li>팀에 작성한 모든 게시글 및 댓글</li>
                <li>팀 멤버십 정보</li>
                <li>계정 정보</li>
              </ul>
              <p className="warning-text">삭제된 데이터는 복구할 수 없습니다.</p>
            </div>

            <div className="form-group">
              <label htmlFor="deletePassword">비밀번호 확인</label>
              <input
                type="password"
                id="deletePassword"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder="비밀번호를 입력하세요"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="deleteConfirm">확인 문구 입력</label>
              <input
                type="text"
                id="deleteConfirm"
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                placeholder="'회원탈퇴'를 입력하세요"
                required
              />
              <small className="input-hint">회원탈퇴를 정확히 입력해주세요</small>
            </div>

            <button
              type="submit"
              className="submit-button delete-button"
              disabled={deleteLoading}
            >
              {deleteLoading ? '탈퇴 처리 중...' : '회원 탈퇴'}
            </button>
          </form>
        )}

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

export default AccountEditPage;
