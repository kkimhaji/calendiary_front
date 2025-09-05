import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import RichTextEditor from './post/RichTextEditor';
import CategorySelector from './CategorySelector';
import VisibilitySelector from './diary/VisibilitySelector';
import { useContentEditor } from '../hooks/useContentEditor';

const ContentEditor = ({ 
    contentType, // 'post' | 'diary'
    apiEndpoints,
    showCategory = true,
    showVisibility = false,
    additionalFields = []
}) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [visibility, setVisibility] = useState('PUBLIC');
    
    const { teamId, categoryId, postId, diaryId } = useParams();
    const navigate = useNavigate();
    const isEdit = !!(postId || diaryId);
    const contentId = postId || diaryId;

    // 커스텀 훅으로 로직 분리
    const {
        handleSubmit,
        handleImageUpload,
        isLoading,
        error
    } = useContentEditor({
        contentType,
        apiEndpoints,
        isEdit,
        contentId,
        teamId,
        categoryId
    });

    return (
        <div className="content-editor-container">
            <h2>
                {isEdit ? 
                    `${contentType === 'post' ? '게시글' : '일기'} 수정` : 
                    `${contentType === 'post' ? '게시글' : '일기'} 작성`
                }
            </h2>
            
            <form onSubmit={(e) => handleSubmit(e, { 
                title, content, selectedCategory, visibility 
            })}>
                {/* 제목 입력 */}
                <div className="form-group">
                    <input
                        type="text"
                        placeholder="제목을 입력하세요"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                </div>

                {/* 카테고리 선택 (게시글에만 표시) */}
                {showCategory && !isEdit && (
                    <CategorySelector
                        teamId={teamId}
                        selectedCategory={selectedCategory}
                        onCategorySelect={setSelectedCategory}
                    />
                )}

                {/* 공개/비공개 설정 (일기에만 표시) */}
                {showVisibility && (
                    <VisibilitySelector
                        visibility={visibility}
                        onChange={setVisibility}
                    />
                )}

                {/* 본문 에디터 */}
                <div className="form-group">
                    <RichTextEditor
                        initialValue={content}
                        onChange={setContent}
                        onImageUpload={handleImageUpload}
                        domain={contentType.toUpperCase()}
                    />
                </div>

                {/* 추가 필드들 (필요시) */}
                {additionalFields.map(field => (
                    <div key={field.name} className="form-group">
                        {field.component}
                    </div>
                ))}

                <div className="button-group">
                    <button type="submit" disabled={isLoading}>
                        {isEdit ? '수정하기' : '작성하기'}
                    </button>
                    <button type="button" onClick={() => navigate(-1)}>
                        취소
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ContentEditor;
