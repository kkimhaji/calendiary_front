import React from 'react';
import { CKEditor } from "@ckeditor/ckeditor5-react";
import {
    ClassicEditor,
    Autoformat,
    AutoImage,
    Autosave,
    BlockQuote,
    Bold,
    CloudServices,
    Essentials,
    Heading,
    ImageBlock,
    ImageCaption,
    ImageInline,
    ImageInsert,
    ImageInsertViaUrl,
    ImageResize,
    ImageStyle,
    ImageTextAlternative,
    ImageToolbar,
    ImageUpload,
    Indent,
    IndentBlock,
    Italic,
    Link,
    LinkImage,
    List,
    ListProperties,
    MediaEmbed,
    Paragraph,
    PasteFromOffice,
    SimpleUploadAdapter,
    Table,
    TableCaption,
    TableCellProperties,
    TableColumnResize,
    TableProperties,
    TableToolbar,
    TextTransformation,
    TodoList,
    Underline,
    ImageResizeEditing,
    ImageResizeHandles
} from 'ckeditor5';
import 'ckeditor5/ckeditor5.css';

const RichTextEditor = ({ 
    initialValue = '', 
    onChange, 
    teamId, 
    onReady 
}) => {
    const editorConfiguration = {
        licenseKey: 'GPL',
        toolbar: {
            items: [
                'heading',
                '|',
                'bold',
                'italic',
                'underline',
                '|',
                'link',
                'insertImage',
                'mediaEmbed',
                'insertTable',
                'blockQuote',
                '|',
                'bulletedList',
                'numberedList',
                'todoList',
                'outdent',
                'indent'
            ],
            shouldNotGroupWhenFull: false
        },
        plugins: [
            Autoformat,
            AutoImage,
            Autosave,
            BlockQuote,
            Bold,
            CloudServices,
            Essentials,
            Heading,
            ImageBlock,
            ImageCaption,
            ImageInline,
            ImageInsert,
            ImageInsertViaUrl,
            ImageResize,
            ImageStyle,
            ImageTextAlternative,
            ImageToolbar,
            ImageUpload,
            Indent,
            IndentBlock,
            Italic,
            Link,
            LinkImage,
            List,
            ListProperties,
            MediaEmbed,
            Paragraph,
            PasteFromOffice,
            SimpleUploadAdapter,
            Table,
            TableCaption,
            TableCellProperties,
            TableColumnResize,
            TableProperties,
            TableToolbar,
            TextTransformation,
            TodoList,
            Underline,
            Image,
            ImageToolbar,
            ImageUpload,
            ImageStyle,
            ImageResizeEditing,
            ImageResizeHandles,
            SimpleUploadAdapter
        ],
        image: {
            toolbar: [
                'imageStyle:inline',
                'imageStyle:block',
                'imageStyle:side',
                '|',
                'toggleImageCaption',
                'imageTextAlternative',
                '|',
                'resizeImage'
            ],
            resizeOptions: [
                {
                    name: 'resizeImage:original',
                    value: null,
                    label: 'Original'
                },
                {
                    name: 'resizeImage:50',
                    value: '50',
                    label: '50%'
                },
                {
                    name: 'resizeImage:75',
                    value: '75',
                    label: '75%'
                }
            ],
            styles: [
                'full',
                'side',
                'alignLeft',
                'alignCenter',
                'alignRight'
            ],
            upload: {
                types: ['jpeg', 'png', 'gif', 'webp']
            }
        },
        simpleUpload: {
            withCredentials: true,
            uploadUrl: `/teams/${teamId}/images/temp-upload`,
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                'Content-Type': 'multipart/form-data'
            }
        }
    };

    return (
        <CKEditor
            editor={ClassicEditor}
            data={initialValue}
            config={editorConfiguration}
            onChange={(event, editor) => {
                const data = editor.getData();
                if (onChange) onChange(data);
            }}
            onReady={(editor) => {
                // 에디터가 준비되면 콜백 함수 호출
                if (onReady) onReady(editor);
            }}
        />
    );
};

export default RichTextEditor;
