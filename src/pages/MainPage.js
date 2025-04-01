import React, { useEffect, useState } from 'react';
import PostItem from '../components/PostItem';
import { useAuth } from '../contexts/AuthContext';
import axios from '../api/axios';
import '../styles/MainPage.css';

const MainPage = () => {
    const { user } = useAuth();
    const [posts, setPosts] = useState([]);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);

    const loadPosts = async (pageNum) => {
        try {
            const response = await axios.get(`/main?page=${pageNum}`);
            const newPosts = response.data.content;
            
            setPosts(prev => [...prev, ...newPosts]);
            setHasMore(!response.data.last);
            
        } catch (error) {
            console.error('게시글 불러오기 실패:', error);
        }
    };

    useEffect(() => {
        if (user) {
            loadPosts(0); // 초기 로드
        }
    }, [user]);

    return (
        <div className="main-page">
            <h1>내 팀들의 최신 활동</h1>
            
            {user ? (
                <>
                    <div className="post-list">
                        {posts.map(post => (
                            <PostItem 
                                key={post.id}
                                post={post}
                                teamId={post.teamId} // PostItem에 필요한 props 전달
                            />
                        ))}
                    </div>
                    
                    {hasMore && (
                        <button 
                            className="load-more"
                            onClick={() => {
                                const nextPage = page + 1;
                                loadPosts(nextPage);
                                setPage(nextPage);
                            }}
                        >
                            더 보기
                        </button>
                    )}
                </>
            ) : (
                <div className="login-alert">로그인이 필요합니다 🔒</div>
            )}
        </div>
    );
};

export default MainPage;
