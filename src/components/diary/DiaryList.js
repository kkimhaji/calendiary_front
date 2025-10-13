import React, { useEffect, useState } from 'react';
import axios from '../../api/axios';
import DiaryItem from './DiaryItem';
import { useNavigate } from 'react-router-dom';
import './DiaryList.css';

const DiaryList = ({ 
    // Props로 데이터를 받는 경우 (DiaryPage에서 사용)
    diaries: propDiaries,
    onDiaryClick: propOnDiaryClick,
    onClose,
    showDate = true,
    isEmbedded = false,
    highlight,
    
    // 독립 컴포넌트로 사용하는 경우 (기존 방식)
    viewMode = 'list'
}) => {
    const [diaries, setDiaries] = useState([]);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    // Props로 데이터를 받는 경우와 독립적으로 동작하는 경우 구분
    const isPropsMode = propDiaries !== undefined;
    const displayDiaries = isPropsMode ? propDiaries : diaries;
    const onDiaryClick = propOnDiaryClick || handleDiaryClick;

    // 독립 모드일 때만 데이터 fetch
    useEffect(() => {
        if (!isPropsMode) {
            setPage(0);
            fetchDiaries();
        }
    }, [isPropsMode]);

    useEffect(() => {
        if (!isPropsMode && page > 0) {
            fetchDiaries();
        }
    }, [page, isPropsMode]);

    const fetchDiaries = async () => {
        if (isPropsMode) return;
        
        setIsLoading(true);
        try {
            const params = { 
                page, 
                size: 20, 
                sort: 'createdDate,desc' 
            };

            const response = await axios.get('/diary', { params });
            const newDiaries = response.data.content || [];

            setDiaries(prev => page === 0 ? newDiaries : [...prev, ...newDiaries]);
            setHasMore(!response.data.last);
        } catch (error) {
            console.error('일기 목록 조회 실패:', error);
            setDiaries([]);
            setHasMore(false);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDiaryClick = (diary) => {
        navigate(`/diary/${diary.diaryId || diary.id}`);
    };

    const handleLoadMore = () => {
        setPage(p => p + 1);
    };

    // 빈 상태 렌더링
    if (displayDiaries.length === 0 && !isLoading) {
        if (isEmbedded) {
            return (
                <div className="diary-list-empty embedded">
                    <p>일기가 없습니다.</p>
                </div>
            );
        }
        
        return (
            <div className="empty-state">
                <p>작성된 일기가 없습니다.</p>
                <button 
                    className="create-btn"
                    onClick={() => navigate('/diary/create')}
                >
                    첫 일기 작성하기
                </button>
            </div>
        );
    }

    return (
        <div className={`diary-list-container ${isEmbedded ? 'embedded' : ''}`}>
            {/* 닫기 버튼 */}
            {onClose && (
                <button className="close-button" onClick={onClose}>
                    X
                </button>
            )}
            
            {/* 일기 아이템들 */}
            <div className={`diary-grid ${viewMode} ${isEmbedded ? 'embedded' : ''}`}>
                {displayDiaries.map(diary => (
                    <DiaryItem
                        key={diary.diaryId || diary.id}
                        diary={diary}
                        onClick={onDiaryClick}
                        highlight={highlight}
                        showDate={showDate}
                        isEmbedded={isEmbedded}
                    />
                ))}
            </div>

            {/* 로딩 표시 */}
            {isLoading && (
                <div className="loading">로딩 중...</div>
            )}

            {/* 더보기 버튼 (독립 모드일 때만) */}
            {!isPropsMode && hasMore && !isLoading && (
                <button 
                    className="load-more-btn" 
                    onClick={handleLoadMore}
                >
                    더 보기
                </button>
            )}
        </div>
    );
};

export default DiaryList;