import React, { useState } from 'react';
import axios from '../../api/axios';
import './TeamInviteSection.css';

const TeamInviteSection = ({ teamId }) => {
  const [inviteLink, setInviteLink] = useState(null);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState(null);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteSettings, setInviteSettings] = useState({
    expiresIn: 7,
    maxUses: 1
  });

  const handleCreateInvite = async () => {
    try {
      setInviteLoading(true);
      setInviteError(null);
      
      const expiresAt = inviteSettings.expiresIn > 0
        ? new Date(Date.now() + inviteSettings.expiresIn * 24 * 60 * 60 * 1000).toISOString()
        : null;

      const response = await axios.post(
        `/team/invite`,
        {
          teamId: parseInt(teamId),
          expiresAt: expiresAt,
          maxUses: inviteSettings.maxUses
        }
      );

      setInviteLink(response.data.inviteLink);
      setShowInviteForm(false);
    } catch (error) {
      console.error('초대 링크 생성 실패:', error);
      setInviteError('초대 링크 생성 실패: ' + (error.response?.data?.message || error.message));
    } finally {
      setInviteLoading(false);
    }
  };

  const handleInviteSettingsChange = (e) => {
    const { name, value } = e.target;
    setInviteSettings({
      ...inviteSettings,
      [name]: parseInt(value)
    });
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(inviteLink)
      .then(() => alert('링크가 복사되었습니다!'))
      .catch(() => alert('복사에 실패했습니다.'));
  };

  return (
    <div className="invite-section">
      {!showInviteForm && !inviteLink && (
        <button
          className="btn-show-invite-form"
          onClick={() => setShowInviteForm(true)}
        >
          멤버 초대 링크 생성
        </button>
      )}

      {showInviteForm && (
        <div className="invite-form">
          <h3>초대 링크 설정</h3>

          <div className="form-group">
            <label>만료 기간</label>
            <select
              name="expiresIn"
              value={inviteSettings.expiresIn}
              onChange={handleInviteSettingsChange}
            >
              <option value="1">1일</option>
              <option value="7">7일</option>
              <option value="30">30일</option>
              <option value="0">무기한</option>
            </select>
          </div>

          <div className="form-group">
            <label>최대 사용 횟수</label>
            <select
              name="maxUses"
              value={inviteSettings.maxUses}
              onChange={handleInviteSettingsChange}
            >
              <option value="1">1회</option>
              <option value="5">5회</option>
              <option value="10">10회</option>
              <option value="50">50회</option>
            </select>
          </div>

          <div className="invite-form-buttons">
            <button
              className="btn-cancel-invite"
              onClick={() => setShowInviteForm(false)}
            >
              취소
            </button>
            <button
              className="btn-generate-invite"
              onClick={handleCreateInvite}
              disabled={inviteLoading}
            >
              {inviteLoading ? '생성 중...' : '링크 생성'}
            </button>
          </div>
        </div>
      )}

      {inviteError && <div className="error-message">{inviteError}</div>}

      {inviteLink && (
        <div className="invite-link-container">
          <h3>초대 링크가 생성되었습니다</h3>
          <div className="invite-link-box">
            <input
              type="text"
              value={inviteLink}
              readOnly
              className="invite-link-input"
            />
            <button
              className="btn-copy-link"
              onClick={copyToClipboard}
            >
              복사
            </button>
          </div>
          <p className="invite-info">
            {inviteSettings.expiresIn > 0
              ? `${inviteSettings.expiresIn}일 후 만료`
              : '무기한 유효'}
            {' · '}
            {`최대 ${inviteSettings.maxUses}회 사용 가능`}
          </p>
          <button
            className="btn-new-invite"
            onClick={() => {
              setInviteLink(null);
              setShowInviteForm(true);
            }}
          >
            새 링크 생성
          </button>
        </div>
      )}
    </div>
  );
};

export default TeamInviteSection;
