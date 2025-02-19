export const CategoryPermision = {
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
    DELETE_POST:{
        key: 'DELETE_POST',
        label: '게시글 삭제',
        position: 2
    },
    CREATE_COMMENT:{
        key: 'CREATE_COMMENT',
        label: '댓글 생성',
        position: 3
    },
    DELETE_COMMENT:{
        key: 'DELETE_COMMENT',
        label: '댓글 삭제',
        position: 4
    }
};

export const getPermissionLabel = (permission) => {
    return CategoryPermision[permission]?.label || permission;
};

export const sortPermissions = (permissions) => {
    return [...permissions].sort((a, b) => 
        CategoryPermision[a].position - CategoryPermision[b].position
    );
};
