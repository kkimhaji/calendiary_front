import React, { useState, useEffect } from 'react';
import CommentItem from './CommentItem';

const CommentList = ({ comments, teamId, categoryId }) => {
    const [commentPermissions, setCommentPermissions] = useState({});

    // ✅ 각 댓글의 권한 정보 조회
    const fetchCommentPermissions = async (commentId) => {
        try {
            const response = await axios.get(`/teams/${teamId}/roles/comment-edit-delete/check`, {
                params:{
                    categoryId: categoryId,
                    commentId: commentId
                },
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                }
            });
            setCommentPermissions(prev => ({
                ...prev,
                [commentId]: response.data
            }));
        } catch (error) {
            console.error('댓글 권한 조회 실패:', error);
        }
    };

    useEffect(() => {
        comments.forEach(comment => {
            fetchCommentPermissions(comment.id);
        });
    }, [comments]);

    return (
        <div className="comment-list">
            {comments.map(comment => (
                <CommentItem 
                    key={comment.id}
                    comment={comment}
                    permissions={commentPermissions[comment.id] || {}}
                    teamId={teamId}
                    categoryId={categoryId}
                />
            ))}
        </div>
    );
};

export default CommentList;