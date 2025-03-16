import { useState, useEffect } from 'react';
import axios from 'axios';

export const usePermissions = (permissions, targetId) => {
  const [permissionResults, setPermissionResults] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkPermissions = async () => {
      if (!targetId || permissions.length === 0) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const response = await axios.get('/permissions-check', {
          params: {
            permissions: permissions,
            targetId: targetId
          },
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
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
        console.log("permission results: ", response.data);
        setPermissionResults(response.data);
        setError(null);
      } catch (err) {
        console.error('권한 확인 실패:', err);
        setError('권한 확인에 실패했습니다');
        
        // 실패 시 모든 권한을 false로 설정
        const failedResults = {};
        permissions.forEach(perm => {
          failedResults[perm] = false;
        });
        setPermissionResults(failedResults);
      } finally {
        setLoading(false);
      }
    };

    checkPermissions();
  }, [permissions.join(','), targetId]);

  return [permissionResults, loading, error];
};
