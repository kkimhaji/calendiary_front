import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from '../api/axios';
import RichTextEditor from '../components/post/RichTextEditor';
import './CreatePost.css';

const CreatePost = () => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [categories, setCategories] = useState([]);
    const { teamId, categoryId, postId } = useParams();
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [selectedCategoryId, setSelectedCategoryId] = useState(null);
    const [selectedCategoryName, setSelectedCategoryName] = useState('카테고리 선택');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const [isLoading, setIsLoading] = useState(true);
    const isEdit = !!postId;
    const [images, setImages] = useState([]);

    useEffect(() => {
        if (isEdit) {
            const fetchPost = async () => {
                try {
                    const response = await axios.get(`/teams/${teamId}/category/${categoryId}/posts/${postId}`, {
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        }
                    });
                    console.log("get post response:", response.data);
                    const post = response.data;
                    setTitle(post.title || '');
                    setContent(post.content || '');
                } catch (error) {
                    console.error('게시글 로드 실패: ', error);
                    alert('게시글을 불러오는 데 실패했습니다.');
                    navigate(-1);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchPost();
        } else {
            setIsLoading(false);
        }

        const fetchCategories = async () => {
            if (teamId) {
                try {
                    const response = await axios.get(`/teams/${teamId}/categories`);
                    setCategories(response.data || []);
                } catch (error) {
                    console.error('카테고리 목록 조회 실패: ', error);
                    setCategories([]);
                }
            }
        };

        fetchCategories();

        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [teamId, categoryId, postId, isEdit, navigate]);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    const handleCategorySelect = (categoryId, categoryName) => {
        setSelectedCategoryId(categoryId);
        setSelectedCategoryName(categoryName);
        setIsDropdownOpen(false);
        setError('');
    };

    const handleImageUpload = async (file) => {
        const formData = new FormData();
        formData.append('file', file);    

        try {
            const response = await axios.post(`/teams/${teamId}/images/temp-upload`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return { default: response.data };
        } catch (error) {
            console.error('이미지 업로드 실패: ', error);
            throw new Error('이미지 업로드에 실패했습니다.');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        if (!selectedCategoryId && !isEdit) {
            setError('카테고리를 선택해주세요.');
            return;
        }
    
        try {
            if (isEdit) {
                // 수정 시에는 FormData 사용
                const formData = new FormData();
                formData.append('title', title);
                formData.append('content', content);
                
                // 이미지 파일 추가
                if (images.length > 0) {
                    images.forEach(image => {
                        formData.append('images', image);
                    });
                }
    
                await axios.put(
                    `/teams/${teamId}/category/${categoryId}/posts/${postId}`, 
                    formData, 
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        }
                    }
                );
                
                alert('게시글이 수정되었습니다.');
                navigate(`/teams/${teamId}/category/${categoryId}/posts/${postId}`);
            } else {
                // 생성 시에도 FormData 사용
                const formData = new FormData();
                formData.append('title', title);
                formData.append('content', content);
                formData.append('teamId', teamId);
                formData.append('categoryId', selectedCategoryId);
                
                // 이미지 파일 추가
                if (images.length > 0) {
                    images.forEach(image => {
                        formData.append('images', image);
                    });
                }
    
                await axios.post(
                    `/teams/${teamId}/category/${selectedCategoryId}/posts`, 
                    formData, 
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        }
                    }
                );
                
                alert('게시글이 작성되었습니다.');
                navigate(`/teams/${teamId}/category/${selectedCategoryId}/recent`);
            }
        } catch (error) {
            console.error('게시글 작성 실패:', error);
            alert(isEdit ? '게시글 수정에 실패했습니다.' : '게시글 작성에 실패했습니다.');
        }
    };
    

    return (
        <div className="create-post-container">
            <h2>{isEdit ? '게시글 수정' : '게시글 작성'}</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <input
                        type="text"
                        placeholder="제목을 입력하세요"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="post-title-input"
                        required
                    />
                </div>

                {!isEdit && (
                    <div className="post-category-dropdown" ref={dropdownRef}>
                        <button
                            type="button"
                            className="post-category-dropdown-button"
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            aria-haspopup="listbox"
                            aria-expanded={isDropdownOpen}
                        >
                            <span>{selectedCategoryName}</span>
                            <i className={`post-dropdown-caret ${isDropdownOpen ? 'open' : ''}`}></i>
                        </button>

                        {isDropdownOpen && (
                            <div className="post-category-list" role="listbox">
                                {categories.map(category => (
                                    <div
                                        key={category.id}
                                        className={`post-category-item ${selectedCategoryId === category.id ? 'selected' : ''}`}
                                        onClick={() => handleCategorySelect(category.id, category.name)}
                                        role="option"
                                        aria-selected={selectedCategoryId === category.id}
                                    >
                                        <span>{category.name}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                        {error && <p className="error-message">{error}</p>}
                    </div>
                )}
                
                <div className="form-group">
                    <RichTextEditor
                        initialValue={content}
                        onChange={setContent}
                        teamId={teamId}
                        onReady={(editor) => {
                            // 이미지 업로드 어댑터 오버라이드
                            editor.plugins.get('FileRepository').createUploadAdapter = (loader) => ({
                                upload: () => loader.file.then(file => handleImageUpload(file))
                            });
                        }}
                    />
                </div>
                
                <div className="button-group">
                    <button 
                        type="submit" 
                        className="submit-button" 
                        disabled={!isEdit && !selectedCategoryId}
                    >
                        {isEdit ? '수정하기' : '작성하기'}
                    </button>
                    <button
                        type="button"
                        className="cancel-button"
                        onClick={() => navigate(-1)}
                    >
                        취소
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreatePost;
