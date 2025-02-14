import React from 'react';

function CommentList({ comments, depth = 0 }) {
    return (
        <div className="comment-list">
            {comments.map((comment) => (
                <div 
                    key={comment.id} 
                    className={`comment depth-${depth}`}
                    style={{ marginLeft: depth * 30 }} // 들여쓰기
                >
                    <div className="comment-content">
                        {comment.isDeleted ? (
                            <em>{comment.content}</em>
                        ) : (
                            <>
                                <span className="author">{comment.author.nickname}</span>
                                <p>{comment.content}</p>
                                {comment.depth < 2 && ( // 최대 3단계까지만 허용
                                    <CommentForm 
                                        postId={comment.postId} 
                                        parentId={comment.id} 
                                        depth={comment.depth}
                                    />
                                )}
                            </>
                        )}
                    </div>
                    {comment.replies.length > 0 && (
                        <CommentList comments={comment.replies} depth={depth + 1} />
                    )}
                </div>
            ))}
        </div>
    );
};

export default CommentList;
