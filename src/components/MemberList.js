import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/MemberList.css';

const MemberList = ({ teamId, roleId,}) => {
    const [members, setMembers] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [keyword, setKeyword] = useState('');
    const [loading, setLoading] = useState(false);

    const fetchMembers = async () => {
        try {
            setLoading(true);
            const endpoint = roleId 
                ? `/team/${teamId}/roles/${roleId}/get-members`
                : `/team/${teamId}/members`;

            const response = await axios.get(endpoint, {
                params: {
                    page: currentPage,
                    size: pageSize,
                    keyword
                },
                headers:{
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                }
            });
            
            setMembers(response.data.content);
            setTotalPages(response.data.totalPages);
        } catch (error) {
            console.error('멤버 불러오기 실패:', error);
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        fetchMembers();
    }, [currentPage, pageSize, keyword, roleId]);

    return (
        <div className="member-list-container">
            <div className="search-section">
                <input
                    type="text"
                    placeholder="이메일 또는 닉네임 검색"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                />
                <select 
                    value={pageSize} 
                    onChange={(e) => setPageSize(Number(e.target.value))}
                >
                    <option value={10}>10개씩 보기</option>
                    <option value={20}>20개씩 보기</option>
                    <option value={50}>50개씩 보기</option>
                </select>
            </div>

            {loading ? (
                <div className="loading">로딩 중...</div>
            ) : (
                <>
                    <table className="member-table">
                        <thead>
                            <tr>
                                <th>닉네임</th>
                                <th>이메일</th>
                                <th>역할</th>
                            </tr>
                        </thead>
                        <tbody>
                            {members.map(member => (
                                <tr key={member.id}>
                                    <td>{member.teamNickname}</td>
                                    <td>{member.email}</td>
                                    <td>{member.roleName}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="pagination">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(p - 1, 0))}
                            disabled={currentPage === 0}
                        >
                            이전
                        </button>
                        
                        <span>페이지 {currentPage + 1} / {totalPages}</span>
                        
                        <button
                            onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages - 1))}
                            disabled={currentPage >= totalPages - 1}
                        >
                            다음
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default MemberList;
