import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../styles/RecentPosts.css';
import {selectedTeamId, setSelectedTeamId, useTeam} from '../../contexts/TeamContext.js';
import { useLocation, useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

const RecentPosts = () => {
    const [posts, setPosts] = useState([]);
    // const {selectedTeamId, setSelectedTeamId, selectedCategoryId, setSelectedCategoryId} = useTeam();
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const { teamId, categoryId } = useParams(); // URL 파라미터 사용
    const location = useLocation();
    const navigate = useNavigate();

    const fetchPosts = async (teamId, categoryId) => {
        if (!teamId) return; // teamId가 없으면 요청하지 않음

        try {
            let url;
            if (categoryId){
                url = `/teams/${teamId}/category/${categoryId}/recent`;
            } else{
                url = `/teams/${teamId}/recent`;
            }
            const response = await axios.get(url, {
                params: {
                    page: 0,
                    size: 20,
                    sort: 'createdDate,desc'
                },
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                  }
            });

            if (response.data.content) {
                if (page === 0) {
                    setPosts(response.data.content);
                } else {
                    setPosts(prev => [...prev, ...response.data.content]);
                }
                setHasMore(response.data.content.length === 20);
            }

            // setPosts(response.data.content);
            // if (response.data.length < 20) {
            //     setHasMore(false);
            // }
            // setPosts(prev => page === 0 ? response.data : [...prev, ...response.data]);

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

    const handleCreatePost = () =>{
        navigate(`/teams/${teamId}/posts/create`);
    }

    return (
        <div className="recent-posts-container">
            <div className='posts-header'>
                <h2>{categoryId ? '카테고리 게시물' : '팀 게시물'}</h2>
                <button className='create-post-button'
                onClick={handleCreatePost} >
                    글 작성하기
                </button>
            </div>
            <div className="posts-list">
                {posts.length > 0 ? (
                        posts.map(post => (
                            <div key={post.id} className="post-card">
                                <h3 className="post-title">{post.title}</h3>
                                <p className="post-date">
                                    {new Date(post.createdDate).toLocaleDateString()}
                                </p>
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
