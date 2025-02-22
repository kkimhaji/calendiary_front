import React from "react";

const CommentItem = ({ comment, permissions, teamId, categoryId }) => {
    const { canEdit, canDelete } = permissions;
    
    return (
        <div className="comment-item">
            <div className="comment-header">
                <span className="comment-author">{comment.authorName}</span>
                {(canEdit || canDelete) && (
                    <div className="comment-actions">
                        {canEdit && (
                            <button 
                                className="btn-edit"
                                onClick={() => handleEdit(comment.id)}
                            >
                                수정
                            </button>
                        )}
                        {canDelete && (
                            <button
                                className="btn-delete"
                                onClick={() => handleDelete(comment.id)}
                            >
                                삭제
                            </button>
                        )}
                    </div>
                )}
            </div>
            <div className="comment-content">{comment.content}</div>
        </div>
    );
};

export default CommentItem;