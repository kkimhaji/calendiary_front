import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Calendar from 'react-calendar';
import axios from '../api/axios';
import DiaryList from '../components/diary/DiaryList';
import './DiaryPage.css';
import 'react-calendar/dist/Calendar.css';

const DiaryPage = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [calendarData, setCalendarData] = useState([]);
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedDiaries, setSelectedDiaries] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [viewMode, setViewMode] = useState('calendar'); // 'calendar' | 'list'
    const navigate = useNavigate();

    // 달력 데이터 로드
    useEffect(() => {
        fetchCalendarData();
    }, [currentDate]);

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

    // 날짜 클릭 핸들러
    const handleDateClick = (date) => {
        const clickedDate = date.toISOString().split('T')[0];
        const dayDiaries = calendarData.filter(diary => 
            diary.createdDateTime.split('T')[0] === clickedDate
        );

        if (dayDiaries.length === 1) {
            // 일기가 1개면 바로 상세 페이지로 이동
            navigate(`/diary/${dayDiaries[0].diaryId}`);
        } else if (dayDiaries.length > 1) {
            // 여러 개면 리스트 표시
            setSelectedDate(clickedDate);
            setSelectedDiaries(dayDiaries);
        } else {
            // 일기가 없으면 작성 페이지로 이동 (선택사항)
            setSelectedDate(null);
            setSelectedDiaries([]);
        }
    };

    // 달력 타일 내용 렌더링
    const renderTileContent = ({ date, view }) => {
        if (view !== 'month') return null;
        
        const dateStr = date.toISOString().split('T')[0];
        const dayDiaries = calendarData.filter(diary => 
            diary.createdDateTime.split('T')[0] === dateStr
        );

        if (dayDiaries.length === 0) return null;

        const diary = dayDiaries[0]; // 첫 번째 일기의 썸네일만 표시
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

    // 달력 타일 클래스명
    const getTileClassName = ({ date, view }) => {
        if (view !== 'month') return null;
        
        const dateStr = date.toISOString().split('T')[0];
        const dayDiaries = calendarData.filter(diary => 
            diary.createdDateTime.split('T')[0] === dateStr
        );

        if (dayDiaries.length > 0) {
            return 'has-diary';
        }
        return null;
    };

    return (
        <div className="diary-page">
            <div className="diary-header">
                <h1>내 일기</h1>
                <div className="view-controls">
                    <button 
                        className={`view-btn ${viewMode === 'calendar' ? 'active' : ''}`}
                        onClick={() => setViewMode('calendar')}
                        disabled={viewMode === 'calendar'}
                    >
                        📅 달력
                    </button>
                    <button 
                        className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                        onClick={() => setViewMode('list')}
                        disabled={viewMode === 'list'}
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

            {isLoading && <div className="loading">로딩 중...</div>}

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
                                onDiaryClick={(diaryId) => navigate(`/diary/${diaryId}`)}
                                onClose={() => {
                                    setSelectedDate(null);
                                    setSelectedDiaries([]);
                                }}
                            />
                        </div>
                    )}
                </div>
            ) : (
                <div className="list-container">
                    <DiaryList 
                        diaries={calendarData}
                        onDiaryClick={(diaryId) => navigate(`/diary/${diaryId}`)}
                        showDate={true}
                    />
                </div>
            )}
        </div>
    );
};

export default DiaryPage;
