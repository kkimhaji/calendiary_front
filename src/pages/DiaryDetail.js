import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import ContentDetailLayout from '../layout/ContentDetailLayout';

const DiaryDetail = () => {
    const [diary, setDiary] = useState(null);
    const { diaryId } = useParams();
    const navigate = useNavigate();
    const [permissions, setPermissions] = useState({
        canEdit: true,
        canDelete: true
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let isCancelled = false;

        const loadData = async () => {
            try {
                setLoading(true);
                setError(null);
                
                console.log('일기 조회 시작 - diaryId:', diaryId);
                
                const response = await axios.get(`/diary/${diaryId}`);
                console.log('일기 조회 성공:', response.data);
                
                if (!isCancelled) {
                    setDiary(response.data);
                    
                    setPermissions({
                        canEdit: true,
                        canDelete: true
                    });
                }
            } catch (error) {
                console.error('일기 로드 실패:', error);
                
                if (!isCancelled) {
                    if (error.response?.status === 403) {
                        setError('일기 조회 권한이 없습니다.');
                    } else if (error.response?.status === 404) {
                        setError('일기를 찾을 수 없습니다.');
                    } else {
                        setError('일기를 불러오는데 실패했습니다.');
                    }
                }
            } finally {
                if (!isCancelled) {
                    setLoading(false);
                }
            }
        };

        loadData();

        return () => {
            isCancelled = true;
        };
    }, [diaryId]);

    const handleDelete = async () => {
        if (window.confirm('정말로 이 일기를 삭제하시겠습니까?')) {
            try {
                await axios.delete(`/diary/${diaryId}`);
                navigate('/diary');
            } catch (error) {
                alert('일기 삭제에 실패했습니다.');
            }
        }
    };

    const handleEdit = () => {
        navigate(`/diary/${diaryId}/edit`, {
            state: {
                isEdit: true,
                diaryData: {
                    id: diary.id,
                    title: diary.title,
                    content: diary.content,
                    visibility: diary.visibility,
                    createdDate: diary.createdDate
                }
            }
        });
    };

    if (loading) return <div className="loading">로딩 중...</div>;
    if (error) return <div className="error">{error}</div>;
    if (!diary) return <div className="not-found">일기를 찾을 수 없습니다.</div>;

    return (
        <ContentDetailLayout
            title={diary.title}
            content={diary.content}
            authorInfo="내 일기"
            createdDate={diary.createdDate}
            headerExtra={
                <span className={`visibility-badge ${diary.visibility.toLowerCase()}`}>
                    {diary.visibility === 'PUBLIC' ? '공개' : '비공개'}
                </span>
            }
            permissions={permissions}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onBack={() => navigate('/diary')}
            // 일기는 댓글 기능 없음
            commentsSection={null}
            className="diary-detail-container"
        />
    );
};

export default DiaryDetail;