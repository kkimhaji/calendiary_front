import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from '../api/axios';
import PostItem from './PostItem';

const SearchPostList = ({ keyword }) => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const {teamId} = useParams();

  useEffect(() => {
    const fetchResults = async () => {
      try {
          const response = await axios.get(
              `/teams/${teamId}/posts/search`,
              { params: { 
                q: keyword,
                page: 0,
                size: 20,
                sort: 'createdDate,desc'
               } }
          );
          setResults(response.data.content || []);
      } catch (error) {
          console.error('검색 실패:', error);
        } finally {
          setLoading(false);
        }
  };
  const debounceTimer = setTimeout(() => {
    if (keyword && keyword.trim().length > 0) {  // 빈 검색어 방지
      fetchResults();
    }
  }, 300);

  return () => clearTimeout(debounceTimer);
}, [teamId, keyword]);


  return (
    <div className="post-list">
    {loading ? (
      <div className="loading-indicator">검색 중...</div>
    ) : results.length > 0 ? (
      results.map(post => (
        <PostItem 
          key={post.id} 
          post={post}
          teamId={teamId}
          highlight={keyword}  // 하이라이트 기능 활성화
        />
      ))
    ) : (
      <div className="no-results">
        {keyword ? `"${keyword}"에 대한 검색 결과가 없습니다` : "검색어를 입력해주세요"}
      </div>
    )}
  </div>
  );
};

export default SearchPostList;
