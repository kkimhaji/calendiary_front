import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../styles/RecentPosts.css';

const RecentPosts = ({ teamId, categoryId }) => {
    const [posts, setPosts] = useState([]);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);

    const fetchPosts = async () => {
        try {
            let url;
            if (categoryId){
                url = `/category/${categoryId}/posts`;
            } else{
                url = `/teams/${teamId}/recent`;
            }
            const response = await axios.get(url, {
                params: {
                    page: 0,
                    size: 20,
                    sort: 'createdAt,desc'
                },
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                  }
            });
            setPosts(response.data.content);

            if (response.data.length < 20) {
                setHasMore(false);
            }

            setPosts(prev => page === 0 ? response.data : [...prev, ...response.data]);

        } catch (error) {
            console.error('게시물 로딩 실패:', error);
        }
    };

    useEffect(() => {
        fetchPosts();
        //페이지 초기화
        setPage(0);
        setPosts([]);
    }, [teamId, page]);

    const loadMore = () => {
        setPage(prev => prev + 1);
    };

    return (
        <div className="recent-posts-container">
            <h2>{categoryId ? '카테고리 게시물' : '팀 게시물'}</h2>
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
