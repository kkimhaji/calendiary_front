import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Tabs, Tab } from '../components/Tabs';
import PostItem from '../components/post/PostItem';
import CommentItem from '../components/comment/CommentItem';
import axios from '../api/axios';
import './MemberProfilePage.css';

const MemberProfilePage = () => {
  const { teamId, memberId } = useParams();
  const [activeTab, setActiveTab] = useState('posts');
  const [memberInfo, setMemberInfo] = useState(null);
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // 멤버 정보 로드
  useEffect(() => {
    const fetchMemberInfo = async () => {
      try {
        const memberInfo = await axios.get(`/member/${memberId}/teams/${teamId}`);
        setMemberInfo(memberInfo.data);
      } catch (error) {
        console.error('멤버 정보 로드 실패:', error);
      }
    };

    fetchMemberInfo();
  }, [teamId, memberId]);

  // 탭에 따라 게시글 또는 댓글 로드
  useEffect(() => {
    setPage(0);
    setHasMore(true);

    if (activeTab === 'posts') {
      loadPosts(0, true);
    } else {
      loadComments(0, true);
    }
  }, [activeTab, teamId, memberId]);

  // 게시글 로드
  const loadPosts = async (pageNum, reset = false) => {
    try {
      setLoading(true);
      const response = await axios.get(`/member/${memberId}/teams/${teamId}/posts?page=${pageNum}&size=10`);

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
      const response = await axios.get(`/member/${memberId}/teams/${teamId}/comments?page=${pageNum}&size=10`);

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
