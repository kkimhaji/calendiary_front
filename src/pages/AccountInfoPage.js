import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../api/axios';
import '../styles/AccountInfoPage.css';

const AccountInfoPage = () => {
  const { user } = useAuth();
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPasswords(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/account/change-password', passwords);
      setMessage('비밀번호가 성공적으로 변경되었습니다.');
      setError('');
      setPasswords({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err) {
      setError(err.response?.data?.message || '비밀번호 변경에 실패했습니다.');
      setMessage('');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">계정 정보</h2>
      
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="mb-4">
          <p className="text-gray-600">이메일</p>
          <p className="font-medium">{user?.email}</p>
        </div>
        <div className="mb-4">
          <p className="text-gray-600">닉네임</p>
          <p className="font-medium">{user?.nickname}</p>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4">비밀번호 변경</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">현재 비밀번호</label>
            <input
              type="password"
              name="currentPassword"
              value={passwords.currentPassword}
              onChange={handleChange}
              className="w-full border rounded-lg p-2"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">새 비밀번호</label>
            <input
              type="password"
              name="newPassword"
              value={passwords.newPassword}
              onChange={handleChange}
              className="w-full border rounded-lg p-2"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">새 비밀번호 확인</label>
            <input
              type="password"
              name="confirmPassword"
              value={passwords.confirmPassword}
              onChange={handleChange}
              className="w-full border rounded-lg p-2"
              required
            />
          </div>
          {message && <p className="text-green-600 mb-4">{message}</p>}
          {error && <p className="text-red-600 mb-4">{error}</p>}
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            비밀번호 변경
          </button>
        </form>
      </div>
    </div>
  );
};

export default AccountInfoPage;
