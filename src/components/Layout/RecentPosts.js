import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../styles/RecentPosts.css';
import { selectedTeamId, setSelectedTeamId, useTeam } from '../../contexts/TeamContext.js';
import { useLocation, useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

const RecentPosts = () => {
    const [posts, setPosts] = useState([]);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const { teamId, categoryId } = useParams(); // URL 파라미터 사용
    const location = useLocation();
    const navigate = useNavigate();

    const fetchPosts = async (teamId, categoryId) => {
        if (!teamId) return; // teamId가 없으면 요청하지 않음

        try {
            let url;
            if (categoryId) {
                url = `/teams/${teamId}/category/${categoryId}/recent`;
            } else {
                url = `/teams/${teamId}/recent`;
            }
            const response = await axios.get(url, {
                params: {
                    page: 0,
                    size: 20,
                    sort: 'createdDate,desc'
                },
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                }
            });

            if (response.data.content) {
                const postsData = response.data.content || response.data;
                if (page === 0) {
                    setPosts(postsData);
                } else {
                    setPosts(prev => [...prev, ...postsData]);
                }
                setHasMore(postsData.length === 20);
            }

        } catch (error) {
            console.error('게시물 로딩 실패:', error);
        }
    };

    useEffect(() => {
        setPage(0);
        //페이지 초기화
        setPosts([]);
        if (teamId) {  // teamId가 있을 때만 실행
            fetchPosts(teamId, categoryId);  // 파라미터 전달
        }
    }, [teamId, categoryId, location.pathname]);

    const loadMore = () => {
        setPage(prev => prev + 1);
    };

    const handleCreatePost = () => {
        navigate(`/teams/${teamId}/posts/create`);
    }

    const handlePostClick = (post) =>{
        navigate(`/teams/${teamId}/category/${post.categoryId}/posts/${post.id}`);
    }

    return (
        <div className="recent-posts-container">
            <div className='posts-header'>
                <h2>{categoryId ? `${categoryId} 게시물`: '팀 게시물'}</h2>
                <button className='create-post-button'
                    onClick={handleCreatePost} >
                    글 작성하기
                </button>
            </div>
            <div className="posts-list">
                {posts.length > 0 ? (
                    posts.map(post => (
                        <div key={post.id} className="post-card" onClick={() => handlePostClick(post)}>
                            <div className='post-main-info'>
                                <h3 className="post-title">{post.title}</h3>
                                <div className='post-category'> <span>카테고리: </span>{post.categoryName} </div>
                                <div className='post-comment-count'>{post.commentCount}</div>
                            </div>
                            <div className='post-meta'>
                                <span className='post-author'> {post.authorName} </span>
                                <span className='post-date'> {new Date(post.createdDate).toLocaleDateString()}</span>
                                <span className='post-views'> <i className='fas fa-eye'></i> {post.viewCount} </span>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="no-posts-message">
                        작성된 게시글이 없습니다.
                    </div>)}
            </div>
            {hasMore && (
                <button className="load-more-btn" onClick={loadMore}>
                    더 보기
                </button>
            )}
        </div>
    );
};

export default RecentPosts;
