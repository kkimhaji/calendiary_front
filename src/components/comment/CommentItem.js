import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from '../../api/axios';
import CommentForm from "./CommentForm";
import './CommentItem.css';
import CommentList from "./CommentList";

const CommentItem = ({ categoryId, comment, depth, postId, onCommentSubmitted, teamId }) => {
    const [permissions, setPermissions] = useState({ canEdit: false, canDelete: false });
    const [showReplyForm, setShowReplyForm] = useState(false);
    const [isDeleted, setIsDeleted] = useState(comment?.isDeleted || false);

    const handleReplyClick = () => {
        setShowReplyForm(!showReplyForm);
    };

    useEffect(() => {
        const fetchPermissions = async () => {
            try {
                const response = await axios.get(`/edit-delete-check/comment`, {
                    params: { commentId: comment.id }
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
        try {
            onCommentSubmitted();
            setIsDeleted(true);
            await axios.delete(`/category/${categoryId}/posts/${postId}/comments/${commentId}`);
        } catch (error) {
            setIsDeleted(false);
            console.error('댓글 삭제 실패:', error);
            alert('댓글 삭제에 실패했습니다.');
        }
    };

    return (
        <div className="comment-content">
            {comment.isDeleted ? (
                <em>삭제된 댓글입니다.</em>
            ) : (
                <>
                    <div className="comment-header">
                        <Link
                            to={`/teams/${teamId}/members/${comment.authorId}`}
                            className="author-name"
                        >
                            {comment.authorName}
                        </Link>
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

                    {/* 최대 depth 미만일 때만 답글 버튼 표시 */}
                    {depth < 2 && (
                        <button className="btn-reply" onClick={handleReplyClick}>
                            {showReplyForm ? '답글 취소' : '답글 작성'}
                        </button>
                    )}

                    {/* 답글 폼은 showReplyForm이 true일 때만 렌더링 */}
                    {showReplyForm && depth < 2 && (
                        <CommentForm
                            categoryId={categoryId}
                            postId={postId}
                            parentId={comment.id}
                            depth={depth}
                            onSuccess={() => {
                                setShowReplyForm(false);
                                onCommentSubmitted();
                            }}
                        />
                    )}
                </>
            )}

            {/* 대댓글 목록 */}
            {(comment.replies || []).length > 0 && (
                <CommentList
                    categoryId={categoryId}
                    postId={postId}
                    comments={comment.replies}
                    depth={depth + 1}
                    onCommentSubmitted={onCommentSubmitted}
                    teamId={teamId}
                />
            )}
        </div>
    );
};

export default CommentItem;