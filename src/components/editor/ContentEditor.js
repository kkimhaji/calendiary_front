import React, { useState, useEffect } from 'react';
import axios from '../../api/axios';
import { useNavigate, useParams } from 'react-router-dom';
import RichTextEditor from './RichTextEditor';
import CategorySelector from '../category/CategorySelector';
import VisibilitySelector from '../diary/VisibilitySelector';
import { useContentEditor } from '../../hooks/useContentEditor';
import './ContentEditor.css';
import DatePicker from '../diary/DatePicker';
import { convertRelativeImageUrls } from '../../utils/imageUtils';

const ContentEditor = ({
    initialTitle = '',
    initialContent = '',
    initialVisibility,
    initialCategory,
    contentType, // 'post' | 'diary'
    apiEndpoints,
    showCategory = true,
    showVisibility = false,
    additionalFields = []
}) => {
    const [title, setTitle] = useState(initialTitle);
    const [content, setContent] = useState(() => {
        return convertRelativeImageUrls(initialContent) || '';
    });
    const [visibility, setVisibility] = useState(initialVisibility || 'PUBLIC');
    const [isLoadingContent, setIsLoadingContent] = useState(false);
    const [diaryDate, setDiaryDate] = useState('');
    const [hasEditPermission, setHasEditPermission] = useState(null); // 권한 상태 추가

    const { teamId, categoryId, postId, diaryId } = useParams();
    const [selectedCategory, setSelectedCategory] = useState(initialCategory || categoryId);
    const navigate = useNavigate();
    const isEdit = !!(postId || diaryId);
    const contentId = postId || diaryId;

    useEffect(() => {
        if (contentType === 'post' && categoryId && !selectedCategory) {
            setSelectedCategory(parseInt(categoryId));
        }
    }, [contentType, categoryId, selectedCategory]);

    useEffect(() => {
        if (contentType === 'diary' && !isEdit && !diaryDate) {
            const today = new Date().toISOString().split('T')[0];
            setDiaryDate(today);
        }
    }, [contentType, isEdit, diaryDate]);

    const handleSubmitSuccess = (responseData) => {
        const action = isEdit ? '수정' : '작성';
        alert(`${contentType === 'post' ? '게시글' : '일기'} ${action}이 완료되었습니다.`);

        if (contentType === 'post') {
            const finalCategoryId = selectedCategory || categoryId;
            navigate(`/teams/${teamId}/category/${finalCategoryId}/recent`);
        } else if (contentType === 'diary') {
            navigate('/diary');
        }
    };

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
        categoryId: selectedCategory,
        onSubmitSuccess: handleSubmitSuccess
    });

    useEffect(() => {
        if (initialContent) {
            const processed = convertRelativeImageUrls(initialContent);
            setContent(processed);
        }
    }, [initialContent]);


    // 권한 확인 함수 추가
    const checkEditPermission = async () => {
        if (!isEdit) return true; // 새 글 작성은 권한 확인 불필요

        try {
            if (contentType === 'post') {
                const response = await axios.get(`/edit-delete-check/post`, {
                    params: { postId: contentId }
                });
                return response.data.canEdit;
            } else if (contentType === 'diary') {
                const response = await axios.get(`/diary/${diaryId}/check`);
                return response.data;
            }
        } catch (error) {
            console.error('권한 확인 실패:', error);
            return false;
        }
    };

    useEffect(() => {
        // 새 글 작성 모드면 권한을 true로 설정
        if (!isEdit) {
            setHasEditPermission(true);
            return;
        }

        if (!isEdit || !contentId) return;

        const fetchContentData = async () => {
            try {
                setIsLoadingContent(true);

                // 1. 권한 확인 먼저 수행
                const hasPermission = await checkEditPermission();

                if (!hasPermission) {
                    alert(`${contentType === 'post' ? '게시글' : '일기'} 수정 권한이 없습니다.`);
                    navigate(-1);
                    return;
                }

                setHasEditPermission(true);

                // 2. 데이터 조회
                let url;
                if (contentType === 'diary') {
                    url = apiEndpoints.fetch(contentId);
                } else {
                    const finalCategoryId = selectedCategory || categoryId;
                    url = apiEndpoints.fetch(teamId, finalCategoryId, contentId);
                }

                const response = await axios.get(url);

                if (response.data) {
                    setTitle(response.data.title || '');
                    setContent(response.data.content || '');

                    if (contentType === 'post' && response.data.categoryId) {
                        setSelectedCategory(response.data.categoryId);
                    }

                    if (contentType === 'diary') {
                        if (response.data.visibility) {
                            setVisibility(response.data.visibility);
                        }
                        if (response.data.diaryDate) {
                            setDiaryDate(response.data.diaryDate);
                        }
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
                    navigate(-1);
                }
            } finally {
                setIsLoadingContent(false);
            }
        };

        fetchContentData();
    }, [isEdit, contentId, teamId, categoryId, apiEndpoints, contentType, navigate]);

    // 권한 없으면 아무것도 렌더링하지 않음
    if (isEdit && !hasEditPermission) {
        return null;
    }

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
                title, content, selectedCategory, visibility, diaryDate
            })}>
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

                {contentType === 'diary' && (
                    <div className="content-form-group">
                        <DatePicker
                            selectedDate={diaryDate}
                            onDateChange={setDiaryDate}
                            label="일기 날짜"
                        />
                    </div>
                )}

                {showCategory && (
                    <CategorySelector
                        teamId={teamId}
                        selectedCategory={selectedCategory}
                        onCategorySelect={setSelectedCategory}
                    />
                )}

                {showVisibility && (
                    <VisibilitySelector
                        visibility={visibility}
                        onChange={setVisibility}
                    />
                )}

                <div className="content-form-group">
                    <RichTextEditor
                        initialValue={content}
                        onChange={setContent}
                        onImageUpload={handleImageUpload}
                        domain={contentType.toUpperCase()}
                    />
                </div>

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
