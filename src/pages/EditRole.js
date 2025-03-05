import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/EditRole.css';
import { TeamPermission } from '../constants/TeamPermissions';

const EditRole = () => {
    const { teamId, roleId } = useParams();
    const navigate = useNavigate();
    const [role, setRole] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        permissions: new Set()
    });

    // 역할 정보 불러오기
    useEffect(() => {
        axios.get(`/teams/${teamId}/roles/${roleId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
            }
        })
            .then(res => {
                setRole(res.data);
                const initialPermissions = new Set(
                    res.data.permissions.map(p => TeamPermission[p] || p)
                );
                setFormData({
                    name: res.data.roleName,
                    description: res.data.description,
                    permissions: initialPermissions
                });
            });
    }, [teamId, roleId]);

    // 폼 제출 핸들러
    const handleSubmit = (e) => {
        e.preventDefault();
        const permissionsToSend = Array.from(formData.permissions)
            .map(p => typeof p === 'object' ? p.key : p);
        axios.put(`/roles/teams/${teamId}/roles/${roleId}`, {
            roleName: formData.name,
            description: formData.description,
            permissions: permissionsToSend
        }).then(() => navigate(`/teams/${teamId}/info`));
    };

    const handlePermissionChange = (permKey) => {
        const newPermissions = new Set(formData.permissions);
        const perm = TeamPermission[permKey] || permKey;

        if (newPermissions.has(perm)) {
            newPermissions.delete(perm);
        } else {
            newPermissions.add(perm);
        }
        setFormData({ ...formData, permissions: newPermissions });
    };

    return (
        <div className="role-edit-container">
            <h2>역할 수정: {role?.roleName}</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>역할 이름</label>
                    <input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                </div>
                <div className="form-group">
                    <label>설명</label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                </div>
                <div className="permissions-section">
                    <h3>권한 설정</h3>
                    {Object.values(TeamPermission).map(perm => (
                        <label key={perm.key}>
                            <input
                                type="checkbox"
                                checked={formData.permissions.has(perm.key)}
                                onChange={() => handlePermissionChange(perm.key)}
                            />
                            {perm.label}
                        </label>
                    ))}
                </div>

                <div className="members-section">
                    <h3>소속 멤버</h3>
                    {role?.members?.map(member => (
                        <div key={member.id} className="member-item">
                            <span>{member.teamNickname}</span>
                            <span>{member.email}</span>
                        </div>
                    ))}
                </div>
                <button type="submit">저장</button>
            </form>
        </div>
    );
};

export default EditRole;