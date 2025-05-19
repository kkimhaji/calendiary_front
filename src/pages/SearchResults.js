import React from 'react';
import { useLocation, useParams } from 'react-router-dom';
import SearchPostList from '../components/post/SearchPostList';

const SearchResults = () => {
  const { teamId, categoryId } = useParams();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const keyword = searchParams.get('q');

  return (
    <div className="search-results-page">
      <h2>'{keyword}' 검색 결과</h2>
      <SearchPostList
        teamId={teamId}
        categoryId={categoryId}
        searchKeyword={keyword} />
    </div>
  );
};

export default SearchResults;