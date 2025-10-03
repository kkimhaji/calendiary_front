import { useState } from 'react';
import axios from '../api/axios';
import { useNavigate } from 'react-router-dom';

export const useContentEditor = ({
    contentType,
    apiEndpoints,
    isEdit,
    contentId,
    teamId,
    categoryId
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleImageUpload = async (file) => {
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('domain', contentType.toUpperCase());

            const response = await axios.post('/images/temp-upload', formData, {
                headers: { 
                    'Content-Type': 'multipart/form-data'
                }
            });

            return response.data; // 임시 URL 직접 반환

        } catch (error) {
            console.error('handleImageUpload - 업로드 실패:', {
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                message: error.message
            });
            
            const errorMessage = error.response?.data?.message || 
                               error.response?.statusText ||
                               '이미지 업로드에 실패했습니다.';
            
            alert(`이미지 업로드 실패: ${errorMessage}`);
            throw new Error(errorMessage);
        }
    };

    const handleSubmit = async (e, formData) => {
        e.preventDefault();
        try {
            setIsLoading(true);
            setError('');

            const submitData = {
                title: formData.title,
                content: formData.content
            };

            // 일기의 경우 visibility, date 추가
            if (contentType === 'diary') {
                submitData.visibility = formData.visibility;
                if (formData.diaryDate) {
                    submitData.diaryDate = formData.diaryDate;
                }
            }

            // 게시글의 경우 categoryId 추가 (작성시에만)
            if (contentType === 'post') {
                submitData.categoryId = formData.selectedCategory;
            }

            let url;
            let method;

            if (isEdit) {
                method = 'PUT';
                if (contentType === 'diary') {
                    url = apiEndpoints.update(contentId);
                } else {
                    const targetCategoryId = formData.selectedCategory || categoryId;
                    url = apiEndpoints.update(teamId, targetCategoryId, contentId);
                }
            } else {
                method = 'POST';
                if (contentType === 'diary') {
                    url = apiEndpoints.create();
                } else {
                    url = apiEndpoints.create(teamId, categoryId);
                }
            }
            const response = await axios({
                method,
                url,
                data: submitData
            });

            // 성공 후 리다이렉트
            if (contentType === 'diary') {
                navigate('/diary');
            } else {
                const targetCategoryId = formData.selectedCategory || categoryId;
                navigate(`/teams/${teamId}/category/${targetCategoryId}/recent`);
            }

        } catch (error) {
            console.error('handleSubmit - 제출 실패:', {
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                message: error.message
            });
            
            const errorMessage = error.response?.data?.message ||
                               error.response?.statusText ||
                               '저장에 실패했습니다.';
            setError(errorMessage);
            alert(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return {
        handleSubmit,
        handleImageUpload,
        isLoading,
        error
    };
};