import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import { useNavigate, useParams } from 'react-router-dom';
import RichTextEditor from './post/RichTextEditor';
import CategorySelector from './CategorySelector';
import VisibilitySelector from './diary/VisibilitySelector';
import { useContentEditor } from '../hooks/useContentEditor';
import './ContentEditor.css';

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
    const [isLoadingContent, setIsLoadingContent] = useState(false); // 데이터 로딩 상태

    const { teamId, categoryId, postId, diaryId } = useParams();
    const navigate = useNavigate();
    const isEdit = !!(postId || diaryId);
    const contentId = postId || diaryId;

    const handleSubmitSuccess = (responseData) => {
        console.log('작성/수정 성공:', responseData);
        
        // 성공 메시지 표시 (선택사항)
        const action = isEdit ? '수정' : '작성';
        alert(`${contentType === 'post' ? '게시글' : '일기'} ${action}이 완료되었습니다.`);
        
        // 목록 페이지로 이동
        if (contentType === 'post') {
            // 게시글의 경우: 해당 카테고리의 최근 게시글 페이지로 이동
            navigate(`/teams/${teamId}/category/${categoryId}/recent`);
        } else if (contentType === 'diary') {
            // 일기의 경우: 일기 목록 페이지로 이동
            navigate('/diary/list');
        }
    };

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
        categoryId,
        onSubmitSuccess: handleSubmitSuccess 
    });

    useEffect(() => {
        if (!isEdit || !contentId) return;

        const fetchContentData = async () => {
            try {
                setIsLoadingContent(true);
                console.log('기존 콘텐츠 데이터 로드 시작:', { teamId, categoryId, contentId });
                
                // API 엔드포인트를 통해 데이터 조회
                let url;
                if (contentType === 'diary') {
                    url = apiEndpoints.fetch(contentId);
                } else {
                    url = apiEndpoints.fetch(teamId, categoryId, contentId);
                }
                const response = await axios.get(url);
                
                console.log('콘텐츠 데이터 로드 성공:', response.data);
                
                // 받아온 데이터로 상태 업데이트
                if (response.data) {
                    setTitle(response.data.title || '');
                    setContent(response.data.content || '');
                    
                    // 게시글의 경우 카테고리 정보 설정
                    if (contentType === 'post' && response.data.categoryId) {
                        setSelectedCategory(response.data.categoryId);
                    }
                    
                    // 일기의 경우 공개/비공개 설정
                    if (contentType === 'diary' && response.data.visibility) {
                        setVisibility(response.data.visibility);
                    }
                }
            } catch (error) {
                console.error('콘텐츠 데이터 로드 실패:', error);
                if (error.response?.status === 404) {
                    alert('해당 콘텐츠를 찾을 수 없습니다.');
                    navigate(-1);
                } else if (error.response?.status === 403) {
                    alert('수정 권한이 없습니다.');
                    navigate(-1);
                } else {
                    alert('데이터를 불러오는데 실패했습니다.');
                }
            } finally {
                setIsLoadingContent(false);
            }
        };

        fetchContentData();
    }, [isEdit, contentId, teamId, categoryId, apiEndpoints, contentType, navigate]);

    // 로딩 중일 때 표시
    if (isLoadingContent) {
        return (
            <div className="content-editor-container">
                <div className="loading">
                    <h3>데이터를 불러오는 중...</h3>
                    <p>잠시만 기다려 주세요.</p>
                </div>
            </div>
        );
    }

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
                <div className="content-form-group">
                    <input
                        type="text"
                        placeholder="제목을 입력하세요"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="title-input"
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
                <div className="content-form-group">
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
                    <button type="submit" disabled={isLoading}
                                            className="submit-button"
>
                        {isEdit ? '수정하기' : '작성하기'}
                    </button>
                    <button type="button" 
                        className="cancel-button"
                        onClick={() => navigate(-1)}>
                        취소
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ContentEditor;