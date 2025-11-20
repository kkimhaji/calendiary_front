import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'; // 변경
import { useNavigate } from 'react-router-dom';
import axios from '../../api/axios';
import './TeamCategoriesSection.css';

const TeamCategoriesSection = ({ teamId, hasManagePermission, readOnly = false }) => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isReordering, setIsReordering] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchCategories();
    }, [teamId]);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`/teams/${teamId}/categories`);
            // 데이터 구조 확인용 로그
            console.log('받아온 카테고리:', response.data);
            setCategories(response.data);
            setError(null);
        } catch (error) {
            console.error('카테고리 목록 조회 실패:', error);
            setError('카테고리 목록을 불러올 수 없습니다.');
        } finally {
            setLoading(false);
        }
    };

    const handleDragEnd = (result) => {
        // 드롭 위치가 없으면 취소
        if (!result.destination) {
            console.log('드롭 위치 없음');
            return;
        }

        // 같은 위치면 취소
        if (result.destination.index === result.source.index) {
            console.log('같은 위치로 드롭');
            return;
        }

        console.log('드래그 완료:', {
            from: result.source.index,
            to: result.destination.index
        });

        const items = Array.from(categories);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        // 낙관적 업데이트
        setCategories(items);

        // 서버에 순서 저장
        saveOrder(items);
    };

    const saveOrder = async (items) => {
        setIsReordering(true);
        const categoryIds = items.map(cat => cat.id);

        console.log('서버에 전송할 순서:', categoryIds);

        try {
            await axios.put(`/teams/${teamId}/categories/reorder`, {
                categoryIds
            });
            console.log('순서 변경 성공');
        } catch (error) {
            console.error('순서 변경 실패:', error);
            alert('카테고리 순서 변경에 실패했습니다.');
            fetchCategories(); // 실패 시 원래대로 복구
        } finally {
            setIsReordering(false);
        }
    };

    const handleCategoryClick = (categoryId) => {
        navigate(`/teams/${teamId}/category/${categoryId}/info`);
    };

    const handleCreateCategory = () => {
        navigate(`/teams/${teamId}/category/create`);
    };

    if (loading) {
        return (
            <section className="team-section">
                <h3>카테고리</h3>
                <div className="loading">로딩 중...</div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="team-section">
                <h3>카테고리</h3>
                <div className="error-message">{error}</div>
            </section>
        );
    }

    return (
        <section className="team-section">
            <div className="section-header">
                <h3>카테고리 ({categories.length})</h3>
                {!readOnly && hasManagePermission && (
                    <button
                        className="create-category-button"
                        onClick={handleCreateCategory}
                    >
                        + 카테고리 추가
                    </button>
                )}
            </div>

            {categories.length === 0 ? (
                <div className="empty-state">
                    <p>등록된 카테고리가 없습니다.</p>
                    {!readOnly && hasManagePermission && (
                        <button
                            className="create-first-category-button"
                            onClick={handleCreateCategory}
                        >
                            첫 번째 카테고리 만들기
                        </button>
                    )}
                </div>
            ) : (
                <>
                    {!readOnly && hasManagePermission && (
                        <div className="reorder-hint">
                            <span className="hint-icon">ℹ️</span>
                            드래그하여 카테고리 순서를 변경할 수 있습니다
                        </div>
                    )}

                    {!readOnly && hasManagePermission ? (
                        // 관리 권한이 있으면 드래그 가능
                        <DragDropContext onDragEnd={handleDragEnd}>
                            <Droppable droppableId="categories">
                                {(provided, snapshot) => (
                                    <ul
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                        className={`category-order-list ${snapshot.isDraggingOver ? 'dragging-over' : ''
                                            }`}
                                    >
                                        {categories.map((category, index) => (
                                            <Draggable
                                                key={String(category.id)} // String으로 변환
                                                draggableId={String(category.id)}
                                                index={index}
                                                isDragDisabled={isReordering}
                                            >
                                                {(provided, snapshot) => (
                                                    <li
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        className={`category-item ${snapshot.isDragging ? 'dragging' : ''
                                                            }`}
                                                    >
                                                        {/* 드래그 핸들 영역 */}
                                                        <span
                                                            {...provided.dragHandleProps}
                                                            className="drag-handle"
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            ☰
                                                        </span>

                                                        {/* 클릭 가능한 컨텐츠 영역 */}
                                                        <div
                                                            className="category-content"
                                                            onClick={() => handleCategoryClick(category.id)}
                                                        >
                                                            <span className="category-name">
                                                                {category.name}
                                                            </span>
                                                            {category.displayOrder !== undefined && (
                                                                <span className="category-order-badge">
                                                                    #{category.displayOrder}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </li>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </ul>
                                )}
                            </Droppable>
                        </DragDropContext>
                    ) : (
                        // 일반 사용자는 읽기 전용
                        <ul className="category-order-list read-only">
                            {categories.map((category) => (
                                <li
                                    key={category.id}
                                    className="category-item"
                                    onClick={() => handleCategoryClick(category.id)}
                                >
                                    <div className="category-content">
                                        <span className="category-name">
                                            {category.name}
                                        </span>
                                        {category.displayOrder !== undefined && (
                                            <span className="category-order-badge">
                                                #{category.displayOrder}
                                            </span>
                                        )}
                                    </div>
                                    <span className="arrow-icon">→</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </>
            )}
        </section>
    );
};

export default TeamCategoriesSection;
