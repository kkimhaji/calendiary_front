import React from 'react';
import ContentEditor from '../ContentEditor';

const CreateDiary = () => {
    return (
        <ContentEditor
            contentType="diary"
            apiEndpoints={{
                create: () => `/diary`,
                update: (diaryId) => `/diary/${diaryId}`,
                fetch: (diaryId) => `/diary/${diaryId}`
            }}
            showCategory={false}
            showVisibility={true}
        />
    );
};

export default CreateDiary;
