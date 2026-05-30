import React, { useEffect, useState } from 'react';
import axios from '../../api/axios';
import PostItem from './PostItem';
import SearchBar from './SearchBar';
import './PostList.css';

const PostList = ({ teamId, categoryId, onMetadataLoaded }) => {
    const [posts, setPosts] = useState([]);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchPosts = async (currentPage, isSearch = false) => {
        try {
            let url;
            const params = { page: currentPage, size: 20, sort: 'createdDate,desc' };

            if (isSearch) {
                url = `/teams/${teamId}/posts/search`;
                params.q = searchQuery;
                params.teamId = teamId;
            } else {
                url = categoryId
                    ? `/teams/${teamId}/category/${categoryId}/recent`
                    : `/teams/${teamId}/recent`;
            }

            const response = await axios.get(url, { params });
            const { posts: { content: newPosts }, teamName, categoryName } = response.data;

            if (teamName || categoryName) {
                onMetadataLoaded({ teamName, categoryName });
            }

            // page 0이면 교체, 아니면 추가
            setPosts(prev => currentPage === 0 ? newPosts : [...prev, ...newPosts]);
            setHasMore(!response.data.posts.last);
        } catch (error) {
            console.error('데이터 불러오기 실패:', error);
        }
    };

    // teamId, categoryId, searchQuery 변경 시: page를 0으로 리셋하고 fetch
    useEffect(() => {
        setPage(0);
        fetchPosts(0, !!searchQuery);
    }, [teamId, categoryId, searchQuery]);

    // page가 0보다 클 때(더보기 클릭)만 추가 fetch
    useEffect(() => {
        if (page > 0) {
            fetchPosts(page, !!searchQuery);
        }
    }, [page]);

    const handleSearch = (query) => {
        setSearchQuery(query);
    };

    return (
        <div className="posts-list-container">
            <SearchBar onSearch={handleSearch} />
            <div className="posts-grid">
                {posts.map(post => (
                    <PostItem
                        key={post.id}
                        post={post}
                        teamId={teamId}
                    />
                ))}
            </div>
            {hasMore && (
                <button className='load-more-btn' onClick={() => setPage(p => p + 1)}>
                    더 보기
                </button>
            )}
        </div>
    );
};

export default PostList;