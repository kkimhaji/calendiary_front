import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

function CommentForm({ postId, parentId, depth, onSuccess }) {
    const [content, setContent] = useState('');
    const { isLoggedIn } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`/posts/${postId}/comments`, {
                content,
                parentCommentId: parentId || null,
                depth: depth + 1, // 현재 댓글 깊이 + 1
            },{
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                }
            });
            if (onSuccess) onSuccess();
            setContent('');
        } catch (error) {
            console.error('댓글 작성 실패:', error);
        }
    };

    if (!isLoggedIn) return null;

    return (
        <form onSubmit={handleSubmit} className="comment-form">
            <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="댓글을 입력하세요"
                required
            />
            <button type="submit">등록</button>
        </form>
    );
};

export default CommentForm;