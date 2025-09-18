import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from '../api/axios';
import './CreateTeam.css';
import { useTeam } from '../contexts/TeamContext';

function CreateTeam() {
    const navigate = useNavigate();
    const [teamData, setTeamData] = useState({
        name: '',
        description: ''
    });
    const {refreshTeams} = useTeam();
    const {teamId} = useParams();
    
    useEffect(() => {
        const loadTeamData = async () => {
            if (!teamId) return;
            
            try {
                const response = await axios.get(`/team/${teamId}`);
                setTeamData({
                    name: response.data.name,
                    description: response.data.description
                });
            } catch (error) {
                alert('팀 정보 로딩 실패');
                navigate(-1);
            }
        };
        loadTeamData();
    }, [teamId, navigate]);

    const handleChange = (e) => {
        setTeamData({
            ...teamData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('accessToken');
        
        try {
            if (teamId) {
                // 수정 요청
                await axios.put(`/team/${teamId}`, teamData, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                alert('팀 정보가 수정되었습니다');
                navigate(`/teams/${teamId}/info`);
            } else {
                // 생성 요청
                const response = await axios.post('/team/create', teamData, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                alert('팀 생성이 완료되었습니다');
                navigate(`/teams/${response.data.id}/info`);
            }
            refreshTeams();
            // navigate(teamId ? `/team/${teamId}` : `/teams/${response.data.id}/info`);
        } catch (error) {
            console.error(teamId ? '수정 실패' : '생성 실패', error);
            alert(error.response?.data?.message || '요청 처리 중 오류 발생');
        }
    };

    return (
        <div className="create-team-container">
            <h2>{teamId ? '팀 정보 수정' : '새 팀 만들기'}</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>팀 이름</label>
                    <input
                        type="text"
                        name="name"
                        value={teamData.name}
                        onChange={handleChange}
                        required
                        minLength={2}
                        maxLength={50}
                    />
                </div>
                <div className="form-group">
                    <label>팀 설명</label>
                    <textarea
                        name="description"
                        value={teamData.description}
                        onChange={handleChange}
                        maxLength={200}
                        rows={4}
                    />
                </div>
                <div className="button-group">
                    <button type="submit" className="submit-btn">
                        {teamId ? '수정 완료' : '팀 생성'}
                    </button>
                    <button 
                        type="button" 
                        onClick={() => navigate(-1)}
                        className="cancel-btn"
                    >
                        취소
                    </button>
                </div>
            </form>
        </div>
    );
}

export default CreateTeam;