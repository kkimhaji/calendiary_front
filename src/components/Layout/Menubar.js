import { useState, useEffect } from 'react';
import './Menubar.css';
import { useTeam } from '../../contexts/TeamContext';
import axios from 'axios';

function Menubar({ isOpen, setIsOpen, onClose }) {
    const [teams, setTeams] = useState([]);
    const { setSelectedTeamId, selectedTeamId } = useTeam();

    const fetchTeams = async () => {
        try {
            const response = await axios.get('/api/teams');
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

    return (
        <div className={`team-menu ${isOpen ? 'open' : ''}`}>
            <div className='menubar-header'>
                <h3> 팀 목록 </h3>
                <button className='close-button' onClick={onClose}>
                    x
                </button>
            </div>

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
