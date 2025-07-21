import React, { useState, useEffect } from 'react';
import CommentItem from './CommentItem';
import './CommentList.css';

function CommentList({ comments = [], postId, depth = 0, onCommentSubmitted, teamId }) {
    return (
        <div className="comment-list">
            {comments.map((comment) => (
                <div 
                    key={comment.id} 
                    className={`comment depth-${depth}`}
                    style={{ marginLeft: depth * 30 }}
                >
                    <CommentItem 
                        categoryId={comment.categoryId}
                        comment={comment}
                        teamId={teamId}
                        depth={depth}
                        postId={postId}
                        onCommentSubmitted={onCommentSubmitted}
                    />
                </div>
            ))}
        </div>
    );
};

export default CommentList;