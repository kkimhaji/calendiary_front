class CustomUploadAdapter {
    constructor(loader) {
        this.loader = loader;
    }

    upload() {
        return this.loader.file.then(file => 
            new Promise((resolve, reject) => {
                const formData = new FormData();
                formData.append('file', file);
                
                // 임시 업로드 엔드포인트 호출
                axios.post('/api/images/temp', formData, {
                    headers: {'Content-Type': 'multipart/form-data'}
                }).then(response => {
                    resolve({
                        default: response.data.url
                    });
                }).catch(error => reject(error));
            })
        );
    }
}

function CustomUploadAdapterPlugin(editor) {
    editor.plugins.get('FileRepository').createUploadAdapter = (loader) => {
        return new CustomUploadAdapter(loader);
    };
}
