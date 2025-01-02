import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/CreateTeam.css';

function CreateTeam() {
    const navigate = useNavigate();
    const [teamData, setTeamData] = useState({
        teamName: '',
        description: ''
    });

    const handleChange = (e) => {
        setTeamData({
            ...teamData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/team/create', teamData);
            alert('팀이 생성되었습니다.');
            navigate('/boardList');  // 메인 페이지로 이동
        } catch (error) {
            console.error('팀 생성 실패:', error);
            alert('팀 생성에 실패했습니다.');
        }
    };

    return (
        <div className="create-team-container">
            <h2>새 팀 만들기</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>팀 이름</label>
                    <input
                        type="text"
                        name="teamName"
                        value={teamData.teamName}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>팀 설명</label>
                    <textarea
                        name="description"
                        value={teamData.description}
                        onChange={handleChange}
                        required
                    />
                </div>
                <button type="submit">팀 생성하기</button>
            </form>
        </div>
    );
}

export default CreateTeam;