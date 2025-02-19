import logo from './logo.svg';
import './App.css';
import Login from './pages/Login';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Register from './pages/Register';
import TestConnection from './TestConnection';
import { TeamProvider } from './contexts/TeamContext';
import Layout from './components/Layout/Layout';
import { AuthProvider } from './contexts/AuthContext';
import CreateTeam from './pages/CreateTeam';
import RecentPosts from './components/Layout/RecentPosts';
import CreateCategory from './pages/CreateCategory';
import CreatePost from './pages/CreatePost';
import PostDetail from './pages/PostDetail';
import React from 'react';
import { useAuth } from './contexts/AuthContext';

function App() {
  const { isLoggedIn } = useAuth();
  return (
    <Router>
        <TeamProvider>
          {isLoggedIn ? (
            <Layout>
              <Routes>
                <Route path="/teams/:teamId/recent" element={<RecentPosts />} />
                <Route path="/teams/:teamId/category/:categoryId/recent" element={<RecentPosts />} />
                <Route path='/test' element={<TestConnection />} />
                <Route path="*" element={<Navigate to="/teams/:teamId/recent" replace />} />
                <Route path="/create-team" element={<CreateTeam />} />
                <Route path='/teams/:teamId/category/create' element={<CreateCategory />} />
                <Route path='/teams/:teamId/posts/create' element={<CreatePost />} />
                <Route path="/teams/:teamId/category/:categoryId/posts/:postId" element={<PostDetail />} />
                <Route path='/teams/:teamId/category/:categoryId/posts/:postId/edit' element={<CreatePost />} />
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
