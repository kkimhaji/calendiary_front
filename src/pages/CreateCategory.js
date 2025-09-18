import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from '../api/axios';
import './CreateCategory.css';
import { CategoryPermission, getPermissionLabel } from '../constants/CategoryPermission';
import { useTeam } from '../contexts/TeamContext';

const CreateCategory = () => {
    const [rolePermissions, setRolePermissions] = useState([]);
    const navigate = useNavigate();
    const { teamId, categoryId } = useParams(); // URL에서 teamId 가져오기
    const { refreshCategories } = useTeam();
    const isEditMode = !!categoryId;
    const [formData, setFormData] = useState({
        name: '',
        description: ''
    });
    const [loading, setLoading] = useState(true);
    // 팀의 역할 목록 조회
    useEffect(() => {
        const fetchData = async () => {
            try {
                let rolesData = [];
                let categoryData = {};

                // 1. 수정 모드: 카테고리 정보와 권한을 한 번에 조회
                if (isEditMode) {
                    const categoryRes = await axios.get(`/teams/${teamId}/categories/${categoryId}`);
                    categoryData = categoryRes.data;
                    rolesData = categoryData.rolePermissions.map(rp => ({
                        roleId: rp.roleId,
                        roleName: rp.roleName,
                        permissions: new Set([...rp.permissions])
                    }));
                    setFormData({
                        name: categoryData.name,
                        description: categoryData.description || ''
                    });
                }
                // 2. 생성 모드: 역할 목록만 별도 조회
                else {
                    const rolesRes = await axios.get(`/teams/${teamId}/roles/get_roles`);
                    rolesData = rolesRes.data.map(role => ({
                        roleId: role.id,
                        roleName: role.name,
                        permissions: new Set() // 초기 빈 권한
                    }));
                }

                setRolePermissions(rolesData);

            } catch (error) {
                console.error('데이터 불러오기 실패:', error);
                navigate(-1);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [teamId, categoryId, isEditMode]);

    const handlePermissionChange = (roleId, permissionKey) => {
        setRolePermissions(prev =>
            prev.map(role => {
                if (role.roleId === roleId) {
                    //완전히 새로운 Set 생성 (Deep Copy)
                    const updatedPermissions = new Set(role.permissions);
                    updatedPermissions.has(permissionKey)
                        ? updatedPermissions.delete(permissionKey)
                        : updatedPermissions.add(permissionKey);
                    return { ...role, permissions: updatedPermissions };
                }
                return role;
            })
        );
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                rolePermissions: rolePermissions.map(rp => ({
                    roleId: rp.roleId,
                    permissions: Array.from(rp.permissions)
                }))
            };

            const endpoint = isEditMode
                ? `/teams/${teamId}/categories/${categoryId}/update`
                : `/teams/${teamId}/categories/create`;

            const method = isEditMode ? 'put' : 'post';
            const response = await axios[method](endpoint, payload);

            refreshCategories();
            navigate(`/teams/${teamId}/category/${response.data.id}/recent`);
        } catch (error) {
            console.error('저장 실패:', error);
        }
    };

    if (!teamId) {
        return <div>팀 ID가 필요합니다.</div>;
    }

    return (
        <div className="category-form-container">
            <h2>{isEditMode ? '카테고리 수정' : '새 카테고리 생성'}</h2>
            <form onSubmit={handleSubmit}>
                {/* 기본 정보 입력 섹션 */}
                <div className="form-group">
                    <label>카테고리 이름</label>
                    <input
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>설명</label>
                    <textarea
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                    />
                </div>

                {/* 역할별 권한 설정 섹션 */}
                <div className="role-permissions-section">
                    <h3>역할별 권한 설정</h3>
                    {rolePermissions.map(role => (
                        <div key={role.roleId} className="role-permissions">
                            <h4>{role.roleName}</h4>
                            <div className="permissions-grid">
                                {Object.values(CategoryPermission).map(permission => (
                                    <label key={permission.key} className="permission-checkbox">
                                        <input
                                            type="checkbox"
                                            checked={role.permissions.has(permission.key)}
                                            onChange={() => handlePermissionChange(role.roleId, permission.key)}
                                        />
                                        {permission.label}
                                    </label>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <button type="submit" className="submit-btn">
                    {isEditMode ? '수정 완료' : '카테고리 생성'}
                </button>
            </form>
        </div>
    );
};

// Set.prototype.toggle 확장
Set.prototype.toggle = function (value) {
    const newSet = new Set(this);
    newSet.has(value) ? newSet.delete(value) : newSet.add(value);
    return newSet;
};

export default CreateCategory;
