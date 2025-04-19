import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import './ChangePasswordPage.css';

const ChangePasswordPage = () => {
    const navigate = useNavigate();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [showResetForm, setShowResetForm] = useState(false);
    const [resetEmail, setResetEmail] = useState('');
    const [resetLoading, setResetLoading] = useState(false);
    const [resetError, setResetError] = useState('');
    const [resetSuccess, setResetSuccess] = useState('');
    const [isCurrentPasswordVerified, setIsCurrentPasswordVerified] = useState(false);

    // 비밀번호 정규식 검증
    const validatePassword = (password) => {
        const regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
        return regex.test(password);
    };

    // 현재 비밀번호 확인 단계
    const verifyCurrentPassword = async () => {
        if (!currentPassword) {
            setError('현재 비밀번호를 입력해주세요.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // 현재 비밀번호 검증 API 호출
            await axios.post('/member/verify-password', { currentPassword: currentPassword });

            // 검증 성공
            setIsCurrentPasswordVerified(true);
            setError('');
        } catch (err) {
            if (err.response?.status === 401) {
                setError('현재 비밀번호가 올바르지 않습니다.');
            } else {
                setError('비밀번호 확인 중 오류가 발생했습니다. 다시 시도해주세요.');
                console.error('비밀번호 확인 실패:', err);
            }
        } finally {
            setLoading(false);
        }
    };

    // 새 비밀번호 변경 요청
    const changePassword = async () => {
        // 유효성 검사
        if (!validatePassword(newPassword)) {
            setError('새 비밀번호는 8자 이상이어야 하며, 문자, 숫자, 특수문자를 포함해야 합니다.');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('새 비밀번호와 확인 비밀번호가 일치하지 않습니다.');
            return;
        }

        if (currentPassword === newPassword) {
            setError('새 비밀번호가 현재 비밀번호와 동일합니다.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // 비밀번호 변경 API 호출
            await axios.post('/member/change-password', {
                newPassword: newPassword
            });

            // 성공 처리
            setSuccess('비밀번호가 성공적으로 변경되었습니다.');

            // 모든 입력 필드 초기화
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');

            // 3초 후 계정 정보 페이지로 리다이렉트
            setTimeout(() => {
                navigate('/account-info');
            }, 3000);

        } catch (err) {
            setError('비밀번호 변경 중 오류가 발생했습니다. 다시 시도해주세요.');
            console.error('비밀번호 변경 실패:', err);
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordReset = async (e) => {
        e.preventDefault();

        if (!resetEmail || !resetEmail.trim()) {
            setResetError('이메일을 입력해주세요.');
            return;
        }

        setResetLoading(true);
        setResetError('');

        try {
            await axios.post('/auth/get-temp-password', { email: resetEmail });
            setResetSuccess('임시 비밀번호가 이메일로 발송되었습니다.');
            setResetEmail('');

        } catch (err) {
            if (err.response?.status === 404) {
                setResetError('등록되지 않은 이메일입니다.');
            } else {
                setResetError('임시 비밀번호 발급 중 오류가 발생했습니다.');
            }
        } finally {
            setResetLoading(false);
        }
    };

    // 폼 제출 핸들러
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isCurrentPasswordVerified) {
            await verifyCurrentPassword();
        } else {
            await changePassword();
        }
    };

    // 이전 단계로 돌아가기
    const handleBack = () => {
        setIsCurrentPasswordVerified(false);
        setError('');
    };

    return (
        <div className="change-password-container">
            <h1>비밀번호 변경</h1>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}
            {/* 임시 비밀번호 발급 폼 (모달 형태) */}
            {showResetForm && (
                <div className="reset-password-modal">
                    <div className="reset-password-content">
                        <h2>임시 비밀번호 발급</h2>

                        {resetError && <div className="error-message">{resetError}</div>}
                        {resetSuccess && <div className="success-message">{resetSuccess}</div>}

                        <form onSubmit={handlePasswordReset}>
                            <div className="form-group">
                                <label htmlFor="reset-email">이메일</label>
                                <input
                                    type="email"
                                    id="reset-email"
                                    value={resetEmail}
                                    onChange={(e) => setResetEmail(e.target.value)}
                                    placeholder="가입한 이메일 주소"
                                    disabled={resetLoading}
                                    required
                                    autoFocus
                                />
                            </div>

                            <div className="button-group">
                                <button
                                    type="button"
                                    className="cancel-button"
                                    onClick={() => {
                                        setShowResetForm(false);
                                        setResetError('');
                                        setResetSuccess('');
                                    }}
                                    disabled={resetLoading}
                                >
                                    취소
                                </button>

                                <button
                                    type="submit"
                                    className="submit-button"
                                    disabled={resetLoading}
                                >
                                    {resetLoading ? '처리 중...' : '임시 비밀번호 발급'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            <form onSubmit={handleSubmit} className="password-form">
                {/* 1단계: 현재 비밀번호 확인 */}
                <div className="form-group">
                    <label htmlFor="current-password">현재 비밀번호</label>
                    <input
                        type="password"
                        id="current-password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        disabled={loading || isCurrentPasswordVerified}
                    />
                    {!isCurrentPasswordVerified && (
                        <div className="forgot-password">
                            <button
                                type="button"
                                className="text-button"
                                onClick={() => setShowResetForm(true)}
                            >
                                비밀번호를 잊으셨나요?
                            </button>
                        </div>
                    )}
                </div>
                {/* 2단계: 새 비밀번호 설정 (현재 비밀번호 확인 후에만 표시) */}
                {isCurrentPasswordVerified && (
                    <>
                        <div className="form-group">
                            <label htmlFor="new-password">새 비밀번호</label>
                            <input
                                type="password"
                                id="new-password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                disabled={loading}
                                autoFocus
                            />
                            <div className="password-hint">
                                8자 이상, 문자, 숫자, 특수문자 포함
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirm-password">새 비밀번호 확인</label>
                            <input
                                type="password"
                                id="confirm-password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                disabled={loading}
                            />
                        </div>
                    </>
                )}

                <div className="button-group">
                    {!isCurrentPasswordVerified ? (
                        // 1단계 버튼
                        <>
                            <button
                                type="button"
                                className="cancel-button"
                                onClick={() => navigate(-1)}
                                disabled={loading}
                            >
                                취소
                            </button>

                            <button
                                type="submit"
                                className="submit-button"
                                disabled={loading}
                            >
                                {loading ? '확인 중...' : '다음'}
                            </button>
                        </>
                    ) : (
                        // 2단계 버튼
                        <>
                            <button
                                type="button"
                                className="back-button"
                                onClick={handleBack}
                                disabled={loading}
                            >
                                이전
                            </button>

                            <button
                                type="submit"
                                className="submit-button"
                                disabled={loading}
                            >
                                {loading ? '처리 중...' : '비밀번호 변경'}
                            </button>
                        </>
                    )}
                </div>
            </form>
        </div>
    );
};

export default ChangePasswordPage;
