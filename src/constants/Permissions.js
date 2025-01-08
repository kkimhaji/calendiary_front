export const TeamPermission = {
    VIEW_POST: {
        key: 'VIEW_POST',
        label: '게시글 조회',
        position: 0
    },
    CREATE_POST: {
        key: 'CREATE_POST',
        label: '게시글 작성',
        position: 1
    },
    EDIT_POST: {
        key: 'EDIT_POST',
        label: '게시글 수정',
        position: 2
    },
    DELETE_POST: {
        key: 'DELETE_POST',
        label: '게시글 삭제',
        position: 3
    },
    MANAGE_MEMBERS: {
        key: 'MANAGE_MEMBERS',
        label: '멤버 관리',
        position: 4
    },
    MANAGE_ROLES: {
        key: 'MANAGE_ROLES',
        label: '역할 관리',
        position: 5
    },
    CREATE_COMMENT: {
        key: 'CREATE_COMMENT',
        label: '댓글 작성',
        position: 6
    },
    DELETE_COMMENT: {
        key: 'DELETE_COMMENT',
        label: '댓글 삭제',
        position: 7
    },
    MANAGE_CATEGORIES: {
        key: 'MANAGE_CATEGORIES',
        label: '카테고리 관리',
        position: 8
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
