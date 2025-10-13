import React from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import SearchPostList from '../components/post/SearchPostList';
import SearchDiaryList from '../components/diary/SearchDiaryList';
import './SearchResults.css';

const SearchResults = () => {
  const { teamId, categoryId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const keyword = searchParams.get('q');
  
  // 현재 경로가 다이어리 검색인지 판단
  const isDiarySearch = location.pathname.includes('/diary/search');

  const handleBackToList = () => {
    if (isDiarySearch) {
      navigate('/diary');
    } else if (categoryId) {
      navigate(`/teams/${teamId}/category/${categoryId}/recent`);
    } else {
      navigate(`/teams/${teamId}/recent`);
    }
  };
  
  return (
    <div className="search-results-page">
        <div className="search-header">
          <h2>'{keyword}' 검색 결과</h2>

          <button 
            className="back-button"
            onClick={handleBackToList}
            aria-label="목록으로"
          >
            ← 목록으로
          </button>
      </div>
      
      {isDiarySearch ? (
        <SearchDiaryList searchKeyword={keyword} />
      ) : (
        <SearchPostList
          teamId={teamId}
          categoryId={categoryId}
          searchKeyword={keyword}
        />
      )}
    </div>
  );
};

export default SearchResults;
