import React, { useEffect, useState } from 'react';
import axios from './api/axios';
import './TestConnection.css';

function TestConnection() {
    const [connectionStatus, setConnectionStatus] = useState('테스트 중...');

    useEffect(() => {
        const testConnection = async () => {
            try {
                const response = await axios.get('/api/test');
                setConnectionStatus('서버 연결 성공: ' + response.data);
            } catch (error) {
                setConnectionStatus('서버 연결 실패: ' + error.message);
            }
        };
        
        testConnection();
    }, []);

    return (
        <div className="test-connection">
            <h2>서버 연결 테스트</h2>
            <div className={`status ${connectionStatus.includes('성공') ? 'success' : 'error'}`}>
                {connectionStatus}
            </div>
        </div>
    );
}

export default TestConnection;
