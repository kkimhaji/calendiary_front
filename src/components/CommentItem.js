import React, {useEffect, useState} from "react";
import axios from "axios";
import CommentForm from "./CommentForm";
import '../styles/CommentItem.css';
import CommentList from "./CommentList";

// CommentItem.js
const CommentItem = ({ comment, depth, postId, onCommentSubmitted }) => {
    const [permissions, setPermissions] = useState({
        canEdit: false,
        canDelete: false
    });
    const [showReplyForm, setShowReplyForm] = useState(false); 
    // 답글 작성 버튼 핸들러
    const handleReplyClick = () => {
        setShowReplyForm(!showReplyForm);
    };

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
                setPermissions(response.data);
            } catch (error) {
                console.error('댓글 권한 확인 실패:', error);
            }
        };
        fetchPermissions();
    }, [comment]);

    if (!comment) return null;

    const handleEdit = (commentId) => {
        console.log("Edit comment:", commentId);
        // 수정 로직 구현
        onCommentSubmitted();
    };

    const handleDelete = (commentId) => {
        console.log("Delete comment:", commentId);
        // 삭제 로직 구현 (API 호출 추가)
        onCommentSubmitted();

        //api 호출 전 ui에 즉시 반영
        //수정 예정
        // setComments(prev => prev.filter(c => c.id !== commentId));
        // axios.delete(`/comments/${commentId}`).catch(() => {
        // // 실패 시 롤백
        // setComments(prev => [...prev, deletedComment]);
    // });
    };
    return (
        <div className="comment-content">
            {comment.isDeleted ? (
                <em>삭제된 댓글입니다</em>
            ) : (
                <>
                    <div className="comment-header">
                        <span className="author">{comment.authorName}</span>
                        <span className="comment-time">
        {new Date(comment.createdDate).toLocaleDateString()} 
        {new Date(comment.createdDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
    </span>
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
            {/* 답글 작성 버튼 */}
            {depth < 2 && ( // 최대 3단계까지만 허용
                <button 
                    className="btn-reply"
                    onClick={handleReplyClick}
                >
                    답글 작성
                </button>
            )}
            {/* 답글 작성 폼 */}
            {showReplyForm && (
                <CommentForm 
                    postId={postId}
                    parentId={comment.id} 
                    depth={depth}
                    onSuccess={() => {
                        setShowReplyForm(false);
                        onCommentSubmitted(); // 상위 컴포넌트에 새로고침 요청
                    }}
                />
            )}

            {/* 대댓글 목록 */}
            {(comment.replies || []).length > 0 && (
                <CommentList 
                    postId={postId}
                    comments={comment.replies} 
                    depth={depth + 1}
                    onCommentSubmitted={onCommentSubmitted}
                />
            )}
        </div>
    );
};

export default CommentItem;