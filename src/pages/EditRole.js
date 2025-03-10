import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/EditRole.css';
import { TeamPermission } from '../constants/TeamPermissions';
import MemberList from '../components/MemberList';

const EditRole = () => {
    const { teamId, roleId } = useParams();
    const navigate = useNavigate();
    const [role, setRole] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        permissions: new Set()
    });
    const [showAddMemberModal, setShowAddMemberModal] = useState(false);
    const [allMembers, setAllMembers] = useState([]);
    const [selectedMembers, setSelectedMembers] = useState(new Set());

    // 역할 정보 불러오기
    useEffect(() => {
        const fetchData = async () => {
            try {
                const roleRes = await axios.get(`/teams/${teamId}/roles/${roleId}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
                });
                setRole(roleRes.data);
                setFormData({
                    name: roleRes.data.roleName,
                    description: roleRes.data.description,
                    permissions: new Set(roleRes.data.permissions)
                });

                const membersRes = await axios.get(`/team/${teamId}/members`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
                });
                setAllMembers(membersRes.data);
            } catch (error) {
                console.error('데이터 불러오기 실패:', error);
            }
        };
        fetchData();
    }, [teamId, roleId]);

    // 폼 제출 핸들러
    const handleSubmit = (e) => {
        e.preventDefault();
        const permissionsToSend = Array.from(formData.permissions); 
        axios.put(`/teams/${teamId}/roles/${roleId}/update`, {
            roleName: formData.name,
            description: formData.description,
            permissions: permissionsToSend
        }, {
            headers:{
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
            },
        }).then(() => navigate(`/teams/${teamId}/info`));
    };

// 멤버 제거 핸들러
const handleRemoveMember = async (memberId) => {
    try {
        await axios.delete(`/teams/${teamId}/roles/${roleId}/members/${memberId}`, {
            headers: { 
                Authorization: `Bearer ${localStorage.getItem('accessToken')}` 
            }
        });
        // ✅ 멤버 목록 업데이트
        setRole(prev => ({
            ...prev,
            members: prev.members.filter(m => m.id !== memberId)
        }));
    } catch (error) {
        console.error('멤버 제거 실패:', error);
    }
};

 // 멤버 추가 모달 핸들러
 const handleAddMembers = async () => {
    try {
        await axios.post(
            `/teams/${teamId}/roles/manage/member`,
            { 
                roleId: roleId,
                memberIds: Array.from(selectedMembers) 
            },
            { 
                headers: { 
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}` 
                } 
            }
        );
        // ✅ 업데이트된 멤버 목록 다시 불러오기
        const res = await axios.get(`/teams/${teamId}/roles/${roleId}`, {
            headers: { 
                Authorization: `Bearer ${localStorage.getItem('accessToken')}` 
            }
        });
        setRole(res.data);
        setShowAddMemberModal(false);
        setSelectedMembers(new Set());
    } catch (error) {
        console.error('멤버 추가 실패:', error);
    }
};


    const handlePermissionChange = (permKey) => {
        const newPermissions = new Set(formData.permissions);
        // ✅ 문자열 기반으로 직접 추가/제거
        if (newPermissions.has(permKey)) { 
            newPermissions.delete(permKey);
        } else {
            newPermissions.add(permKey);
        }
        setFormData({ ...formData, permissions: newPermissions });
    };

    return (
        <div className="role-edit-container">
             {showAddMemberModal && (
                <div className="modal-overlay">
                    <div className="member-select-modal">
                    <h3>멤버 선택</h3>
                        <MemberList
                            teamId={teamId}
                            onSelectMember={(memberId, isSelected) => {
                                const newSelected = new Set(selectedMembers);
                                isSelected 
                                    ? newSelected.add(memberId) 
                                    : newSelected.delete(memberId);
                                setSelectedMembers(newSelected);
                            }}
                            showCheckboxes={true}
                        />
                        <div className="modal-buttons">
                            <button onClick={() => setShowAddMemberModal(false)}>취소</button>
                            <button onClick={handleAddMembers}>추가</button>
                        </div>
                    </div>
                </div>
            )}

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
                <h3>권한 설정</h3>
                <div className="role-edit-permissions-section">
                    {Object.values(TeamPermission).map(perm => (
                        <label key={perm.key}>
                            <input
                                type="checkbox"
                                // ✅ 권한 키(문자열)로 체크 여부 확인
                                checked={formData.permissions.has(perm.key)} 
                                onChange={() => handlePermissionChange(perm.key)}
                            />
                            {perm.label}
                        </label>
                    ))}
                </div>

                <div className="members-section">
                    <div className="members-header">
                        <h3>소속 멤버</h3>
                        <button 
                            type="button"
                            className="btn-add-members"
                            onClick={() => setShowAddMemberModal(true)}
                        >
                            멤버 추가
                        </button>
                    </div>
                    <MemberList
                        teamId={teamId}
                        roleId={roleId} // ✅ 역할별 멤버 필터링을 위해 전달
                        onRemoveMember={handleRemoveMember}
                        showActions={true}
                    />
                </div>
                <button type="submit">저장</button>
            </form>
        </div>
    );
};

export default EditRole;