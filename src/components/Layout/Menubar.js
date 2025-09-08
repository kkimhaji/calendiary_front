import React, { useState, useEffect } from 'react';
import './Menubar.css';
import { useTeam } from '../../contexts/TeamContext';
import axios from '../../api/axios';
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
            const response = await axios.get('/member/get_teams');
            setTeams(response.data || []);
        } catch (error) {
            console.error('팀 목록 조회 실패:', error);
            setTeams([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTeams();
    }, [shouldRefreshTeams]);

    const handleTeamSelect = (teamId) => {
        setSelectedTeamId(teamId);
        navigate(`/teams/${teamId}/recent`);
        onClose();
    };

    const handleCreateTeam = () => {
        navigate('/create-team');
        onClose(); // ✅ 메뉴 닫기 추가
    };

    // ✅ 개인 일기 페이지로 이동하는 함수 추가
    const handleGoToDiary = () => {
        setSelectedTeamId(null); // 팀 선택 해제
        navigate('/diary');
        onClose();
    };

    return (
        <div className={`team-menu ${isOpen ? 'open' : ''}`}>
            <div className='menubar-header'>
                <h3>메뉴</h3>
                <button className='close-button' onClick={onClose}>
                    ×
                </button>
            </div>
            
            {/* ✅ 개인 일기 메뉴 추가 */}
            <div className='menubar-section'>
                <button className='diary-button' onClick={handleGoToDiary}>
                    📔 개인 일기
                </button>
            </div>

            <hr className='menubar-divider' />

            {/* 팀 관련 메뉴 */}
            <div className='menubar-section'>
                <h4>팀 목록</h4>
                <button className='create-team-button' onClick={handleCreateTeam}>
                    팀 만들기
                </button>
                <nav className='menubar-menu'>
                    {loading ? (
                        <div className='loading'>로딩중...</div>
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
                                <li className='no-teams'>팀이 없습니다.</li>
                            )}
                        </ul>
                    )}
                </nav>
            </div>
        </div>
    );
}

export default Menubar;
