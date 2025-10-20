import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from '../api/axios';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../store/authSlice';
import ContentDetailLayout from '../layout/ContentDetailLayout';
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
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const isAuthenticated = useSelector(selectIsAuthenticated);

    const refreshComments = async () => {
        try {
            const response = await axios.get(`/category/${categoryId}/posts/${postId}/comments`);
            setComments(response.data || []);
        } catch (error) {
            setComments([]);
            console.error('댓글 목록 조회 실패:', error);
        }
    };

    useEffect(() => {
        let isCancelled = false;
        const checkPermissions = async () => {
            try {
                const response = await axios.get(`/edit-delete-check/post`, {
                    params: {
                        postId: postId
                    },
                });
                setPermissions(response.data);
            } catch (error) {
                console.error('권한 확인 실패:', error);
                setPermissions({ canEdit: false, canDelete: false });
            }
        };

        const loadData = async () => {
            try {
                setLoading(true);
                setError(null);

                // 1. 게시글 조회 (필수)
                await fetchPost();

                if (isCancelled) return;

                // 2. 댓글과 권한을 병렬로 조회 (선택적)
                await Promise.allSettled([
                    refreshComments(),
                    checkPermissions()
                ]);

            } catch (error) {
                console.error('데이터 로딩 실패:', error);
                if (!isCancelled) {
                }
            } finally {
                if (!isCancelled) {
                    console.log('로딩 상태 해제');
                    setLoading(false);
                }
            }
        };

        loadData();

        return () => {
            isCancelled = true;
        };
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
            return response.data;
            // 현재 로그인한 사용자와 게시글 작성자 비교

        } catch (error) {
            console.error('게시글 로딩 실패:', error);
            setPost(null);

            if (error.response?.status === 403) {
                setError('게시글 조회 권한이 없습니다.');
            } else if (error.response?.status === 404) {
                setError('게시글을 찾을 수 없습니다.');
            } else {
                setError('게시글을 불러오는데 실패했습니다.');
            }
            throw error; // 에러를 다시 던져서 useEffect에서 처리
        }
    };


    const handleEdit = () => {
        if (!permissions.canEdit) {
            alert('게시글 수정 권한이 없습니다.');
            return;
        }
        navigate(`/teams/${teamId}/category/${categoryId}/posts/${postId}/edit`, {
            state: {
                isEdit: true,
                postData: {
                    id: post.id,
                    title: post.title,
                    content: post.content,
                    teamId: teamId,
                    categoryId: categoryId
                }
            }
        });
    };

    if (loading) return <div className="loading">로딩 중...</div>;
    if (error) return <div className="error">{error}</div>;
    if (!post) return <div className="not-found">게시글을 찾을 수 없습니다.</div>;

    return (
        <ContentDetailLayout
            title={post.title}
            content={post.content}
            authorInfo={
                <Link
                    to={`/teams/${teamId}/members/${post.author.id}`}
                    className="author-link"
                >
                    작성자: {post.author.username}
                </Link>
            }
            createdDate={post.createdDate}
            headerExtra={
                <span className="category-name">{post.categoryName}</span>
            }
            metaInfo={`조회수: ${post.viewCount}`}
            permissions={permissions}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onBack={() => navigate(-1)}
            commentsSection={
                <>
                    <h4>댓글 ({comments.length})</h4>
                    {isAuthenticated ? (
                        <>
                            <CommentForm
                                categoryId={categoryId}
                                postId={postId}
                                onCommentSubmitted={refreshComments}
                            />
                            <CommentList
                                comments={comments}
                                onCommentSubmitted={refreshComments}
                                postId={postId}
                                teamId={teamId}
                            />
                        </>
                    ) : (
                        <div className="comment-auth-required">
                            댓글을 보려면 로그인해주세요.
                        </div>
                    )}
                </>
            }
            className="post-detail-container"
        />
    );
};

export default PostDetail;