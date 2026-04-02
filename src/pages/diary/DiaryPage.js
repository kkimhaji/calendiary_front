import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Calendar from 'react-calendar';
import axios from '../../api/axios';
import DiaryList from '../../components/diary/DiaryList';
import SearchBar from '../../components/post/SearchBar';
import { getFullImageUrl } from '../../utils/imageUtils';
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
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();

    // URL에서 검색 쿼리 읽기
    const queryParams = new URLSearchParams(location.search);
    const searchQuery = queryParams.get('q') || '';
    const searchType = queryParams.get('type') || 'BOTH';

    const isSameDate = (date1, date2) => {
        if (!date1 || !date2) return false;
        const d1 = date1 instanceof Date ? date1 : new Date(date1);
        const d2 = date2 instanceof Date ? date2 : new Date(date2);
        return d1.getFullYear() === d2.getFullYear() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getDate() === d2.getDate();
    };

    const formatDateToString = (date) => {
        if (!date) return '';
        const d = date instanceof Date ? date : new Date(date);
        return d.getFullYear() + '-' +
            String(d.getMonth() + 1).padStart(2, '0') + '-' +
            String(d.getDate()).padStart(2, '0');
    };

    useEffect(() => {
        if (viewMode === 'calendar') {
            fetchCalendarData();
        } else {
            setPage(0);
            fetchListData(true);
        }
    }, [currentDate, viewMode, searchQuery, searchType]);

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

            const params = { year, month };

            // 캘린더 뷰에서도 검색 지원
            if (searchQuery) {
                params.q = searchQuery;
                params.type = searchType;
            }

            const url = searchQuery ? '/diary/search' : '/diary/calendar';
            const response = await axios.get(url, { params });
            const rawData = response.data.content || response.data || [];

            const processedData = rawData.map(diary => ({
                ...diary,
                thumbnailImageUrl: getFullImageUrl(diary.thumbnailImageUrl)
            }));

            setCalendarData(processedData);
        } catch (error) {
            console.error('달력 데이터 로드 실패:', error);
            setCalendarData([]);
        } finally {
            setIsLoading(false);
        }
    };

    const getEffectiveDate = (diary) => {
        if (diary.diaryDate) {
            return diary.diaryDate;
        } else if (diary.createdDate) {
            return diary.createdDate.split('T')[0];
        }
        return null;
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

            // 검색 쿼리가 있으면 검색 API 호출
            let url;
            if (searchQuery) {
                url = '/diary/search';
                params.q = searchQuery;
                params.type = searchType;
            } else {
                url = '/diary/list/monthly';
            }

            const response = await axios.get(url, { params });

            const rawDiaries = Array.isArray(response.data)
                ? response.data
                : (response.data.content || []);

            // 서버에서 받은 데이터의 썸네일 URL 변환
            const processedDiaries = rawDiaries.map(diary => ({
                ...diary,
                thumbnailImageUrl: getFullImageUrl(diary.thumbnailImageUrl),
                imageUrls: diary.imageUrls?.map(url => getFullImageUrl(url))
            }));

            if (isReset) {
                setListData(processedDiaries);
                const grouped = groupDiariesByDate(processedDiaries);
                setGroupedListData(grouped);
            } else {
                const updatedDiaries = [...listData, ...processedDiaries];
                setListData(updatedDiaries);
                const grouped = groupDiariesByDate(updatedDiaries);
                setGroupedListData(grouped);
            }

            if (Array.isArray(response.data)) {
                setHasMore(processedDiaries.length === 20);
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
        if (!diaries || diaries.length === 0) {
            return {};
        }

        const grouped = {};

        diaries.forEach(diary => {
            const dateKey = getEffectiveDate(diary);

            if (!dateKey) {
                console.warn('일기에 날짜 정보가 없습니다:', diary);
                return;
            }

            if (!grouped[dateKey]) {
                grouped[dateKey] = [];
            }
            grouped[dateKey].push(diary);
        });

        const sortedKeys = Object.keys(grouped).sort((a, b) => b.localeCompare(a));
        const sortedGrouped = {};
        sortedKeys.forEach(key => {
            sortedGrouped[key] = grouped[key];
        });

        return sortedGrouped;
    };

    const handleDateClick = (clickedDate) => {
        const dayDiaries = calendarData.filter(diary => {
            const isMatch = isSameDate(clickedDate, diary.diaryDate);
            return isMatch;
        });

        if (dayDiaries.length === 1) {
            navigate(`/diary/${dayDiaries[0].diaryId}`);
        } else if (dayDiaries.length > 1) {
            setSelectedDate(formatDateToString(clickedDate));
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
        setPage(0);

        // 검색 상태 초기화 (검색어 제거)
        if (searchQuery) {
            navigate('/diary');
        }
    };

    const handleDiaryClick = (diary) => {
        const diaryId = diary.diaryId || diary.id;
        navigate(`/diary/${diaryId}`);
    };

    const handleLoadMore = () => {
        setPage(prev => prev + 1);
    };

    const renderTileContent = ({ date, view }) => {
        if (view !== 'month') return null;

        const dayDiaries = calendarData.filter(diary => isSameDate(date, diary.diaryDate));

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
        const hasDiary = calendarData.some(diary => isSameDate(date, diary.diaryDate));
        return hasDiary ? 'has-diary' : null;
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

    const getCurrentYearMonthText = () => {
        return `${currentDate.getFullYear()}년 ${currentDate.getMonth() + 1}월`;
    };

    const handleMonthChange = (delta) => {
        const newDate = new Date(currentDate);
        newDate.setMonth(newDate.getMonth() + delta);
        setCurrentDate(newDate);
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

            <SearchBar />

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
                                showDate={true}
                                isEmbedded={true}
                            />
                        </div>
                    )}
                </div>
            ) : (
                <div className="list-container">
                    <div className="list-month-controls">
                        <button
                            className="month-nav-btn"
                            onClick={() => handleMonthChange(-1)}
                            aria-label="이전 달"
                        >
                            ◀
                        </button>
                        <span className="list-current-ym">{getCurrentYearMonthText()}</span>
                        <button
                            className="month-nav-btn"
                            onClick={() => handleMonthChange(1)}
                            aria-label="다음 달"
                        >
                            ▶
                        </button>
                    </div>

                    {isLoading && <div className="loading">로딩 중...</div>}

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
