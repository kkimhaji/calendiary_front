import React, { useEffect, useState } from 'react';
import PostItem from '../components/PostItem';
import { logoutUser, selectIsAuthenticated } from '../store/authSlice';
import axios from '../api/axios';
import '../styles/MainPage.css';
import { useSelector, useDispatch } from 'react-redux';

const MainPage = () => {
    const dispatch = useDispatch();
    const isLoggedIn = useSelector(selectIsAuthenticated);
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
        console.log("isLoggedIn: ", isLoggedIn);
        if (isLoggedIn) {
            loadPosts(0); // 초기 로드
        } else{
            window.location.href="/login";
            console.log("not logged in!");
            dispatch(logoutUser());
        }
    }, [isLoggedIn]);

    return (
        <div className="main-page">
            <h1>내 팀들의 최신 활동</h1>
            
            {isLoggedIn ? (
                <>
                    <div className="post-list">
                        {posts.map(post => (
                            <PostItem 
                                key={post.id}
                                post={post}
                                categoryId={post.categoryId}
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
