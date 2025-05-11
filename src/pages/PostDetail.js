import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from '../api/axios';
import './PostDetail.css';
import DOMPurify from 'dompurify';
import CommentForm from '../components/comment/CommentForm';
import CommentList from '../components/comment/CommentList';

const PostDetail = () => {
    const [post, setPost] = useState(null);
    const { teamId, categoryId, postId } = useParams();
    const navigate = useNavigate();
    const [permissions, setPermissions] = useState({
        canEdit: false,
        canDelete: false
    });
    const [comments, setComments] = useState([]);

    const refreshComments = async () => {
        try {
            const response = await axios.get(`/posts/${postId}/comments`);
            console.log("comment", response.data);
            setComments(response.data || []);
        } catch (error) {
            setComments([]);
            console.error('댓글 목록 조회 실패:', error);
        }
    };

    useEffect(() => {
        const checkPermissions = async () => {
            try {
                const response = await axios.get(`/edit-delete-check/post`, {
                    params: {
                        postId: postId
                    },
                });
                setPermissions(response.data);
                console.log("권한 확인 response: ", response.data);
            } catch (error) {
                console.error('권한 확인 실패:', error);
                setPermissions({ canEdit: false, canDelete: false });
            }
        };
        refreshComments();
        fetchPost();
        checkPermissions();
    }, [teamId, categoryId, postId]);

    const handleDelete = async () => {
        if (window.confirm('정말로 이 게시글을 삭제하시겠습니까?')) {
            try {
                await axios.delete(`/teams/${teamId}/category/${categoryId}/posts/delete/${postId}`);
                navigate(`/teams/${teamId}/category/${categoryId}/recent`);
            } catch (error) {
                if (error.response?.status === 403) {
                    alert('게시글 삭제 권한이 없습니다.');
                } else {
                    console.error('게시글 삭제 실패:', error);
                    alert('게시글 삭제에 실패했습니다.');
                }
            }
        }
    };

    const fetchPost = async () => {
        try {
            const response = await axios.get(`/teams/${teamId}/category/${categoryId}/posts/${postId}`);
            setPost(response.data);
            // 현재 로그인한 사용자와 게시글 작성자 비교

        } catch (error) {
            setPost(null);
            if (error.response?.status === 403) {
                alert('게시글 조회 권한이 없습니다.');
            } else {
                console.error('게시글 로딩 실패:', error);
                alert('게시글을 불러오는데 실패했습니다.');
            }
            navigate(-1);
        }
    };


    const handleEdit = () => {
        navigate(`/teams/${teamId}/category/${categoryId}/posts/${postId}/edit`);
    };

    if (!post || !post.title) return <div>로딩 중...</div>;

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

                    작성자:
                    <Link
                        to={`/teams/${teamId}/members/${post.author.id}`}
                        className="author-link"
                    >
                        {post.author.username}
                    </Link> |  작성일: {new Date(post.createdDate).toLocaleDateString()} |
                    <span className="view-count">조회수: {post.viewCount}</span>
                </div>


                <div className="post-body" dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(post.content)
                }}>
                </div>
                <hr></hr>
                <div>
                    <h4> 댓글 ({comments.length})</h4>
                    <CommentForm postId={postId} />
                    <div>
                        <CommentList comments={comments} onCommentSubmitted={refreshComments} postId={postId} teamId={teamId} />
                    </div>
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
