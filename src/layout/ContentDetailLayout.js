import React from 'react';
import DOMPurify from 'dompurify';
import './ContentDetailLayout.css';

const ContentDetailLayout = ({
    title,
    content,
    authorInfo,
    createdDate,
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
                    <span className="created-date">
                        작성일: {new Date(createdDate).toLocaleDateString()}
                    </span>
                    {metaInfo && <span className="meta-extra">{metaInfo}</span>}
                </div>

                {/* 본문 내용 */}
                <div 
                    className="content-body" 
                    dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(content)
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