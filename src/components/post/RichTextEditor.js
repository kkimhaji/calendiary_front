// RichTextEditor.js
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
            .then(file => {
                console.log('CustomUploadAdapter - 파일 업로드 시작:', file.name, file.type, file.size);
                return this.onImageUpload(file);
            })
            .then(response => {
                console.log('CustomUploadAdapter - 업로드 성공:', response);
                return { default: response };
            })
            .catch(error => {
                console.error('CustomUploadAdapter - 업로드 실패:', error);
                throw error;
            });
    }

    abort() {
        console.log('CustomUploadAdapter - 업로드 중단');
    }
}

const RichTextEditor = React.memo(({ 
    initialValue = '', 
    onChange, 
    onImageUpload,
    domain = 'POST'
}) => {
    console.log('RichTextEditor - 초기화:', { domain, hasOnImageUpload: !!onImageUpload });

    // onImageUpload를 useCallback으로 메모이제이션 [web:96]
    const stableOnImageUpload = useCallback(onImageUpload, []);

    // 플러그인 메모이제이션으로 무한 재렌더링 방지 [web:94]
    const customPlugins = useMemo(() => {
        // 커스텀 업로드 어댑터 플러그인
        function CustomUploadAdapterPlugin(editor) {
            editor.plugins.get('FileRepository').createUploadAdapter = (loader) => {
                return new CustomUploadAdapter(loader, stableOnImageUpload);
            };
        }

        // 클립보드 이미지 처리 플러그인
        function ClipboardImageUploadPlugin(editor) {
            editor.editing.view.document.on('paste', async (evt, data) => {
                console.log('ClipboardImageUploadPlugin - paste 이벤트 발생');
                
                try {
                    const clipboardData = data.dataTransfer;
                    const files = Array.from(clipboardData.files || []);
                    
                    console.log('ClipboardImageUploadPlugin - 파일 목록:', files);
                    
                    if (files.length > 0) {
                        const imageFiles = files.filter(file => file.type.startsWith('image/'));
                        
                        if (imageFiles.length > 0) {
                            console.log('ClipboardImageUploadPlugin - 이미지 파일 발견:', imageFiles);
                            
                            const imageFile = imageFiles[0];
                            
                            try {
                                const uploadedUrl = await stableOnImageUpload(imageFile);
                                console.log('ClipboardImageUploadPlugin - 업로드 성공:', uploadedUrl);
                                
                                // CKEditor5의 올바른 이미지 삽입 방법 [web:91][web:92]
                                editor.model.change(writer => {
                                    const imageElement = writer.createElement('imageBlock', {
                                        src: uploadedUrl
                                    });
                                    
                                    // 현재 선택 위치에 이미지 삽입
                                    const selection = editor.model.document.selection;
                                    editor.model.insertContent(imageElement, selection);
                                    
                                    console.log('ClipboardImageUploadPlugin - 이미지 삽입 완료');
                                });
                                
                                // 기본 paste 이벤트 방지
                                evt.stop();
                                data.preventDefault();
                                
                            } catch (error) {
                                console.error('ClipboardImageUploadPlugin - 업로드 실패:', error);
                            }
                        }
                    }
                } catch (error) {
                    console.error('ClipboardImageUploadPlugin - 전체 처리 실패:', error);
                }
            });
        }

        return [CustomUploadAdapterPlugin, ClipboardImageUploadPlugin];
    }, []); // 의존성 배열을 빈 배열로 변경 [web:94]

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
            // 커스텀 플러그인들 추가
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
            onReady={(editor) => {
                console.log('RichTextEditor - 에디터 준비 완료');
            }}
        />
    );
});

// displayName 설정
RichTextEditor.displayName = 'RichTextEditor';

export default RichTextEditor;