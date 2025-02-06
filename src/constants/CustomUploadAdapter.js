import axios from "axios";

export default class CustomUploadAdapter {
    constructor(loader) {
        this.loader = loader;
    }

    upload() {
        return this.loader.file.then(file => 
            new Promise((resolve, reject) => {
                const formData = new FormData();
                formData.append('file', file);
                
                // 임시 업로드 엔드포인트 호출
                axios.post(`teams/${teamId}/images/temp-upload`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Authorization':`Bearer ${localStorage.getItem('token')}`
                    }
                }).then(response => {
                    resolve({
                        default: response.data.url
                    });
                }).catch(error => reject(error));
            })
        );
    }
}
