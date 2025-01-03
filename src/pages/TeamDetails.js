import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import './TeamDetails.css';

function TeamDetails() {
    const [teamDetails, setTeamDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const { teamId } = useParams();

    useEffect(() => {
        const fetchTeamDetails = async () => {
            try {
                const response = await axios.get(`/api/teams/${teamId}`);
                setTeamDetails(response.data);
            } catch (error) {
                console.error('팀 정보 조회 실패:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTeamDetails();
    }, [teamId]);

    if (loading) {
        return <div>로딩 중...</div>;
    }

    if (!teamDetails) {
        return <div>팀 정보를 찾을 수 없습니다.</div>;
    }

    return (
        <div className="team-details">
            <h2>{teamDetails.name}</h2>
            <div className="team-info">
                <div className="info-item">
                    <label>생성자:</label>
                    <span>{teamDetails.createdBy}</span>
                </div>
                <div className="info-item">
                    <label>생성일:</label>
                    <span>{new Date(teamDetails.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="info-item">
                    <label>멤버 수:</label>
                    <span>{teamDetails.memberCount}명</span>
                </div>
            </div>
        </div>
    );
}

export default TeamDetails;