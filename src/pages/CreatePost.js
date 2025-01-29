import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import axios from 'axios';
import '../styles/CreatePost.css';

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
    const [isLoading, setIsLoading] = useState(true); // 로딩 상태 추가
    const isEdit = !!postId;

    const editorConfiguration = {
        licenseKey: 'GPL', // GPL 라이선스 키 추가
        toolbar: [
            'heading',
            '|',
            'bold',
            'italic',
            'link',
            'bulletedList',
            'numberedList',
            '|',
            'outdent',
            'indent',
            '|',
            'blockQuote',
            'insertTable',
            'undo',
            'redo'
        ]
    };

    useEffect(() => {
        if (isEdit) {
            const fetchPost = async () => {
                try{
                    const response = await axios.get(`/teams/${teamId}/category/${categoryId}/posts/${postId}`,{
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        }
                    });
                    console.log("get post response:", response.data);
                    const post = response.data;
                    setTitle(post.title || '');
                    setContent(post.content || '');
                } catch(error) {
                    console.error('게시글 로드 실패: ', error);
                    alert('게시글을 불러오는 데 실패했습니다.');
                    navigate(-1);
                } finally{
                    setIsLoading(false);
                }
            };
            fetchPost();
        } else {
            setIsLoading(false);
        }

        const fetchCategories = async () => {
            if (teamId) {
                // 선택된 팀의 카테고리 목록 가져오기
                try {
                    const response = await axios.get(`/teams/${teamId}/categories`, {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        }
                    });

                    console.log('API Response:', response.data);

                    setCategories(response.data || []); // 응답이 없을 경우 빈 배열 설정
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
    }, [teamId, categoryId, postId, isEdit]);

    if (isLoading) {
        return <div>Loading...</div>;
    }
    const handleCategorySelect = (categoryId, categoryName) => {
        setSelectedCategoryId(categoryId);
        setSelectedCategoryName(categoryName);
        setIsDropdownOpen(false);
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const postData = {
            title, content
        };

        try{
            if (isEdit) {
                await axios.put(`/teams/${teamId}/category/${categoryId}/posts/${postId}`, postData,
                    {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        }
                    }
                );
                alert('게시글이 수정되었습니다.');
            } else{
                            //글 작성
            const url = `/teams/${teamId}/category/${selectedCategoryId}/posts`;

            await axios.post(url, {
                title,
                content,
                teamId: parseInt(teamId),
                categoryId: parseInt(selectedCategoryId)
            }, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            navigate(`/teams/${teamId}/cateogry/${selectedCategoryId}/recent`);
            }
        } catch (error) {
            console.error('게시글 작성 실패:', error);
            alert('게시글 작성에 실패했습니다.');
            alert(isEdit ? '게시글 수정에 실패했습니다.' : '게시글 작성에 실패했습니다.');
        }
        if (!selectedCategoryId) {
            setError('카테고리를 선택해주세요.');
            return;
        }

    };

    return (
        <div className="create-post-container">
            <h2>게시글 작성</h2>
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
                <div className="form-group">
                    <CKEditor
                        editor={ClassicEditor}
                        data={content || ''}
                        config={
                            editorConfiguration
                    }
                        onChange={(event, editor) => {
                            const data = editor.getData();
                            setContent(data);
                        }}
                    />
                </div>
                <div className="button-group">
                    <button type="submit" className="submit-button" disabled={!selectedCategoryId} // 카테고리 미선택 시 버튼 비활성화
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
