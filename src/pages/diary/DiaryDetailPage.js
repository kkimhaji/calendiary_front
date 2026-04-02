import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../../api/axios';
import ContentDetailLayout from '../layout/ContentDetailLayout';

const DiaryDetail = () => {
    const [diary, setDiary] = useState(null);
    const { diaryId } = useParams();
    const navigate = useNavigate();
    const [permissions, setPermissions] = useState({
        canEdit: false,
        canDelete: false
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let isCancelled = false;

        // 작성자 확인 함수
        const checkAuthor = async () => {
            try {
                const response = await axios.get(`/diary/${diaryId}/check`);

                if (!isCancelled) {
                    const isAuthor = response.data;
                    // 작성자인 경우에만 수정/삭제 가능
                    setPermissions({
                        canEdit: isAuthor,
                        canDelete: isAuthor
                    });
                }
            } catch (error) {
                console.error('작성자 확인 실패:', error);
                if (!isCancelled) {
                    setPermissions({ canEdit: false, canDelete: false });
                }
            }
        };

        // 일기 조회 함수
        const fetchDiary = async () => {
            try {
                const response = await axios.get(`/diary/${diaryId}`);

                if (!isCancelled) {
                    setDiary(response.data);
                }

                return response.data;
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

                throw error;
            }
        };

        // 데이터 로드 함수
        const loadData = async () => {
            try {
                setLoading(true);
                setError(null);

                // 1. 일기 조회 (필수)
                await fetchDiary();

                if (isCancelled) return;

                // 2. 작성자 확인 (병렬 실행)
                await Promise.allSettled([
                    checkAuthor()
                ]);

            } catch (error) {
                console.error('데이터 로딩 실패:', error);
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
        if (!permissions.canDelete) {
            alert('일기 삭제 권한이 없습니다.');
            return;
        }

        if (window.confirm('정말로 이 일기를 삭제하시겠습니까?')) {
            try {
                await axios.delete(`/diary/${diaryId}`);
                navigate('/diary');
            } catch (error) {
                console.error('일기 삭제 실패:', error);

                if (error.response?.status === 403) {
                    alert('일기 삭제 권한이 없습니다.');
                } else {
                    alert('일기 삭제에 실패했습니다.');
                }
            }
        }
    };

    const handleEdit = () => {
        if (!permissions.canEdit) {
            alert('일기 수정 권한이 없습니다.');
            return;
        }

        navigate(`/diary/${diaryId}/edit`, {
            state: {
                isEdit: true,
                diaryData: {
                    id: diary.id,
                    title: diary.title,
                    content: diary.content,
                    visibility: diary.visibility,
                    diaryDate: diary.diaryDate,
                    createdDate: diary.createdDate
                }
            }
        });
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'short'
        });
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) return <div className="loading">로딩 중...</div>;
    if (error) return <div className="error">{error}</div>;
    if (!diary) return <div className="not-found">일기를 찾을 수 없습니다.</div>;

    return (
        <ContentDetailLayout
            title={diary.title}
            content={diary.content}
            authorInfo={`작성자: ${diary.authorNickname}`}
            createdDate={diary.createdDate}
            diaryDate={diary.diaryDate}
            customDateInfo={
                <div className="diary-date-info">
                    <div className="diary-date">
                        📅 <strong>{formatDate(diary.diaryDate)} 일기</strong>
                    </div>
                    <div className="created-date">
                        ✏️ 작성: {formatDateTime(diary.createdDate)}
                    </div>
                </div>
            }
            headerExtra={
                <span className={`visibility-badge ${diary.visibility.toLowerCase()}`}>
                    {diary.visibility === 'PUBLIC' ? '공개' : '비공개'}
                </span>
            }
            permissions={permissions}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onBack={() => navigate('/diary')}
            commentsSection={null}
            className="diary-detail-container"
        />
    );
};

export default DiaryDetail;
