import logo from './logo.svg';
import './App.css';
import Login from './pages/Login';
import BoardList from './pages/BoardList';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Header from './components/Layout/Header';
import Register from './pages/Register';
import TestConnection from './TestConnection';

const PrivateRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('token');
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <Router>
      <div>
        <Header />
        <main className='main-content'>
          <Routes>
            <Route path='/test' element={<TestConnection />} />
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element = {<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path='/boardList' element={<PrivateRoute> <BoardList/> </PrivateRoute>}/>
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
