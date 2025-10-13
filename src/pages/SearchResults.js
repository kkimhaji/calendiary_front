import React from 'react';
import { useLocation, useParams } from 'react-router-dom';
import SearchPostList from '../components/post/SearchPostList';
import SearchDiaryList from '../components/diary/SearchDiaryList';

const SearchResults = () => {
  const { teamId, categoryId } = useParams();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const keyword = searchParams.get('q');
  
  // 현재 경로가 다이어리 검색인지 판단
  const isDiarySearch = location.pathname.includes('/diary/search');

  return (
    <div className="search-results-page">
      <h2>'{keyword}' 검색 결과</h2>
      
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
