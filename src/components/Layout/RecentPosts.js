import React, { useState, useEffect } from 'react';
import axios from '../../api/axios';
import '../../styles/RecentPosts.css';
import { useLocation, useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import SearchBar from '../post/SearchBar';
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

    // 팀 정보 조회
    useEffect(() => {
        const fetchTeamInfo = async () => {
            try {
                const response = await axios.get(`/teams/${teamId}/info`);
                setTeamName(response.data.name);
            } catch (error) {
                console.error('팀 정보 조회 실패:', error);
            }
        };
        if (teamId) fetchTeamInfo();
    }, [teamId]);

    // 카테고리 정보 조회
    useEffect(() => {
        const fetchCategoryInfo = async () => {
            try {
                const response = await axios.get(`/teams/${teamId}/category/${categoryId}/info`);
                setCategoryName(response.data.name);
            } catch (error) {
                console.error('카테고리 정보 조회 실패:', error);
            }
        };
        if (categoryId) fetchCategoryInfo();
    }, [categoryId, teamId]);

    const handleCreatePost = () => {
        navigate(`/teams/${teamId}/posts/create`);
    }


    return (
        <div className="recent-posts-page">
            <div className='posts-header'>
                <h2>
                    {categoryId
                        ? `${categoryName} 카테고리의 글 목록`
                        : `${teamName} 팀의 글 목록`}
                </h2>
                {!categoryId ? (
                    <button
                        className='team-info-button'
                        onClick={() => navigate(`/teams/${teamId}/info`)}
                    >
                        팀 정보 보기
                    </button>
                ) : (
                    <button
                        className='category-info-button'
                        onClick={() => navigate(`/teams/${teamId}/category/${categoryId}/info`)}
                    >
                        카테고리 정보
                    </button>
                )}
                <button className='create-post-button'
                    onClick={handleCreatePost} >
                    글 작성하기
                </button>
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