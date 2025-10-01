import React, { useMemo, useCallback } from 'react';
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

// 커스텀 업로드 어댑터 클래스
class CustomUploadAdapter {
    constructor(loader, onImageUpload) {
        this.loader = loader;
        this.onImageUpload = onImageUpload;
    }

    upload() {
        return this.loader.file
            .then(file => this.onImageUpload(file))
            .then(response => ({ default: response }))
            .catch(error => {
                throw error;
            });
    }

    abort() {
        // 업로드 중단 처리
    }
}

const RichTextEditor = React.memo(({ 
    initialValue = '', 
    onChange, 
    onImageUpload,
    domain = 'POST'
}) => {
    // 무한 재렌더링 방지를 위한 안정화된 콜백
    const stableOnImageUpload = useCallback(onImageUpload, []);

    // 커스텀 플러그인 정의
    const customPlugins = useMemo(() => {
        // 파일 업로드 어댑터 플러그인
        function CustomUploadAdapterPlugin(editor) {
            editor.plugins.get('FileRepository').createUploadAdapter = (loader) => {
                return new CustomUploadAdapter(loader, stableOnImageUpload);
            };
        }

        // 클립보드 이미지 처리 플러그인
        function ClipboardImageUploadPlugin(editor) {
            editor.editing.view.document.on('paste', async (evt, data) => {
                try {
                    const clipboardData = data.dataTransfer;
                    const files = Array.from(clipboardData.files || []);
                    
                    if (files.length > 0) {
                        const imageFiles = files.filter(file => file.type.startsWith('image/'));
                        
                        if (imageFiles.length > 0) {
                            const imageFile = imageFiles[0];
                            
                            try {
                                const uploadedUrl = await stableOnImageUpload(imageFile);
                                
                                // 에디터에 이미지 삽입
                                editor.model.change(writer => {
                                    const imageElement = writer.createElement('imageBlock', {
                                        src: uploadedUrl
                                    });
                                    
                                    const selection = editor.model.document.selection;
                                    editor.model.insertContent(imageElement, selection);
                                });
                                
                                // 기본 paste 이벤트 방지
                                evt.stop();
                                data.preventDefault();
                                
                            } catch (error) {
                                // 업로드 실패 시 기본 동작 유지
                            }
                        }
                    }
                } catch (error) {
                    // 전체 처리 실패 시 기본 동작 유지
                }
            });
        }

        return [CustomUploadAdapterPlugin, ClipboardImageUploadPlugin];
    }, [stableOnImageUpload]);

    // 에디터 설정
    const editorConfiguration = useMemo(() => ({
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
            ImageResizeHandles,
            ...customPlugins
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
                types: ['jpeg', 'png', 'gif', 'webp', 'bmp']
            }
        },
    }), [customPlugins]);

    return (
        <CKEditor
            editor={ClassicEditor}
            data={initialValue}
            config={editorConfiguration}
            onChange={(event, editor) => {
                const data = editor.getData();
                if (onChange) onChange(data);
            }}
        />
    );
});

RichTextEditor.displayName = 'RichTextEditor';

export default RichTextEditor;