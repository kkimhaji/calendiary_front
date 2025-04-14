import React, { useEffect, useState } from "react";
import axios from '../api/axios';
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
    const [isDeleted, setIsDeleted] = useState(comment?.isDeleted || false);

    useEffect(() => {
        const fetchPermissions = async () => {
            try {
                const response = await axios.get(`/edit-delete-check/comment`, {
                    params: {
                        commentId: comment.id
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

    const handleDelete = async (commentId) => {
        try{
        console.log("Delete comment:", commentId);
        // 삭제 로직 구현 (API 호출 추가)
        onCommentSubmitted();

        //api 호출 전 ui에 즉시 반영
        setIsDeleted(true);
        await axios.delete(`/posts/${postId}/comments/${commentId}`);
    } catch (error) {
        // 실패 시 UI 롤백
        setIsDeleted(false);
        console.error('댓글 삭제 실패:', error);
        alert('댓글 삭제에 실패했습니다.');
    }
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
                            {new Date(comment.createdDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <div className="comment-actions">
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