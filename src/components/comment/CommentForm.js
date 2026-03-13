import React, { useState } from 'react';
import axios from '../../api/axios';

function CommentForm({ categoryId, postId, parentId, depth = 0, onCommentSubmitted, onSuccess }) {
    const [content, setContent] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content.trim()) return;

        setSubmitting(true);
        try {
            await axios.post(`/category/${categoryId}/posts/${postId}/comments`, {
                content,
                parentCommentId: parentId || null,
                depth: depth + 1,
            });
            setContent('');
            if (onCommentSubmitted) onCommentSubmitted();
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error('댓글 작성 실패:', error);
            if (error.response?.status === 403) {
                alert('댓글 작성 권한이 없습니다.');
            } else {
                alert('댓글 작성에 실패했습니다.');
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="comment-form">
            <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="댓글을 입력하세요"
                rows={3}
            />
            <button type="submit" disabled={submitting || !content.trim()}>
                {submitting ? '작성 중...' : '댓글 작성'}
            </button>
        </form>
    );
}

export default CommentForm;