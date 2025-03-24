import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/PostItem.css';

const PostItem = ({ post, teamId, onClick }) => {
    const navigate = useNavigate();

    const handleClick = () => {
        onClick?.(post);
        navigate(`/teams/${teamId}/category/${post.categoryId}/posts/${post.id}`);
    };

    return (
        <div className="post-card" onClick={handleClick}>
            <div className='post-main-info'>
                <div className='post-category'>{post.categoryName}</div>
                <h3 className="post-title">{post.title}</h3>
                <div className='post-comment-count'>{post.commentCount} 댓글</div>
            </div>
            <div className='post-meta'>
                <span className='post-author'>{post.authorName}</span>
                <span className='post-date'>
                    {new Date(post.createdDate).toLocaleDateString()}
                </span>
                <span className='post-views'>
                    <i className='fas fa-eye'></i> {post.viewCount}
                </span>
            </div>
        </div>
    );
};

export default PostItem;
