import logo from './logo.svg';
import './App.css';
import Login from './pages/Login';
import BoardList from './pages/BoardList';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Register from './pages/Register';
import TestConnection from './TestConnection';
import { TeamProvider } from './contexts/TeamContext';
import Layout from './components/Layout/Layout';
import { AuthProvider } from './contexts/AuthContext';
import CreateTeam from './pages/CreateTeam';
import RecentPosts from './components/Layout/RecentPosts';
import CreateCategory from './pages/CreateCategory';

// const PrivateRoute = ({ children }) => {
//   const isAuthenticated = localStorage.getItem('token');
//   return isAuthenticated ? children : <Navigate to="/login" />;
// }

function App() {
  const isAuthenticated = localStorage.getItem('token');
  return (
    <Router>
      <AuthProvider>
        <TeamProvider>
          {isAuthenticated ? (
            <Layout>
              <Routes>
                <Route path="/teams/:teamId/recent" element={<RecentPosts />} />
                <Route path='/test' element={<TestConnection />} />
                <Route path="*" element={<Navigate to="/teams/:teamId/recent" replace />} />
                <Route path="/create-team" element={<CreateTeam />} />
                <Route path='/teams/:teamId/category/create' element={<CreateCategory />} />
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
      </AuthProvider>
    </Router>
  );
}

export default App;
