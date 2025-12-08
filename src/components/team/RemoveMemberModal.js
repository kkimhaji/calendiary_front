import React, { useState } from 'react';
import './RemoveMemberModal.css';

const RemoveMemberModal = ({ member, onConfirm, onCancel }) => {
    const [deleteContent, setDeleteContent] = useState(false);

    const handleConfirm = () => {
        onConfirm(deleteContent);
    };

    return (
        <div className="modal-overlay" onClick={onCancel}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>멤버 탈퇴 확인</h3>
                    <button className="close-button" onClick={onCancel}>×</button>
                </div>

                <div className="modal-body">
                    <p className="warning-text">
                        <strong>{member.teamNickname}</strong> 님을 팀에서 탈퇴시키시겠습니까?
                    </p>

                    <div className="option-section">
                        <label className="option-label">
                            <input
                                type="checkbox"
                                checked={deleteContent}
                                onChange={(e) => setDeleteContent(e.target.checked)}
                            />
                            <span className="option-text">
                                해당 멤버의 모든 게시글과 댓글도 함께 삭제
                            </span>
                        </label>

                        <div className="option-description">
                            {deleteContent ? (
                                <p className="delete-warning">
                                    ⚠️ 해당 멤버가 작성한 모든 게시글과 댓글이 영구적으로 삭제됩니다.
                                </p>
                            ) : (
                                <p className="preserve-info">
                                    ℹ️ 게시글과 댓글은 유지되며, 작성자가 '알 수 없음'으로 표시됩니다.
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="cancel-button" onClick={onCancel}>
                        취소
                    </button>
                    <button
                        className={`confirm-button ${deleteContent ? 'danger' : ''}`}
                        onClick={handleConfirm}
                    >
                        {deleteContent ? '게시글과 함께 삭제' : '탈퇴만 진행'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RemoveMemberModal;