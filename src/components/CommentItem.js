import React from 'react';
import CommentForm from './CommentForm';

const CommentItem = ({ comment, depth, postId }) => {
    const [permissions, setPermissions] = useState({ canEdit: false, canDelete: false });

    // ✅ 권한 확인 로직
    useEffect(() => {
        const fetchPermissions = async () => {
            try {
                const response = await axios.get(`/comments/${comment.id}/permissions`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
                });
                setPermissions(response.data);
            } catch (error) {
                console.error('권한 확인 실패:', error);
            }
        };
        fetchPermissions();
    }, [comment.id]);

    return (
        <div className="comment-content">
            {comment.isDeleted ? (
                <em>{comment.content}</em>
            ) : (
                <>
                    <div className="comment-header">
                        <span className="author">{comment.authorName}</span>
                        <div className="comment-actions">
                            {permissions.canEdit && (
                                <button className="btn-edit">수정</button>
                            )}
                            {permissions.canDelete && (
                                <button className="btn-delete">삭제</button>
                            )}
                        </div>
                    </div>
                    <p>{comment.content}</p>
                    {comment.depth < 2 && (
                        <CommentForm 
                            postId={postId} 
                            parentId={comment.id} 
                            depth={depth + 1}
                        />
                    )}
                </>
            )}
        </div>
    );
};

export default CommentItem;