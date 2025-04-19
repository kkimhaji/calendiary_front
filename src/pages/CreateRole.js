import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import './CreateRole.css';
import { TeamPermission } from '../constants/TeamPermissions';
import MemberList from '../components/team/MemberList';

const CreateRole = () => {
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
    const isEditMode = !!roleId;
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [deleteError, setDeleteError] = useState('');

    // 역할 정보 불러오기
    useEffect(() => {
        if (!isEditMode) return;

        const fetchData = async () => {
            try {
                const roleRes = await axios.get(`/teams/${teamId}/roles/${roleId}`);
                setRole(roleRes.data);
                setFormData({
                    name: roleRes.data.name,
                    description: roleRes.data.description,
                    permissions: new Set(roleRes.data.permissions)
                });

                const membersRes = await axios.get(`/team/${teamId}/members`);
                setAllMembers(membersRes.data);
            } catch (error) {
                console.error('데이터 불러오기 실패:', error);
            }
        };
        fetchData();
    }, [teamId, roleId, isEditMode]);

    const handleDeleteRole = async () => {
        setDeleteLoading(true);
        setDeleteError('');

        try {
            await axios.delete(`/teams/${teamId}/roles/manage/delete/${roleId}`);
            navigate(`/teams/${teamId}/info`, {
                state: { message: "역할이 성공적으로 삭제되었습니다." }
            });
        } catch (err) {
            console.error("역할 삭제 실패:", err);

            if (err.response?.status === 403) {
                setDeleteError("이 역할을 삭제할 권한이 없습니다.");
            } else if (err.response?.status === 409) {
                setDeleteError("이 역할을 가진 팀원이 있어 삭제할 수 없습니다.");
            } else {
                setDeleteError("역할 삭제 중 오류가 발생했습니다.");
            }
            setShowDeleteModal(false);
        } finally {
            setDeleteLoading(false);
        }
    };

    // 폼 제출 핸들러
    const handleSubmit = async (e) => {
        e.preventDefault();
        const permissionsToSend = Array.from(formData.permissions);
        const payload = {
            roleName: formData.name,
            description: formData.description,
            permissions: permissionsToSend
        };

        try {
            if (isEditMode) {
                await axios.put(`/teams/${teamId}/roles/${roleId}/update`, payload);
            } else {
                const response = await axios.post(`teams/${teamId}/roles/manage/create`, payload);
            }
            navigate(`/teams/${teamId}/info`)

        } catch (error) {
            console.error(error);
        }
    };

    // 멤버 제거 핸들러
    const handleRemoveMember = async (memberId) => {
        try {
            await axios.delete(`/teams/${teamId}/roles/${roleId}/members/${memberId}`);
            // 멤버 목록 업데이트
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
            );
            // 업데이트된 멤버 목록 다시 불러오기
            const res = await axios.get(`/teams/${teamId}/roles/${roleId}`);
            setRole(res.data);
            setShowAddMemberModal(false);
            setSelectedMembers(new Set());
        } catch (error) {
            console.error('멤버 추가 실패:', error);
        }
    };


    const handlePermissionChange = (permKey) => {
        const newPermissions = new Set(formData.permissions);
        // 문자열 기반으로 직접 추가/제거
        if (newPermissions.has(permKey)) {
            newPermissions.delete(permKey);
        } else {
            newPermissions.add(permKey);
        }
        setFormData({ ...formData, permissions: newPermissions });
    };

    return (
        <div className="create-role-container">
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
            {/* 삭제 확인 모달 추가 */}
            {showDeleteModal && (
                <div className="modal-overlay">
                    <div className="delete-modal">
                        <h3>역할 삭제</h3>
                        <p>
                            정말로 <strong>{formData.name}</strong> 역할을 삭제하시겠습니까?
                        </p>
                        <p className="warning-text">
                            이 작업은 되돌릴 수 없으며, 이 역할을 가진 팀원이 있는 경우 삭제할 수 없습니다.
                        </p>
                        {deleteError && <div className="error-message">{deleteError}</div>}
                        <div className="modal-buttons">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                disabled={deleteLoading}
                            >
                                취소
                            </button>
                            <button
                                className="delete-button"
                                onClick={handleDeleteRole}
                                disabled={deleteLoading}
                            >
                                {deleteLoading ? '삭제 중...' : '삭제'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <h2>{isEditMode ? `역할 수정: ${role?.name}` : '새 역할 생성'}</h2>
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
                <div className="role-permissions-section">
                    {Object.values(TeamPermission).map(perm => (
                        <label key={perm.key}>
                            <input
                                type="checkbox"
                                // 권한 키(문자열)로 체크 여부 확인
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
                        roleId={roleId} // 역할별 멤버 필터링을 위해 전달
                        onRemoveMember={handleRemoveMember}
                        showActions={true}
                    />
                </div>
                {/* 버튼 그룹 - 삭제 버튼 추가 */}
                <div className="action-buttons">
                    {/* 삭제 버튼은 편집 모드에서만 표시 */}
                    {isEditMode && (
                        <button
                            type="button"
                            className="delete-button"
                            onClick={() => setShowDeleteModal(true)}
                        >
                            역할 삭제
                        </button>
                    )}
                    <button type="submit">저장</button>
                </div>
            </form>
        </div>
    );
};

export default CreateRole;