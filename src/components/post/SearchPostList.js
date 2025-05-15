import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import axios from '../../api/axios';
import PostItem from './PostItem';

const SearchPostList = ({ searchKeyword }) => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const { teamId, categoryId } = useParams();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const keyword = searchKeyword;
  // const keyword = queryParams.get('q') || '';
  const searchType = queryParams.get('type') || 'BOTH';

  useEffect(() => {
    const fetchResults = async () => {
      if (!keyword || keyword.trim().length === 0) {
        setResults([]);
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get(
          `/teams/${teamId}/posts/search`,
          {
            params: {
              q: keyword,
              searchType: searchType, // 검색 타입 파라미터 추가
              categoryId: categoryId || null,
              page: 0,
              size: 20,
              sort: 'createdDate,desc'
            }
          }
        );
        setResults(response.data.content || []);
      } catch (error) {
        console.error('검색 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [teamId, keyword, categoryId, searchType]);

  const getSearchTypeText = () => {
    switch (searchType) {
      case 'TITLE': return '제목';
      case 'CONTENT': return '내용';
      default: return '제목+내용';
    }
  };

  return (
    <div className="post-list">
      {loading ? (
        <div className="loading-indicator">검색 중...</div>
      ) : results.length > 0 ? (
        <>
          <div className="search-info">
            <p>"{keyword}" {getSearchTypeText()} 검색 결과: {results.length}개</p>
          </div>

          {results.map(post => (
            <PostItem
              key={post.id}
              post={post}
              teamId={teamId}
              highlight={keyword}  // 하이라이트 기능 활성화
            />
          ))}
        </>
      ) : (
        <div className="no-results">
          {keyword ? `"${keyword}"에 대한 검색 결과가 없습니다` : "검색어를 입력해주세요"}
        </div>
      )}
    </div>
  );
};

export default SearchPostList;
