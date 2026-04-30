import './App.css';
import Login from './pages/auth/LoginPage';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Register from './pages/auth/RegisterPage';
import TestConnection from './TestConnection';
import { TeamProvider } from './contexts/TeamContext';
import Layout from './layouts/Layout';
import CreateTeam from './pages/CreateTeam';
import RecentPosts from './components/post/RecentPosts';
import CreateCategory from './pages/CreateCategory';
import CreatePost from './components/post/CreatePost';
import PostDetail from './pages/PostDetail';
import React from 'react';
import TeamInfo from './pages/TeamInfo';
import CategoryInfo from './pages/CategoryInfo';
import CreateRole from './pages/CreateRole';
import TeamJoinPage from './pages/TeamJoinPage';
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from './store/authSlice';
import SearchResults from './pages/SearchResults';
import MainPage from './pages/MainPage';
import AccountInfoPage from './pages/account/AccountInfoPage';
import MemberProfilePage from './pages/MemberProfilePage';
import DiaryPage from './pages/diary/DiaryPage';
import CreateDiary from './components/diary/CreateDiary';
import DiaryDetail from './pages/diary/DiaryDetailPage';
import AccountEditPage from './pages/account/AccountEditPage';
import PasswordVerificationPage from './pages/account/PasswordVerificationPage';

function App() {
  const isLoggedIn = useSelector(selectIsAuthenticated);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('accessToken') ||
      sessionStorage.getItem('accessToken');

    if (isLoggedIn && !token) {
      console.log('비정상 상태 감지: 로그인 상태지만 토큰 없음');
      localStorage.clear();
      sessionStorage.clear();
      window.location.replace('/login');
    }
  }, [isLoggedIn]);

  return (
    <Router>
      <TeamProvider>
        {isLoggedIn ? (
          <Layout>
            <Routes>
              <Route path='/' element={<MainPage />} />
              <Route path="/teams/:teamId/recent" element={<RecentPosts />} />
              <Route path="/teams/:teamId/category/:categoryId/recent" element={<RecentPosts />} />
              <Route path='/test' element={<TestConnection />} />
              <Route path="/create-team" element={<CreateTeam />} />
              <Route path='/teams/:teamId/category/create' element={<CreateCategory />} />
              <Route path='/teams/:teamId/posts/create' element={<CreatePost />} />
              <Route path="/teams/:teamId/category/:categoryId/posts/:postId" element={<PostDetail />} />
              <Route path='/teams/:teamId/category/:categoryId/posts/:postId/edit' element={<CreatePost />} />
              <Route path="/teams/:teamId/info" element={<TeamInfo />} />
              <Route path='/teams/:teamId/edit' element={<CreateTeam />} />
              <Route path="/teams/:teamId/category/:categoryId/info" element={<CategoryInfo />} />
              <Route path="/teams/:teamId/roles/:roleId/edit" element={<CreateRole />} />
              <Route path='/teams/:teamId/posts/search' element={<SearchResults />} />
              <Route path='/teams/:teamId/categories/:categoryId/edit' element={<CreateCategory />} />
              <Route path="/teams/:teamId/join" element={<TeamJoinPage />} />
              <Route path="/teams/:teamId/create-role" element={<CreateRole />} />
              <Route path="/teams/:teamId/category/:categoryId/search" element={<SearchResults />} />
              <Route path="/teams/:teamId/members/:teamMemberId" element={<MemberProfilePage />} />
              <Route path="/account-info" element={isLoggedIn ? <AccountInfoPage /> : <Navigate to="/login" />} />
              <Route path="/diary" element={<DiaryPage />} />
              <Route path='/diary/create' element={<CreateDiary />} />
              <Route path='/diary/:diaryId' element={<DiaryDetail />} />
              <Route path='/diary/:diaryId/edit' element={<CreateDiary />} />
              <Route path="/account/verify-password" element={<PasswordVerificationPage />} />
              <Route path="/account/edit" element={<AccountEditPage />} />
              <Route path="/diary/search" element={<SearchResults />} />
            </Routes>
          </Layout>
        ) : (
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        )}
      </TeamProvider>

    </Router>
  );
}

export default App;
