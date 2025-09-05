import React, { useEffect, useState } from 'react';
import axios from '../../api/axios';
import DiaryItem from './DiaryItem';
import SearchBar from '../post/SearchBar';
import { useNavigate } from 'react-router-dom';
import './DiaryList.css';

const DiaryList = ({ viewMode = 'list' }) => {
    const [diaries, setDiaries] = useState([]);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const fetchDiaries = async (isSearch = false) => {
        setIsLoading(true);
        try {
            const params = { 
                page, 
                size: 20, 
                sort: 'createdDate,desc' 
            };

            let url = '/diary';
            if (isSearch && searchQuery) {
                url = '/diary/search';
                params.q = searchQuery;
            }

            const response = await axios.get(url, { params });
            const newDiaries = response.data.content || [];

            setDiaries(prev => page === 0 ? newDiaries : [...prev, ...newDiaries]);
            setHasMore(!response.data.last);
        } catch (error) {
            console.error('일기 목록 조회 실패:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        setPage(0);
        fetchDiaries(!!searchQuery);
    }, [searchQuery]);

    useEffect(() => {
        if (page > 0) {
            fetchDiaries(!!searchQuery);
        }
    }, [page]);

    const handleDiaryClick = (diary) => {
        navigate(`/diary/${diary.diaryId}`);
    };

    const handleSearch = (query) => {
        setSearchQuery(query);
    };

    return (
        <div className="diary-list-container">
            <SearchBar onSearch={handleSearch} placeholder="일기 검색..." />
            
            <div className={`diary-grid ${viewMode}`}>
                {diaries.map(diary => (
                    <DiaryItem
                        key={diary.diaryId}
                        diary={diary}
                        onClick={handleDiaryClick}
                        highlight={searchQuery}
                    />
                ))}
            </div>

            {isLoading && (
                <div className="loading">로딩 중...</div>
            )}

            {hasMore && !isLoading && (
                <button 
                    className="load-more-btn" 
                    onClick={() => setPage(p => p + 1)}
                >
                    더 보기
                </button>
            )}

            {diaries.length === 0 && !isLoading && (
                <div className="empty-state">
                    <p>작성된 일기가 없습니다.</p>
                    <button 
                        className="create-btn"
                        onClick={() => navigate('/diary/create')}
                    >
                        첫 일기 작성하기
                    </button>
                </div>
            )}
        </div>
    );
};

export default DiaryList;
