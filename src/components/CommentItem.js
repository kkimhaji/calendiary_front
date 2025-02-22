import React, {useEffect, useState} from "react";
import axios from "axios";
import CommentForm from "./CommentForm";

// CommentItem.js
const CommentItem = ({ comment, depth, postId }) => {
    const [permissions, setPermissions] = useState({
        canEdit: false,
        canDelete: false
    });
    // ✅ 동일한 DTO 구조로 권한 조회
    useEffect(() => {
        const fetchPermissions = async () => {
            try {
                const response = await axios.get(`/roles/comment-edit-delete/check`, {
                    params:{
                        commentId: comment.id
                    },
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                    }
                });
                // ✅ response.data = { canEdit: boolean, canDelete: boolean }
                setPermissions(response.data);
            } catch (error) {
                console.error('댓글 권한 확인 실패:', error);
            }
        };
        fetchPermissions();
    }, [comment.id]);
    const handleEdit = (commentId) => {
        console.log("Edit comment:", commentId);
        // 수정 로직 구현
    };

    const handleDelete = (commentId) => {
        console.log("Delete comment:", commentId);
        // 삭제 로직 구현 (API 호출 추가)
    };
    return (
        <div className="comment-content">
            {comment.isDeleted ? (
                <em>삭제된 댓글입니다</em>
            ) : (
                <>
                    <div className="comment-header">
                        <span className="author">{comment.authorName}</span>
                        <div className="comment-actions">
                            {permissions.canEdit && (
                                <button 
                                    className="btn-edit"
                                    onClick={() => handleEdit(comment.id)}
                                >
                                    수정
                                </button>
                            )}
                            {permissions.canDelete && (
                                <button
                                    className="btn-delete"
                                    onClick={() => handleDelete(comment.id)}
                                >
                                    삭제
                                </button>
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