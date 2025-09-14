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
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post('/images/temp-upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                params: { domain: contentType.toUpperCase() }
            });
            return { default: response.data };
        } catch (error) {
            console.error('이미지 업로드 실패:', error);
            throw new Error('이미지 업로드에 실패했습니다.');
        }
    };

    const handleSubmit = async (e, formData) => {
        e.preventDefault();
        try {
            setIsLoading(true);

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
            if (contentType === 'post' && !isEdit) {
                submitData.categoryId = formData.selectedCategory;
            }

            let url;
            let method;

            if (isEdit) {
                method = 'PUT';
                if (contentType === 'diary') {
                    url = apiEndpoints.update(contentId);
                } else {
                    url = apiEndpoints.update(teamId, categoryId, contentId);
                }
            } else {
                method = 'POST';
                if (contentType === 'diary') {
                    url = apiEndpoints.create();
                } else {
                    url = apiEndpoints.create(teamId, categoryId);
                }
            }

            await axios({
                method,
                url,
                data: submitData
            });

            // 성공 후 리다이렉트
            if (contentType === 'diary') {
                navigate('/diary');
            } else {
                navigate(`/teams/${teamId}/category/${categoryId}/recent`);
            }

        } catch (error) {
            console.error('제출 실패:', error);
            setError('저장에 실패했습니다.');
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