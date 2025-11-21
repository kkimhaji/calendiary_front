import React, { useState, useRef } from 'react';
import axios from '../../api/axios';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../../store/authSlice';

function CommentForm({ categoryId, postId, parentId, depth, onSuccess }) {
    const [content, setContent] = useState('');
    const [hasPermission, setHasPermission] = useState(null); // null: 미확인, true: 권한있음, false: 권한없음
    const [isCheckingPermission, setIsCheckingPermission] = useState(false);
    const textareaRef = useRef(null);
    const isLoggedIn = useSelector(selectIsAuthenticated);

    /**
     * 댓글 작성 권한 확인
     */
    const checkCommentPermission = async () => {
        if (hasPermission !== null) {
            // 이미 권한을 확인했으면 다시 확인하지 않음
            return hasPermission;
        }

        setIsCheckingPermission(true);
        try {
            const response = await axios.get('/permission-check', {
                params: {
                    permission: 'CREATE_COMMENT',
                    targetId: categoryId
                }
            });

            const hasAccess = response.data;
            setHasPermission(hasAccess);
            return hasAccess;
        } catch (error) {
            console.error('권한 확인 실패:', error);
            setHasPermission(false);
            return false;
        } finally {
            setIsCheckingPermission(false);
        }
    };

    /**
     * textarea 포커스 시 권한 확인
     */
    const handleTextareaFocus = async (e) => {
        // 권한을 아직 확인하지 않았거나 권한이 없는 경우
        if (hasPermission === null || hasPermission === false) {
            const hasAccess = await checkCommentPermission();

            if (!hasAccess) {
                // 권한이 없으면 포커스 해제하고 alert 표시
                e.target.blur();
                alert('댓글 작성 권한이 없습니다.');
            }
        }
    };

    /**
     * textarea 클릭 시 권한 확인 (포커스와 별도)
     */
    const handleTextareaClick = async (e) => {
        if (hasPermission === false) {
            e.preventDefault();
            alert('댓글 작성 권한이 없습니다.');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // 제출 시에도 한 번 더 권한 확인
        const hasAccess = await checkCommentPermission();
        if (!hasAccess) {
            alert('댓글 작성 권한이 없습니다.');
            return;
        }

        try {
            await axios.post(`/category/${categoryId}/posts/${postId}/comments`, {
                content,
                parentCommentId: parentId || null,
                depth: depth + 1,
            });
            if (onSuccess) onSuccess();
            setContent('');
        } catch (error) {
            console.error('댓글 작성 실패:', error);

            if (error.response?.status === 403) {
                alert('댓글 작성 권한이 없습니다.');
            } else {
                alert('댓글 작성에 실패했습니다.');
            }
        }
    };

    if (!isLoggedIn) return null;

    return (
        <form onSubmit={handleSubmit} className="comment-form">
            <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onFocus={handleTextareaFocus}
                onClick={handleTextareaClick}
                placeholder={
                    isCheckingPermission
                        ? "권한 확인 중..."
                        : hasPermission === false
                            ? "댓글 작성 권한이 없습니다"
                            : "댓글을 입력하세요"
                }
                disabled={isCheckingPermission || hasPermission === false}
                required
            />
            <button
                type="submit"
                disabled={isCheckingPermission || hasPermission === false || !content.trim()}
            >
                {isCheckingPermission ? '확인 중...' : '등록'}
            </button>
        </form>
    );
}

export default CommentForm;
