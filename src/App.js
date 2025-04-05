import logo from './logo.svg';
import './App.css';
import Login from './pages/Login';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Register from './pages/Register';
import TestConnection from './TestConnection';
import { TeamProvider } from './contexts/TeamContext';
import Layout from './components/Layout/Layout';
import CreateTeam from './pages/CreateTeam';
import RecentPosts from './components/Layout/RecentPosts';
import CreateCategory from './pages/CreateCategory';
import CreatePost from './pages/CreatePost';
import PostDetail from './pages/PostDetail';
import React from 'react';
import TeamInfo from './pages/TeamInfo';
import CategoryInfo from './pages/CategoryInfo';
import CreateRole from './pages/CreateRole';
import TeamJoinPage from './pages/TeamJoinPage';
import authService from './services/authService';
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from './store/authSlice';
import SearchResults from './pages/SearchResults';
import MainPage from './pages/MainPage';
import AccountInfoPage from './pages/AccountInfoPage';

function App() {
  const isLoggedIn = useSelector(selectIsAuthenticated);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const attemptAutoLogin = async () => {
      try {
        const success = await authService.attemptAutoLogin();
        setIsAuthenticated(success);
      } catch (error) {
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };
    
    attemptAutoLogin();
  }, []);
  
  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <TeamProvider>
        {isLoggedIn ? (
          <Layout>
            <Routes>
              <Route path='/' element={ <MainPage />} />
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
              <Route path="/teams/:teamId/roles/:roleId/edit" element={<CreateRole />}/>
              <Route path='/teams/:teamId/posts/search' element={<SearchResults />}/>
              <Route path='/teams/:teamId/categories/:categoryId/edit' element={<CreateCategory />}/>
              <Route path="/teams/:teamId/join" element={<TeamJoinPage />} />
              <Route path="/teams/:teamId/create-role" element={<CreateRole />} />
              <Route path="/teams/:teamId/category/:categoryId/search" element={<SearchResults />} />
              <Route path="/account-info" element={<AccountInfoPage/>} />
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
