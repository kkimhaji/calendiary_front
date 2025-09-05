import React from 'react';
import ContentCard from '../common/ContentCard';
import './DiaryItem.css';

const DiaryItem = ({ diary, onClick, highlight }) => {
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

    return (
        <ContentCard
            title={highlight ? highlightText(diary.title) : diary.title}
            author={diary.authorNickname}
            date={diary.createdDate}
            onClick={handleClick}
            className="diary-item"
        >
            <div className="diary-content">
                {diary.thumbnailImageUrl && (
                    <img 
                        src={diary.thumbnailImageUrl} 
                        alt="썸네일"
                        className="diary-thumbnail"
                    />
                )}
                <div className="diary-info">
                    <span className={`visibility ${diary.visibility.toLowerCase()}`}>
                        {diary.visibility === 'PUBLIC' ? '🌍 공개' : '🔒 비공개'}
                    </span>
                    {diary.imageUrls && diary.imageUrls.length > 0 && (
                        <span className="image-count">
                            📷 {diary.imageUrls.length}
                        </span>
                    )}
                </div>
            </div>
        </ContentCard>
    );
};

export default DiaryItem;