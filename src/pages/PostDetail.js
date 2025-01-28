import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/PostDetail.css';
import DOMPurify from 'dompurify';

const PostDetail = () => {
    const [post, setPost] = useState(null);
    const { teamId, categoryId, postId } = useParams();
    const navigate = useNavigate();
    const [permissions, setPermissions] = useState({
        canEdit: false,
        canDelete: false
    });

    useEffect(() => {

        const checkPermissions = async () => {
            try {
                const response = await axios.get(`/teams/${teamId}/roles/post_permission/check`, {
                    params: {
                        categoryId: categoryId,
                        postId: postId
                    }
                });
                setPermissions(response.data);
                console.log("권한 확인 response: ", response.data);
            } catch (error) {
                console.error('권한 확인 실패:', error);
                setPermissions({ canEdit: false, canDelete: false });
            }
        };

        fetchPost();
        checkPermissions();
    }, [teamId, categoryId, postId]);

    const handleDelete = async () => {
        if (window.confirm('정말로 이 게시글을 삭제하시겠습니까?')) {
            try {
                await axios.delete(`/teams/${teamId}/category/${categoryId}/posts/delete/${postId}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                navigate(`/teams/${teamId}/category/${categoryId}/recent`);
            } catch (error) {
                if (error.response?.status === 403) {
                    alert('게시글 삭제 권한이 없습니다.');
                }else{
                console.error('게시글 삭제 실패:', error);
                alert('게시글 삭제에 실패했습니다.');
                }
            }
        }
    };

    const fetchPost = async () => {
        try {
            const response = await axios.get(`/teams/${teamId}/category/${categoryId}/posts/${postId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            setPost(response.data);
            // 현재 로그인한 사용자와 게시글 작성자 비교

        } catch (error) {
            if (error.response?.status === 403){
                alert('게시글 조회 권한이 없습니다.');
            } else{
            console.error('게시글 로딩 실패:', error);
            alert('게시글을 불러오는데 실패했습니다.');
            }
            navigate(-1);
        }
    };


    const handleEdit = () => {
        navigate(`/teams/${teamId}/category/${categoryId}/posts/${postId}`);
    };

    if (!post) return <div>로딩 중...</div>;

    return (
        <div className="post-detail-container">
            <div className='post-content'>
            <div className="post-header">
            <span className="category-name">{post.categoryName}</span>
                <h1 className="post-title">{post.title}</h1>
                {permissions.canEdit && (
                    <button
                        className="btn btn-primary"
                        onClick={handleEdit}
                    >
                        수정
                    </button>
                )}
                </div>
                <div className="post-info">
                    
                    작성자: {post.author.username} | 작성일: {new Date(post.createdDate).toLocaleDateString()}
                </div>
            
        

            <div className="post-body" dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(post.content)
            }}>
            </div>
            <div className="button-group">
                <button
                    className="btn btn-default"
                    onClick={() => navigate(-1)}
                >
                    목록으로
                </button>
                <div className="spacer"></div>
                {permissions.canDelete && (
                    <button
                        className="btn btn-danger"
                        onClick={handleDelete}
                    >
                        삭제
                    </button>
                )}
            </div>
        </div>
        </div>
    );
};

export default PostDetail;
