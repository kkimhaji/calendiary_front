import React, { useState, useEffect } from 'react';
import './RecentPosts.css';
import { useParams, useNavigate } from 'react-router-dom';
import PostList from '../post/PostList';
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
        // categoryId가 없는 경우(팀 전체 글 목록)엔 권한 체크 불필요
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

                    {/* 글 작성 권한이 있을 때만 표시 */}
                    {canCreatePost && (
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