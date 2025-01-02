import { useState, useEffect } from 'react';
import './Menubar.css';
import { useTeam } from '../../contexts/TeamContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Menubar({ isOpen, setIsOpen, onClose }) {
    const [teams, setTeams] = useState([]);
    const { setSelectedTeamId, selectedTeamId } = useTeam();
    const navigate = useNavigate();
    const fetchTeams = async () => {
        try {
            const response = await axios.get('/teams');
            setTeams(response.data);
        } catch (error) {
            console.error('팀 목록 조회 실패:', error);
        }
    };

    // 팀 목록 가져오기
    useEffect(() => {
        //     fetch('/api/teams')
        //         .then(res => res.json())
        //         .then(data => setTeams(data));
        // }, []);
        // API 호출하여 사용자의 팀 목록 가져오기
        fetchTeams();
    }, []);

    const handleTeamSelect = (teamId) => {
        setSelectedTeamId(teamId);
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
                <ul>
                    {teams.map(team => (
                        <li
                            key={team.id}
                            className={selectedTeamId === team.id ? 'selected' : ''}
                            onClick={() => handleTeamSelect(team.id)}
                        >
                            {team.name}
                        </li>
                    ))}
                </ul>
            </nav>
        </div>
    );
}

export default Menubar;
