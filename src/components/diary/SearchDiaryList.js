import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from '../../api/axios';
import DiaryItem from '../diary/DiaryItem';
import { useNavigate } from 'react-router-dom';
import './SearchDiaryList.css';

const SearchDiaryList = ({ searchKeyword }) => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const keyword = searchKeyword;
  const searchType = queryParams.get('type') || 'BOTH';

  useEffect(() => {
    const fetchResults = async () => {
      if (!keyword || keyword.trim().length === 0) {
        setResults([]);
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get('/diary/search', {
          params: {
            q: keyword,
            type: searchType,
            page: 0,
            size: 20,
            sort: 'createdDate,desc'
          }
        });
        setResults(response.data.content || []);
      } catch (error) {
        console.error('검색 실패:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [keyword, searchType]);

  const getSearchTypeText = () => {
    switch (searchType) {
      case 'TITLE': return '제목';
      case 'CONTENT': return '내용';
      default: return '제목+내용';
    }
  };

  const handleDiaryClick = (diary) => {
    navigate(`/diary/${diary.diaryId || diary.id}`);
  };

  return (
    <div className="diary-search-list">
      {loading ? (
        <div className="loading-indicator">검색 중...</div>
      ) : results.length > 0 ? (
        <>
          <div className="search-info">
            <p>"{keyword}" {getSearchTypeText()} 검색 결과: {results.length}개</p>
          </div>

          <div className="diary-grid">
            {results.map(diary => (
              <DiaryItem
                key={diary.diaryId || diary.id}
                diary={diary}
                onClick={handleDiaryClick}
                highlight={keyword}
                showDate={true}
                isEmbedded={false}
              />
            ))}
          </div>
        </>
      ) : (
        <div className="no-results">
          {keyword ? `"${keyword}"에 대한 검색 결과가 없습니다` : "검색어를 입력해주세요"}
        </div>
      )}
    </div>
  );
};

export default SearchDiaryList;
