import React from 'react';
import ContentEditor from '../ContentEditor';

const CreatePost = () => {
    return (
        <ContentEditor
            contentType="post"
            apiEndpoints={{
                create: (teamId, categoryId) => `/teams/${teamId}/category/${categoryId}/posts`,
                update: (teamId, categoryId, postId) => `/teams/${teamId}/category/${categoryId}/posts/${postId}`,
                fetch: (teamId, categoryId, postId) => `/teams/${teamId}/category/${categoryId}/posts/${postId}`
            }}
            showCategory={true}
            showVisibility={false}
        />
    );
};

export default CreatePost;
