import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './SearchBar.css';

const SearchBar = () => {
  const [keyword, setKeyword] = useState(queryParams.get('q') || '');
  const navigate = useNavigate();
  const { teamId, categoryId } = useParams();
  const [searchType, setSearchType] = useState(queryParams.get('type') || 'BOTH');

  const handleSearch = (e) => {
    e.preventDefault();
    const basePath = categoryId
      ? `/teams/${teamId}/category/${categoryId}/search`
      : `/teams/${teamId}/posts/search`;

    navigate(`${basePath}?q=${encodeURIComponent(keyword)}&type=${searchType}`);
  };

  return (
    <form onSubmit={handleSearch} className="search-form">
      <div className="search-container">
        <select
          value={searchType}
          onChange={(e) => setSearchType(e.target.value)}
          className="search-type-select"
        >
          <option value="BOTH">제목+내용</option>
          <option value="TITLE">제목만</option>
          <option value="CONTENT">내용만</option>
        </select>

        <div className="search-input-wrapper">
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="검색어를 입력하세요"
            className="search-input"
          />
          <button type="submit" className="search-button">
            검색
          </button>
        </div>
      </div>
    </form>
  );
};

export default SearchBar;