import React from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import CustomUploadAdapter from "../constants/CustomUploadAdapter.js";
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
import axios from "axios";


const CustomCKEditor = ({ data, onChange, teamId }) => {
    const handleImageUpload = async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post(
                `teams/${teamId}/images/temp-upload`,
                formData,
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );
            return { default: response.data };
        } catch (error) {
            console.error("이미지 업로드 실패: ", error);
            throw new Error('이미지 업로드에 실패했습니다.');
        }
    };

    const handleUploadAdapter = (editor) => {
        editor.plugins.get('FileRepository').createUploadAdapter = (loader) => {
          return new CustomUploadAdapter(loader); // 클래스 인스턴스 생성
        };
      };

    const editorConfiguration = {
        licenseKey: 'GPL', // GPL 라이선스 키 추가
        extraPlugins: [handleUploadAdapter],
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
            ImageResizeHandles
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
            uploadUrl: `teams/${teamId}/images/temp-upload`, // 서버 업로드 URL
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'multipart/form-data'
            }
        }
    };


    return (
        <CKEditor
            editor={ClassicEditor}
            data={data}
            config={
                editorConfiguration
            }
            onChange={(event, editor) => {
                const data = editor.getData();
                onChange(data);
            }}
            // onReady={editor => {
            //     editor.plugins.get('FileRepository').createUploadAdapter = (loader) => {
            //         ({
            //             upload: () => loader.file.then(file => handleImageUpload(file))
            //         });
            //     }
            // }}
        />
    );
};

export default CustomCKEditor;