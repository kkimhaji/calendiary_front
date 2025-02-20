import React, { useState, useEffect } from 'react';
import '../../styles/Menubar.css';
import { useTeam } from '../../contexts/TeamContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import RecentPosts from './RecentPosts';

function Menubar({ isOpen, setIsOpen, onClose }) {
    const [teams, setTeams] = useState([]);
    const { selectedTeamId, setSelectedTeamId, shouldRefreshTeams, refreshTeams } = useTeam();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    const fetchTeams = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/member/get_teams', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
            });
            setTeams(response.data || []);
        } catch (error) {
            console.error('팀 목록 조회 실패:', error);
            setTeams([]); // 에러 발생 시 빈 배열로 설정
        } finally {
            setLoading(false);
        }
    };

    // 팀 목록 가져오기
    useEffect(() => {
        fetchTeams();
    }, [shouldRefreshTeams]); //갱신 상태

    const handleTeamSelect = (teamId) => {
        setSelectedTeamId(teamId);
        navigate(`/teams/${teamId}/recent`);
        onClose();
    };

    const handleCreateTeam = () => {
        navigate('/create-team');  // 함수로 분리하여 처리
    };

    return (
        <div className={`team-menu ${isOpen ? 'open' : ''}`}>
            <div className='menubar-header'>
                <h3> 팀 목록 </h3>
                <button className='close-button' onClick={onClose}>
                    x
                </button>
            </div>
            <button className='create-team-button' onClick={handleCreateTeam}>
                팀 만들기
            </button>
            <nav className='menubar-menu'>
                {loading ? (
                    <div>로딩중...</div>
                ) : (
                    <ul>
                        {teams && teams.length > 0 ? (
                            teams.map(team => (
                                <li
                                    key={team.id}
                                    className={selectedTeamId === team.id ? 'selected' : ''}
                                    onClick={() => handleTeamSelect(team.id)}
                                >
                                    {team.name}
                                </li>
                            ))
                        ) : (
                            <li>팀이 없습니다.</li>
                        )}
                    </ul>
                )}
            </nav>
        </div>
    );
}

export default Menubar;
