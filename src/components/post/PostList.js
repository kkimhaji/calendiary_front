import React, { useEffect, useState } from 'react';
import axios from '../../api/axios';
import PostItem from './PostItem';
import SearchBar from './SearchBar';
import '../styles/PostList.css';

const PostList = ({ teamId, categoryId, onMetadataLoaded }) => {
    const [posts, setPosts] = useState([]);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchPosts = async (isSearch = false) => {
        try {
            let url;
            const params = { page, size: 20, sort: 'createdDate,desc' };

            if (isSearch) {
                url = `/teams/${teamId}/post-search`;
                params.q = searchQuery;
                params.teamId = teamId; // 팀별 검색 필터 추가
            } else {
                url = categoryId
                    ? `/teams/${teamId}/category/${categoryId}/recent`
                    : `/teams/${teamId}/recent`;
            }

            const response = await axios.get(url, { params });
            //   const newPosts = response.data.posts.content || [];
            const { posts: { content: newPosts }, teamName, categoryName } = response.data;

            if (teamName || categoryName) {
                onMetadataLoaded({ teamName, categoryName });
            }

            setPosts(prev => page === 0 ? newPosts : [...prev, ...newPosts]);
            setHasMore(!response.data.last);
        } catch (error) {
            console.error('데이터 불러오기 실패:', error);
        }
    };

    useEffect(() => {
        setPage(0);
        fetchPosts(!!searchQuery);
    }, [teamId, categoryId, searchQuery]);

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
