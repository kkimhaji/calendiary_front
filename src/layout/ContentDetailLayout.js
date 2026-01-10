import React, {useMemo} from 'react';
import DOMPurify from 'dompurify';
import './ContentDetailLayout.css';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

const ContentDetailLayout = ({
    title,
    content,
    authorInfo,
    createdDate,
    diaryDate, // diaryDate 추가
    customDateInfo, 
    headerExtra, // 카테고리, 공개설정 등
    metaInfo, // 조회수 등 추가 정보
    permissions,
    onEdit,
    onDelete,
    onBack,
    commentsSection, // 댓글 컴포넌트
    additionalActions, // 추가 액션 버튼들
    className = "content-detail-container"
}) => {
    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleString('ko-KR');
    };

    const processedContent = useMemo(() => {
        if (!content) return '';

        // 1. DOMPurify로 XSS 방어
        const sanitized = DOMPurify.sanitize(content);

        // 2. 상대 경로를 전체 URL로 변환
        const withFullUrls = sanitized.replace(
            /<img([^>]*?)src="(\/[^"]+)"([^>]*?)>/gi,
            (match, before, src, after) => {
                // 이미 전체 URL이면 그대로, 상대 경로면 전체 URL로 변환
                const fullUrl = src.startsWith('http') ? src : `${API_BASE_URL}${src}`;
                return `<img${before}src="${fullUrl}"${after}>`;
            }
        );

        return withFullUrls;
    }, [content]);

    return (
        <div className={className}>
            <div className="content-detail-wrapper">
                {/* 헤더 섹션 */}
                <div className="content-header">
                    {headerExtra && (
                        <div className="header-extra">{headerExtra}</div>
                    )}
                    <h1 className="content-title">{title}</h1>
                    {permissions?.canEdit && (
                        <button
                            className="btn btn-primary"
                            onClick={onEdit}
                        >
                            수정
                        </button>
                    )}
                </div>

                {/* 메타 정보 */}
                <div className="content-meta">
                    <span className="author-info">{authorInfo}</span>
                                          
                    {/* customDateInfo가 있으면 우선 사용 */}
                    {customDateInfo ? (
                        customDateInfo
                    ) : (
                        <div className="date-info">
                            {/* diaryDate가 있으면 구분해서 표시 */}
                            {diaryDate && diaryDate !== createdDate ? (
                                <>
                                    <span className="diary-date">
                                        📅 {formatDate(diaryDate)} 일기
                                    </span>
                                    <span className="created-date">
                                        ✏️ 작성: {formatDateTime(createdDate)}
                                    </span>
                                </>
                            ) : (
                                <span className="created-date">
                                    작성일: {formatDate(createdDate)}
                                </span>
                            )}
                        </div>
                    )}
                    
                    {metaInfo && <span className="meta-extra">{metaInfo}</span>}
                </div>

                <hr/>
                {/* 본문 내용 */}
                <div 
                    className="content-body" 
                    dangerouslySetInnerHTML={{
                        __html: processedContent
                    }}
                />

                <hr />

                {/* 댓글 섹션 */}
                {commentsSection && (
                    <div className="comments-section">
                        {commentsSection}
                    </div>
                )}

                {/* 액션 버튼들 */}
                <div className="action-buttons">
                    <button
                        className="btn btn-default"
                        onClick={onBack || (() => window.history.back())}
                    >
                        목록으로
                    </button>
                    
                    <div className="button-spacer" />
                    
                    {additionalActions}
                    
                    {permissions?.canDelete && (
                        <button
                            className="btn btn-danger"
                            onClick={onDelete}
                        >
                            삭제
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ContentDetailLayout;