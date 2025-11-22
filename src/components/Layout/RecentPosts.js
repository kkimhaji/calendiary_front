import React, { useState } from 'react';
import './RecentPosts.css';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import PostList from '../post/PostList';

const RecentPosts = () => {
    const { teamId, categoryId } = useParams();
    const [teamName, setTeamName] = useState('');
    const [categoryName, setCategoryName] = useState('');
    const navigate = useNavigate();

    const handleMetadataLoaded = ({ teamName, categoryName }) => {
        if (teamName) setTeamName(teamName);
        if (categoryName) setCategoryName(categoryName);
    };

    const handleCreatePost = () => {
        navigate(`/teams/${teamId}/posts/create`);
    };

    return (
        <div className="recent-posts-page">
            <div className='posts-header'>
                <h2>
                    {categoryId
                        ? `${categoryName} 카테고리의 글 목록`
                        : `${teamName} 팀의 글 목록`}
                </h2>
                <div className='header-buttons'>
                    {/* 팀 정보 보기 버튼 - 항상 표시 */}
                    <button
                        className='team-info-button'
                        onClick={() => navigate(`/teams/${teamId}/info`)}
                    >
                        팀 정보 보기
                    </button>

                    {/* 카테고리 정보 버튼 - categoryId가 있을 때만 표시 */}
                    {categoryId && (
                        <button
                            className='category-info-button'
                            onClick={() => navigate(`/teams/${teamId}/category/${categoryId}/info`)}
                        >
                            카테고리 정보
                        </button>
                    )}

                    {/* 글 작성하기 버튼 */}
                    <button
                        className='create-post-button'
                        onClick={handleCreatePost}
                    >
                        글 작성하기
                    </button>
                </div>
            </div>
            <PostList
                teamId={teamId}
                categoryId={categoryId}
                onMetadataLoaded={handleMetadataLoaded}
            />
        </div>
    );
};

export default RecentPosts;
