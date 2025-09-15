import React from 'react';
import ContentCard from '../common/ContentCard';
import './DiaryItem.css';

const DiaryItem = ({
    diary,
    onClick,
    highlight,
    showDate = true,
    isEmbedded = false
}) => {
    const highlightText = (text) => {
        if (!highlight) return text;
        const regex = new RegExp(`(${highlight})`, 'gi');
        return text.split(regex).map((part, i) =>
            regex.test(part) ? <mark key={i}>{part}</mark> : part
        );
    };

    const handleClick = () => {
        onClick?.(diary);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'short'
        });
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('ko-KR', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // 내용에서 이미지 태그 제거하고 텍스트만 추출
    const getPlainTextContent = (htmlContent) => {
        if (!htmlContent) return '';
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlContent;
        return tempDiv.textContent || tempDiv.innerText || '';
    };

    // API 응답 구조에 따른 데이터 매핑
    const diaryData = {
        id: diary.diaryId || diary.id,
        title: diary.title,
        content: diary.content,
        createdDate: diary.createdDateTime || diary.createdDate,
        diaryDate: diary.diaryDate,
        authorNickname: diary.authorNickname || '나',
        visibility: diary.visibility || 'PRIVATE',
        thumbnailImageUrl: diary.thumbnailImageUrl,
        imageUrls: diary.imageUrls
    };

    const plainContent = getPlainTextContent(diaryData.content);
    const preview = plainContent.length > 100
        ? plainContent.substring(0, 100) + '...'
        : plainContent;

        console.log('DiaryItem 데이터:', diaryData);

    if (isEmbedded) {
        // 임베디드 모드: 간단한 형태로 표시
        return (
            <div className="diary-item embedded" onClick={handleClick}>
                <div className="diary-item-header">
                    <h3 className="diary-title">
                        {highlight ? highlightText(diaryData.title) : diaryData.title}
                    </h3>
                    <div className="diary-meta">
                        {showDate && diaryData.diaryDate && (
                            <span className="diary-date">
                                일기: {formatDate(diaryData.diaryDate)}
                            </span>
                        )}
                        <span className="diary-time">
                            {formatTime(diaryData.createdDate)}
                        </span>
                        <span className={`diary-visibility ${diaryData.visibility.toLowerCase()}`}>
                            {diaryData.visibility === 'PUBLIC' ? '🌍 공개' : '🔒 비공개'}
                        </span>
                    </div>
                </div>

                {preview && (
                    <div className="diary-preview">
                        {preview}
                    </div>
                )}

                {diaryData.thumbnailImageUrl && (
                    <div className="diary-thumbnail-wrapper">
                        <img
                            src={diaryData.thumbnailImageUrl}
                            alt="썸네일"
                            className="diary-thumbnail"
                        />
                    </div>
                )}
            </div>
        );
    }

    // 기존 ContentCard 사용 방식
    return (
        <ContentCard
            title={highlight ? highlightText(diaryData.title) : diaryData.title}
            author={diaryData.authorNickname}
            date={diaryData.createdDate}
            onClick={handleClick}
            className="diary-item"
            showDate={showDate}
        >
            <div className="diary-content">
                {diaryData.thumbnailImageUrl && (
                    <img
                        src={diaryData.thumbnailImageUrl}
                        alt="썸네일"
                        className="diary-thumbnail"
                    />
                )}
                <div className="diary-info">
                    <span className={`visibility ${diaryData.visibility.toLowerCase()}`}>
                        {diaryData.visibility === 'PUBLIC' ? '🌍 공개' : '🔒 비공개'}
                    </span>
                    {diaryData.imageUrls && diaryData.imageUrls.length > 0 && (
                        <span className="image-count">
                            📷 {diaryData.imageUrls.length}
                        </span>
                    )}
                </div>
                {preview && (
                    <div className="diary-preview">
                        {highlight ? highlightText(preview) : preview}
                    </div>
                )}
            </div>
        </ContentCard>
    );
};

export default DiaryItem;