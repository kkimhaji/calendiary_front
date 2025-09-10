import React from 'react';
import './ContentCard.css';

const ContentCard = ({ 
    title, 
    author, 
    date, 
    children, 
    onClick, 
    className = "" 
}) => {
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick && onClick();
        }
    };

    return (
        <div 
            className={`content-card ${className}`} 
            onClick={onClick}
            onKeyDown={handleKeyDown}
            role="button"
            tabIndex={0}
            aria-label={`${title} - ${author} 작성`}
        >
            <div className="content-header">
                <h3 className="content-title">{title}</h3>
            </div>
            <div className="content-body">
                {children}
            </div>
            <div className="content-meta">
                <span className="content-author">{author}</span>
                <span className="content-date">
                    {new Date(date).toLocaleDateString('ko-KR')}
                </span>
            </div>
        </div>
    );
};

export default ContentCard;
