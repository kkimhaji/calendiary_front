import { useState, useEffect } from 'react';
import axios from '../api/axios';

export const usePermissions = (permissions = [], targetId) => {
  const [permissionResults, setPermissionResults] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkPermissions = async () => {
      // 빈 배열이거나 undefined/null 체크
      if (!targetId || !permissions || (Array.isArray(permissions) && permissions.length === 0)) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // permissions를 확실하게 배열로 변환
        const permissionsArray = Array.isArray(permissions) ? permissions : [permissions];
        
        const response = await axios.get('/permissions-check', {
          params: {
            permissions: permissionsArray,
            targetId: targetId
          },
          paramsSerializer: params => {
            return Object.entries(params)
              .flatMap(([key, values]) => {
                return Array.isArray(values)
                  ? values.map(value => `${key}=${value}`)
                  : [`${key}=${values}`];
              })
              .join('&');
          }
        });

        setPermissionResults(response.data);
        setError(null);
      } catch (err) {
        console.error('권한 확인 실패:', err);
        setError('권한 확인에 실패했습니다');

        // 실패 시 모든 권한을 false로 설정
        const failedResults = {};
        
        // 여기서도 permissions를 배열로 처리
        const permissionsArray = Array.isArray(permissions) ? permissions : [permissions];
        permissionsArray.forEach(perm => {
          failedResults[perm] = false;
        });
        
        setPermissionResults(failedResults);
      } finally {
        setLoading(false);
      }
    };

    checkPermissions();
    
    // 의존성 배열에서 안전하게 처리
  }, [targetId, Array.isArray(permissions) ? permissions.join(',') : String(permissions)]);

  return [permissionResults, loading, error];
};
