import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import axios from 'axios';
import '../styles/CreatePost.css';

const CreatePost = () => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const { teamId, categoryId } = useParams();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const postData = {
                title,
                content,
                teamId: parseInt(teamId),
                categoryId: categoryId ? parseInt(categoryId) : null
            };
            
            //글 작성
            const url = categoryId 
                ? `/teams/${teamId}/category/${categoryId}/posts`
                : `/teams/${teamId}/posts`;

            await axios.post(url, postData, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            // 작성 완료 후 목록으로 돌아가기
            if (categoryId) {
                navigate(`/teams/${teamId}/category/${categoryId}/recent`);
            } else {
                navigate(`/teams/${teamId}/recent`);
            }
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
                <div className="form-group">
                    <CKEditor
                        editor={ClassicEditor}
                        data={content}
                        onChange={(event, editor) => {
                            const data = editor.getData();
                            setContent(data);
                        }}
                    />
                </div>
                <div className="button-group">
                    <button type="submit" className="submit-button">
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
