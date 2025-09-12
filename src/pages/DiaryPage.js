import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Calendar from 'react-calendar';
import axios from '../api/axios';
import DiaryList from '../components/diary/DiaryList';
import SearchBar from '../components/post/SearchBar';
import './DiaryPage.css';
import 'react-calendar/dist/Calendar.css';

const DiaryPage = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [calendarData, setCalendarData] = useState([]);
    const [listData, setListData] = useState([]);
    const [groupedListData, setGroupedListData] = useState({});
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedDiaries, setSelectedDiaries] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [viewMode, setViewMode] = useState('calendar');
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const navigate = useNavigate();

    // 달력 데이터와 리스트 데이터 로드
    useEffect(() => {
        if (viewMode === 'calendar') {
            fetchCalendarData();
        } else {
            setPage(0);
            fetchListData(true); // 초기 로드
        }
    }, [currentDate, viewMode]);

    // 검색어 변경 시
    useEffect(() => {
        if (viewMode === 'list') {
            setPage(0);
            fetchListData(true);
        }
    }, [searchQuery]);

    // 페이지 변경 시
    useEffect(() => {
        if (page > 0 && viewMode === 'list') {
            fetchListData(false);
        }
    }, [page]);

    const fetchCalendarData = async () => {
        setIsLoading(true);
        try {
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth() + 1;
            
            const response = await axios.get(`/diary/calendar`, {
                params: { year, month }
            });
            
            setCalendarData(response.data || []);
        } catch (error) {
            console.error('달력 데이터 로드 실패:', error);
            setCalendarData([]);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchListData = async (isReset = false) => {
        setIsLoading(true);
        try {
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth() + 1;
            
            const params = { 
                year, 
                month, 
                page: isReset ? 0 : page, 
                size: 20,
                sort: 'createdDate,desc'
            };
            
            if (searchQuery) {
                params.q = searchQuery;
            }
            
            const response = await axios.get(`/diary/list/monthly`, { params });
            const newDiaries = Array.isArray(response.data) 
            ? response.data 
            : (response.data.content || []);
        
        if (isReset) {
            setListData(newDiaries);
            // 즉시 그룹화 처리
            const grouped = groupDiariesByDate(newDiaries);
            setGroupedListData(grouped);
        } else {
            const updatedDiaries = [...listData, ...newDiaries];
            setListData(updatedDiaries);
            const grouped = groupDiariesByDate(updatedDiaries);
            setGroupedListData(grouped);
        }
        
        // hasMore 처리 (배열 응답의 경우)
        if (Array.isArray(response.data)) {
            setHasMore(newDiaries.length === 20); // size와 동일하면 더 있을 수 있음
        } else {
            setHasMore(!response.data.last);
        }
            
        } catch (error) {
            console.error('리스트 데이터 로드 실패:', error);
            setListData([]);
            setGroupedListData({});
            setHasMore(false);
        } finally {
            setIsLoading(false);
        }
    };

    const groupDiariesByDate = (diaries) => {
        const grouped = {};
        
        diaries.forEach(diary => {
            const dateKey = diary.createdDate.split('T')[0]; // YYYY-MM-DD 형식으로 추출
            
            if (!grouped[dateKey]) {
                grouped[dateKey] = [];
            }
            grouped[dateKey].push(diary);
        });
        
        // 날짜순으로 정렬 (최신순)
        const sortedKeys = Object.keys(grouped).sort((a, b) => b.localeCompare(a));
        const sortedGrouped = {};
        sortedKeys.forEach(key => {
            sortedGrouped[key] = grouped[key];
        });
        
        return sortedGrouped;
    };

    const handleDateClick = (date) => {
        const clickedDate = date.toISOString().split('T')[0];
        const dayDiaries = calendarData.filter(diary => 
            diary.createdDateTime.split('T')[0] === clickedDate
        );
        
        if (dayDiaries.length === 1) {
            navigate(`/diary/${dayDiaries[0].diaryId}`);
        } else if (dayDiaries.length > 1) {
            setSelectedDate(clickedDate);
            setSelectedDiaries(dayDiaries);
        } else {
            setSelectedDate(null);
            setSelectedDiaries([]);
        }
    };

    const handleViewModeChange = (newMode) => {
        setViewMode(newMode);
        setSelectedDate(null);
        setSelectedDiaries([]);
        setSearchQuery('');
        setPage(0);
    };

    const handleSearch = (query) => {
        setSearchQuery(query);
    };

    const handleDiaryClick = (diary) => {
        navigate(`/diary/${diary.id}`);
    };

    const handleLoadMore = () => {
        setPage(prev => prev + 1);
    };

    // 달력 타일 내용 렌더링
    const renderTileContent = ({ date, view }) => {
        if (view !== 'month') return null;
        
        const dateStr = date.toISOString().split('T')[0];
        const dayDiaries = calendarData.filter(diary => 
            diary.createdDateTime.split('T')[0] === dateStr
        );
        
        if (dayDiaries.length === 0) return null;
        
        const diary = dayDiaries[0];
        const hasMultiple = dayDiaries.length > 1;
        
        return (
            <div className="diary-tile-content">
                {diary.thumbnailImageUrl ? (
                    <img 
                        src={diary.thumbnailImageUrl} 
                        alt="일기 썸네일"
                        className="diary-thumbnail"
                    />
                ) : (
                    <div className="diary-placeholder">📔</div>
                )}
                {hasMultiple && (
                    <div className="multiple-indicator">+{dayDiaries.length - 1}</div>
                )}
            </div>
        );
    };

    const getTileClassName = ({ date, view }) => {
        if (view !== 'month') return null;
        
        const dateStr = date.toISOString().split('T')[0];
        const dayDiaries = calendarData.filter(diary => 
            diary.createdDateTime.split('T')[0] === dateStr
        );
        
        return dayDiaries.length > 0 ? 'has-diary' : null;
    };

    const formatDateLabel = (dateString) => {
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        const isToday = date.toDateString() === today.toDateString();
        const isYesterday = date.toDateString() === yesterday.toDateString();
        
        if (isToday) {
            return '오늘';
        } else if (isYesterday) {
            return '어제';
        } else {
            return date.toLocaleDateString('ko-KR', {
                month: 'long',
                day: 'numeric',
                weekday: 'short'
            });
        }
    };

    return (
        <div className="diary-page">
            <div className="diary-header">
                <h1>내 일기</h1>
                <div className="view-controls">
                    <button 
                        className={`view-btn ${viewMode === 'calendar' ? 'active' : ''}`}
                        onClick={() => handleViewModeChange('calendar')}
                    >
                        📅 달력
                    </button>
                    <button 
                        className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                        onClick={() => handleViewModeChange('list')}
                    >
                        📄 목록
                    </button>
                    <button 
                        className="create-btn"
                        onClick={() => navigate('/diary/create')}
                    >
                        ✏️ 일기 쓰기
                    </button>
                </div>
            </div>

            {viewMode === 'calendar' ? (
                <div className="calendar-container">
                    <Calendar
                        onClickDay={handleDateClick}
                        value={currentDate}
                        onActiveStartDateChange={({ activeStartDate }) => 
                            setCurrentDate(activeStartDate)
                        }
                        tileContent={renderTileContent}
                        tileClassName={getTileClassName}
                        locale="ko-KR"
                        formatDay={(locale, date) => date.getDate().toString()}
                        showNeighboringMonth={false}
                    />
                    
                    {/* 선택된 날짜의 일기 목록 */}
                    {selectedDate && selectedDiaries.length > 0 && (
                        <div className="selected-date-diaries">
                            <h3>{selectedDate} 일기 목록</h3>
                            <DiaryList 
                                diaries={selectedDiaries}
                                onDiaryClick={handleDiaryClick}
                                onClose={() => {
                                    setSelectedDate(null);
                                    setSelectedDiaries([]);
                                }}
                                showDate={false}
                                isEmbedded={true}
                            />
                        </div>
                    )}
                </div>
            ) : (
                <div className="list-container">
                    {/* 검색바 */}
                    <SearchBar 
                        onSearch={handleSearch} 
                        placeholder="일기 검색..." 
                    />
                    {isLoading && <div className="loading">로딩 중...</div>}
                    
                    {/* 날짜별 그룹 리스트 */}
                    <div className="diary-list-wrapper">
                        {!isLoading && Object.keys(groupedListData).length === 0 ? (
                            <div className="empty-list">
                                {searchQuery ? '검색 결과가 없습니다.' : '이번 달에 작성된 일기가 없습니다.'}
                                <button 
                                    className="create-btn-inline"
                                    onClick={() => navigate('/diary/create')}
                                >
                                    첫 일기 작성하기
                                </button>
                            </div>
                        ) : (
                            Object.entries(groupedListData).map(([date, diaries]) => (
                                <div key={date} className="date-group">
                                    <div className="date-separator">
                                        <div className="date-label">
                                            {formatDateLabel(date)}
                                        </div>
                                        <div className="date-line"></div>
                                    </div>
                                    <div className="date-diaries">
                                        <DiaryList 
                                            diaries={diaries}
                                            onDiaryClick={handleDiaryClick}
                                            showDate={false}
                                            isEmbedded={true}
                                            highlight={searchQuery}
                                        />
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    
                    {hasMore && !isLoading && listData.length > 0 && (
                        <button 
                            className="load-more-btn" 
                            onClick={handleLoadMore}
                        >
                            더 보기
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default DiaryPage;
