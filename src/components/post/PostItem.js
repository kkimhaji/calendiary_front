import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './PostItem.css';

const PostItem = ({ post, teamId, onClick, highlight }) => {
    const navigate = useNavigate();

    const handleClick = () => {
        onClick?.(post);
        navigate(`/teams/${teamId}/category/${post.categoryId}/posts/${post.id}`);
    };
    const highlightText = (text) => {
        if (!highlight) return text;

        const regex = new RegExp(`(${highlight})`, 'gi');
        return text.split(regex).map((part, i) =>
            regex.test(part) ? <mark key={i}>{part}</mark> : part
        );
    };

    return (
        <div className="post-card" onClick={handleClick}>
            <div className='post-main-info'>
                <div className='post-category'>{post.categoryName}</div>
                <h3 className="post-title">
                    {highlight ? highlightText(post.title) : post.title}
                </h3>
                <div className='post-comment-count'>{post.commentCount} 댓글</div>
            </div>
            <div className='post-meta'>
                <Link
                    to={`/teams/${teamId}/members/${post.authorId}`}
                    className="author-name"
                >
                    {post.authorName}
                </Link>
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