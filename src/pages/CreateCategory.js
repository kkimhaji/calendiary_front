import React, { useState, useEffect } from 'react';
import { useNavigate, useParams  } from 'react-router-dom';
import axios from 'axios';
import '../styles/CreateCategory.css';
import { CategoryPermision, getPermissionLabel } from '../constants/CategoryPermission';

const CreateCategory = () => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [teamRoles, setTeamRoles] = useState([]);
    const [rolePermissions, setRolePermissions] = useState([]);
    const navigate = useNavigate();
    const { teamId } = useParams(); // URL에서 teamId 가져오기

    // 팀의 역할 목록 조회
    useEffect(() => {
        const fetchTeamRoles = async () => {
            try {
                const response = await axios.get(`/teams/${teamId}/roles/get_roles`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                    }
                });
                setTeamRoles(response.data);
                // 초기 rolePermissions 설정
                setRolePermissions(response.data.map(role => ({
                    roleId: role.id,
                    permissions: new Set()
                })));
            } catch (error) {
                console.error('역할 목록 조회 실패:', error);
            }
        };

        if (teamId) {
            fetchTeamRoles();
        }
    }, [teamId]);

    const handlePermissionChange = (roleId, permission) => {
        setRolePermissions(prevPermissions => {
            return prevPermissions.map(rp => {
                if (rp.roleId === roleId) {
                    const newPermissions = new Set(rp.permissions);
                    if (newPermissions.has(permission.key)) {
                        newPermissions.delete(permission.key);
                    } else {
                        newPermissions.add(permission.key);
                    }
                    return { ...rp, permissions: newPermissions };
                }
                return rp;
            });
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const requestBody = {
                name,
                description,
                rolePermissions: rolePermissions.map(rp => ({
                    roleId: rp.roleId,
                    permissions: Array.from(rp.permissions)
                }))
            };

            await axios.post(`/teams/${teamId}/categories/create`, requestBody, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                }
            });
            navigate(`/teams/${teamId}`);
        } catch (error) {
            console.error('카테고리 생성 실패:', error);
        }
    };

    if (!teamId) {
        return <div>팀 ID가 필요합니다.</div>;
    }

    return (
        <div className="create-category-container">
            <h2>새 카테고리 생성</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>카테고리 이름</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>설명</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>
                <div className="permissions-section">
                    <h3>역할별 권한 설정</h3>
                    {teamRoles.length > 0 ? (
                        teamRoles.map(role => (
                            <div key={role.id} className="role-permissions">
                                <h4>{role.name}</h4>
                                <div className="permissions-grid">
                                    {Object.values(CategoryPermision).map(permission => (
                                        <label key={permission.key} className="permission-checkbox">
                                            <input
                                                type="checkbox"
                                                checked={rolePermissions
                                                    .find(rp => rp.roleId === role.id)
                                                    ?.permissions.has(permission.key)}
                                                onChange={() => handlePermissionChange(role.id, permission)}
                                            />
                                            {permission.label}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        ))
                    ) : (
                        <p>역할 정보를 불러오는 중...</p>
                    )}
                </div>
                <button type="submit" className="submit-button">
                    카테고리 생성
                </button>
            </form>
        </div>
    );
};

export default CreateCategory;
