export const TeamPermission = {
    MANAGE_MEMBERS: {
        key: 'MANAGE_MEMBERS',
        label: '팀 멤버 관리',
        position: 0
    },
    MANAGE_ROLES: {
        key: 'MANAGE_ROLES',
        label: '팀 역할 관리',
        position: 1
    },
    MANAGE_CATEGORIES: {
        key: 'MANAGE_CATEGORIES',
        label: '팀 카테고리 관리',
        position: 2
    }
};

export const getPermissionLabel = (permission) => {
    return TeamPermission[permission]?.label || permission;
};

export const sortPermissions = (permissions) => {
    return [...permissions].sort((a, b) => 
        TeamPermission[a].position - TeamPermission[b].position
    );
};
