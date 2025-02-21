import React from 'react';
import CommentItem from './CommentItem'; // ✅ 분리된 컴포넌트 임포트

function CommentList({ comments, depth = 0 }) {
    return (
        <div className="comment-list">
            {comments.map((comment) => (
                <div 
                    key={comment.id} 
                    className={`comment depth-${depth}`}
                    style={{ marginLeft: depth * 30 }}
                >
                    <CommentItem 
                        comment={comment}
                        depth={depth}
                        postId={comment.postId}
                    />
                    {comment.replies.length > 0 && (
                        <CommentList comments={comment.replies} depth={depth + 1} />
                    )}
                </div>
            ))}
        </div>
    );
};

export default CommentList;