import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Tabs, Tab } from '../components/common/Tabs';
import PostItem from '../components/post/PostItem';
import CommentItem from '../components/comment/CommentItem';
import axios from '../api/axios';
import './MemberProfilePage.css';

const MemberProfilePage = () => {
  const { teamId, teamMemberId } = useParams();
  const [activeTab, setActiveTab] = useState('posts');
  const [memberInfo, setMemberInfo] = useState(null);
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isDeletedMember, setIsDeletedMember] = useState(false);
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    // teamMemberId가 null, undefined, 'null', 'undefined'인 경우 탈퇴 멤버로 처리
    if (!teamMemberId ||
      teamMemberId === 'null' ||
      teamMemberId === 'undefined' ||
      teamMemberId === 'NaN') {
      setIsDeletedMember(true);
      setLoading(false);
      return;
    }

    // 숫자가 아닌 경우도 탈퇴 멤버로 처리
    if (isNaN(Number(teamMemberId))) {
      setIsDeletedMember(true);
      setLoading(false);
      return;
    }

    setIsDeletedMember(false);
  }, [teamMemberId]);

  // 멤버 정보 로드
  useEffect(() => {
    if (isDeletedMember) {
      setLoading(false);
      return;
    }
    const fetchMemberInfo = async () => {
      try {
        const memberInfo = await axios.get(`/team/${teamId}/member/${teamMemberId}`);
        setMemberInfo(memberInfo.data);
      } catch (error) {
        console.error('멤버 정보 로드 실패:', error);
      }
    };

    fetchMemberInfo();
  }, [teamId, teamMemberId]);

  // 탭에 따라 게시글 또는 댓글 로드
  useEffect(() => {
    if (isDeletedMember) {
      return;
    }

    setPage(0);
    setHasMore(true);

    if (activeTab === 'posts') {
      loadPosts(0, true);
    } else {
      loadComments(0, true);
    }
  }, [activeTab, teamId, teamMemberId]);

  // 게시글 로드
  const loadPosts = async (pageNum, reset = false) => {
    try {
      setLoading(true);
      const response = await axios.get(`/team/${teamId}/member/${teamMemberId}/posts?page=${pageNum}&size=10`);

      if (reset) {
        setPosts(response.data.content);
      } else {
        setPosts(prev => [...prev, ...response.data.content]);
      }

      setHasMore(!response.data.last);
      setLoading(false);
    } catch (error) {
      console.error('게시글 로드 실패:', error);
      setLoading(false);
    }
  };

  // 댓글 로드
  const loadComments = async (pageNum, reset = false) => {
    try {
      setLoading(true);
      const response = await axios.get(`/team/${teamId}/member/${teamMemberId}/comments?page=${pageNum}&size=10`);

      if (reset) {
        setComments(response.data.content);
      } else {
        setComments(prev => [...prev, ...response.data.content]);
      }

      setHasMore(!response.data.last);
      setLoading(false);
    } catch (error) {
      console.error('댓글 로드 실패:', error);
      setLoading(false);
    }
  };

  // 더 보기 버튼 클릭 핸들러
  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);

    if (activeTab === 'posts') {
      loadPosts(nextPage);
    } else {
      loadComments(nextPage);
    }
  };

  const handleGoBack = () => {
    navigate(`/teams/${teamId}/info`);
  };

  // 탈퇴한 멤버 화면
  if (isDeletedMember) {
    return (
      <div className="member-profile-container">
        <div className="deleted-member-notice">
          <div className="notice-icon">👤</div>
          <h2>탈퇴한 멤버입니다</h2>
          <p>이 멤버는 더 이상 팀에 속해있지 않습니다.</p>
          <button className="back-button" onClick={handleGoBack}>
            팀 정보로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  // 에러 화면
  if (error) {
    return (
      <div className="member-profile-container">
        <div className="error-notice">
          <div className="notice-icon">⚠️</div>
          <h2>오류가 발생했습니다</h2>
          <p>{error}</p>
          <button className="back-button" onClick={handleGoBack}>
            팀 정보로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  // 로딩 화면
  if (loading && !memberInfo) {
    return (
      <div className="member-profile-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>멤버 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="member-profile-container">
      {memberInfo && (
        <div className="member-info-header">
          <h1>{memberInfo.teamNickname}님의 활동</h1>
          <div className="member-details">
            <span className='email'>{memberInfo.email}</span>
            <span className="member-role">{memberInfo.roleName}</span>
            <span className="member-since">가입일: {new Date(memberInfo.joinedAt).toLocaleDateString()}</span>
          </div>
        </div>
      )}

      <Tabs activeTab={activeTab} onChange={setActiveTab}>
        <Tab id="posts" label="작성한 게시글">
          <div className="posts-list">
            {posts.length > 0 ? (
              posts.map(post => (
                <PostItem
                  key={post.id}
                  post={post}
                  categoryId={post.categoryId}
                  teamId={teamId}
                  showCategory={true}
                />
              ))
            ) : (
              <div className="no-content">작성한 게시글이 없습니다.</div>
            )}
          </div>
        </Tab>

        <Tab id="comments" label="작성한 댓글">
          <div className="comments-list">
            {comments.length > 0 ? (
              comments.map(comment => (
                <div key={comment.id} className="comment-with-post">
                  <div className="parent-post">
                    게시글: <Link to={`/teams/${teamId}/category/${comment.categoryId}/posts/${comment.postId}`}>
                      {comment.postTitle}
                    </Link>
                  </div>
                  <CommentItem comment={comment} />
                </div>
              ))
            ) : (
              <div className="no-content">작성한 댓글이 없습니다.</div>
            )}
          </div>
        </Tab>
      </Tabs>

      {hasMore && (
        <button
          className="load-more-button"
          onClick={handleLoadMore}
          disabled={loading}
        >
          {loading ? '로딩 중...' : '더 보기'}
        </button>
      )}
    </div>
  );
};

export default MemberProfilePage;