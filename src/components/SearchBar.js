import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import '../styles/SearchBar.css';

const SearchBar = () => {
  const [keyword, setKeyword] = useState('');
  const navigate = useNavigate();
  const {teamId} = useParams();

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/teams/${teamId}/posts/search?q=${encodeURIComponent(keyword)}`);
  };

  return (
    <form onSubmit={handleSearch} className="search-form">
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
    </form>
  );
};

export default SearchBar;