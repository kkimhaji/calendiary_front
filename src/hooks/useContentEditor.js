// useContentEditor.js
import { useState } from 'react';
import axios from '../api/axios';

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

    const handleSubmit = async (e, data) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const payload = {
                title: data.title,
                content: data.content,
                ...(data.selectedCategory && { categoryId: data.selectedCategory }),
                ...(data.visibility && { visibility: data.visibility })
            };

            if (isEdit) {
                const updateUrl = apiEndpoints.update(teamId, categoryId, contentId);
                await axios.put(updateUrl, payload, {
                    headers: { 'Content-Type': 'application/json' }
                });
                alert(`${contentType === 'post' ? '게시글' : '일기'}이 수정되었습니다.`);
            } else {
                const createUrl = apiEndpoints.create(teamId, data.selectedCategory);
                await axios.post(createUrl, payload, {
                    headers: { 'Content-Type': 'application/json' }
                });
                alert(`${contentType === 'post' ? '게시글' : '일기'}이 작성되었습니다.`);
            }

            // 성공 후 페이지 이동 로직...
        } catch (error) {
            console.error('제출 실패:', error);
            alert(`${contentType === 'post' ? '게시글' : '일기'} ${isEdit ? '수정' : '작성'}에 실패했습니다.`);
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
