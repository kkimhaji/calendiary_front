// PostDetail.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/PostDetail.css';

const PostDetail = () => {
    const [post, setPost] = useState(null);
    const [isAuthor, setIsAuthor] = useState(false);
    const { teamId, categoryId, postId } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const response = await axios.get(`/teams/${teamId}/category/${categoryId}/posts/${postId}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                setPost(response.data);

                console.log("API Response: ", response.data);
                
                // 현재 로그인한 사용자와 게시글 작성자 비교
                // const currentUser = JSON.parse(localStorage.getItem('user'));
                // setIsAuthor(currentUser.id === response.data.authorId);
            } catch (error) {
                console.error('게시글 로딩 실패:', error);
                alert('게시글을 불러오는데 실패했습니다.');
                navigate(-1);
            }
        };

        fetchPost();
    }, [teamId, categoryId, postId]);

    const handleDelete = async () => {
        if (window.confirm('정말로 이 게시글을 삭제하시겠습니까?')) {
            try {
                await axios.delete(`/teams/${teamId}/category/${categoryId}/posts/${postId}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                navigate(-1);
            } catch (error) {
                console.error('게시글 삭제 실패:', error);
                alert('게시글 삭제에 실패했습니다.');
            }
        }
    };

    const handleEdit = () => {
        navigate(`/teams/${teamId}/category/${categoryId}/posts/${postId}/edit`);
    };

    if (!post) return <div>로딩 중...</div>;

    return (
        <div className="post-detail-container">
            <div className="post-header">
                <h1 className="post-title">{post.title}</h1>
                <div className="post-info">
                    <span className="category-name">{post.categoryName}</span>
                    <span className="author-name">작성자: {post.authorName}</span>
                    <span className="created-date">
                        {new Date(post.createdDate).toLocaleDateString()}
                    </span>
                </div>
            </div>
            
            <div className="post-content" 
                dangerouslySetInnerHTML={{ __html: post.content }}>
            </div>

            <div className="post-actions">
                <button 
                    className="back-button"
                    onClick={() => navigate(-1)}
                >
                    목록으로
                </button>
                
                {isAuthor && (
                    <div className="author-actions">
                        <button 
                            className="edit-button"
                            onClick={handleEdit}
                        >
                            수정
                        </button>
                        <button 
                            className="delete-button"
                            onClick={handleDelete}
                        >
                            삭제
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PostDetail;
