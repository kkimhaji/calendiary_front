import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import axios from 'axios';
import '../styles/CreatePost.css';

const CreatePost = () => {
    // const [isEditorReady, setIsEditorReady] = useState(false);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [categories, setCategories] = useState([]);
    const { teamId } = useParams();
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [selectedCategoryId, setSelectedCategoryId] = useState(null);

    const editorConfiguration = {
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

    useEffect(() =>{
        const fetchCategories = async() =>{
            try{
                const response = await axios.get(`/teams/${teamId}/categories`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}`}
                });
                setCategories(response.data|| []);
            }catch (error) {
                console.error('카테고리 목록 불러오기 실패: ', error);
                setCategories([]);
            }
        };
        fetchCategories();
    }, [teamId]);


    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!selectedCategoryId) {
            setError('카테고리를 선택해주세요.');
            return;
        }
        try {            
            //글 작성
            const url = `/teams/${teamId}/category/${selectedCategoryId}/posts`;


            await axios.post(url, {
                title,
                content,
                teamId: parseInt(teamId),
                categoryId: parseInt(selectedCategoryId)
            }, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            navigate(`/teams/${teamId}/cateogry/${selectedCategoryId}/recent`);
        } catch (error) {
            console.error('게시글 작성 실패:', error);
            alert('게시글 작성에 실패했습니다.');
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
                    />
                </div>
                <div className="category-selection">
                    <label>카테고리 선택<span className="required">*</span></label>
                    <div className="category-buttons">
                        {categories.map(category => (
                            <button
                                key={category.id}
                                type="button"
                                className={`category-button ${selectedCategoryId === category.id ? 'selected' : ''}`}
                                onClick={() => {
                                    setSelectedCategoryId(category.id);
                                    setError(''); // 카테고리 선택 시 에러 메시지 제거
                                }}
                            >
                                {category.name}
                            </button>
                        ))}
                    </div>
                    {error && <p className="error-message">{error}</p>}
                </div>
                <div className="form-group">
                    <CKEditor
                        editor={ClassicEditor}
                        data={content}
                        config={editorConfiguration}
                        onChange={(event, editor) => {
                                const data = editor.getData();
                                setContent(data);
                        }}
                    />
                </div>
                <div className="button-group">
                    <button type="submit" className="submit-button" disabled={!selectedCategoryId} // 카테고리 미선택 시 버튼 비활성화
                    >
                        작성완료
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
