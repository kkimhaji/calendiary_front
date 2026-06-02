import React, { useState, useEffect } from 'react';
import './RecentPosts.css';
import { useParams, useNavigate } from 'react-router-dom';
import PostList from './PostList';
import axios from '../../api/axios';

const RecentPosts = () => {
    const { teamId, categoryId } = useParams();
    const [teamName, setTeamName] = useState('');
    const [categoryName, setCategoryName] = useState('');
    const [canCreatePost, setCanCreatePost] = useState(false);
    const navigate = useNavigate();

    const handleMetadataLoaded = ({ teamName, categoryName }) => {
        if (teamName) setTeamName(teamName);
        if (categoryName) setCategoryName(categoryName);
    };

    useEffect(() => {
        // 카테고리가 없는 팀 전체 글 목록에서는 버튼을 표시하지 않음
        // 글 작성에는 카테고리 선택이 필수이므로 카테고리 페이지에서만 허용
        if (!categoryId) {
            setCanCreatePost(false);
            return;
        }

        const checkCreatePostPermission = async () => {
            try {
                const response = await axios.get('/permission-check', {
                    params: { permission: 'CREATE_POST', targetId: categoryId }
                });
                setCanCreatePost(response.data);
            } catch {
                setCanCreatePost(false);
            }
        };

        checkCreatePostPermission();
    }, [categoryId]);

    return (
        <div className="recent-posts-page">
            <div className='posts-header'>
                <h2>
                    {categoryId
                        ? `${categoryName} 카테고리의 글 목록`
                        : `${teamName} 팀의 글 목록`}
                </h2>
                <div className='header-buttons'>
                    <button
                        className='team-info-button'
                        onClick={() => navigate(`/teams/${teamId}/info`)}
                    >
                        팀 정보 보기
                    </button>

                    {categoryId && (
                        <button
                            className='category-info-button'
                            onClick={() => navigate(`/teams/${teamId}/category/${categoryId}/info`)}
                        >
                            카테고리 정보
                        </button>
                    )}

                    {/* 카테고리가 있고 작성 권한이 있을 때만 표시 */}
                    {categoryId && canCreatePost && (
                        <button
                            className='create-post-button'
                            onClick={() => navigate(`/teams/${teamId}/posts/create`)}
                        >
                            글 작성하기
                        </button>
                    )}
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