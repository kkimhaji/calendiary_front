import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Register.css';
import axios from 'axios';

function Register() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);  // 1: 기본 정보, 2: 인증번호
    const [formData, setFormData] = useState({
        email: '',
        nickname: '',
        password: '',
        verificationCode: ''
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleInitialSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post('/auth/register', {
                email: formData.email,
                nickname: formData.nickname,
                password: formData.password
            });
            setStep(2);  // 인증번호 입력 단계로 전환
        } catch (error) {
            console.error('Registration failed:', error);
            alert('회원가입 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerification = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.post('/auth/verify', {
                email: formData.email,
                verificationCode: formData.verificationCode
            });
            const { accessToken } = response.data;
            localStorage.setItem('token', accessToken);
            navigate('/login');  // 또는 메인 페이지로 이동
        } catch (error) {
            console.error('Verification failed:', error);
            alert('인증번호가 올바르지 않습니다.');
        } finally {
            setLoading(false);
        }
    };

    const handleResendCode = async () => {
        try {
            await axios.post('/auth/resend', {
                email: formData.email
            });
            alert('인증 메일이 재전송되었습니다.');
        } catch (error) {
            console.error('Resend failed:', error);
            alert('인증 메일 재전송에 실패했습니다.');
        }
    };

    return (
        <div className="register-container">
            <h2>회원가입</h2>
            {step === 1 ? (
                <form onSubmit={handleInitialSubmit}>
                    <div className="form-group">
                        <input
                            type="email"
                            name="email"
                            placeholder="이메일"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <input
                            type="text"
                            name="nickname"
                            placeholder="닉네임"
                            value={formData.nickname}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <input
                            type="password"
                            name="password"
                            placeholder="비밀번호"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <button type="submit" disabled={loading}>
                        {loading ? '처리중...' : '회원가입'}
                    </button>
                </form>
            ) : (
                <form onSubmit={handleVerification}>
                    <div className="form-group">
                        <input
                            type="text"
                            value={formData.email}
                            disabled
                            className="disabled-input"
                        />
                    </div>
                    <p>인증 메일은 5분 동안 유효합니다.</p>

                    <div className="form-group verification-group">
                        <input
                            type="text"
                            name="verificationCode"
                            placeholder="인증번호"
                            value={formData.verificationCode}
                            onChange={handleChange}
                            required
                        />
                        <button 
                            type="button" 
                            onClick={handleResendCode}
                            className="resend-button"
                        >
                            재전송
                        </button>
                    </div>
                    <button type="submit" disabled={loading}>
                        {loading ? '인증중...' : '인증 완료'}
                    </button>
                </form>
            )}
        </div>
    );
}

export default Register;

// function Register() {
//     const navigate = useNavigate();
//     const [formData, setFormData] = useState({
//         nickname: '',
//         email: '',
//         password: '',
//         verificationCode: ''
//     });
//     const [error, setError] = useState('');
//     const [isEmailSent, setIsEmailSent] = useState(false);
//     const [isVerified, setIsVerified] = useState(false);
//     const [resendDisabled, setResendDisabled] = useState(false);
//     const [resendTimer, setResendTimer] = useState(0);

//     const handleChange = (e) => {
//         const { name, value } = e.target;
//         setFormData(prev => ({
//             ...prev,
//             [name]: value
//         }));
//     };

//     // 이메일 인증 코드 전송
//     const handleSendVerification = async (e) => {
//         e.preventDefault();
//         try {
//             await axios.post('/auth/verify', {
//                 email: formData.email
//             });
//             setIsEmailSent(true);
//             setError('');
//             //타이머 실행
//             setResendTimer();
//             alert('인증 코드가 이메일로 전송되었습니다.');
//         } catch (error) {
//             setError('이메일 전송에 실패했습니다. 다시 시도해주세요.');
//         }
//     };

//     //타이머 함수
//     const startResendTimer = () => {
//         setResendDisabled(true);
//         setResendTimer(300); // 5분
//         const timer = setInterval(() => {
//             setResendTimer((prev) => {
//                 if (prev <= 1) {
//                     clearInterval(timer);
//                     setResendDisabled(false);
//                     return 0;
//                 }
//                 return prev - 1;
//             });
//         }, 1000);
//     }

//         //인증 메일 재전송
//         const handleResendVerification = async (e) => {
//             e.preventDefault();
//             try {
//                 await axios.post('/auth/email/verification/resend', {
//                     email: formData.email
//                 });
//                 startResendTimer();
//                 alert('인증 코드가 재전송되었습니다.');
//             } catch (error) {
//                 setError('인증 코드 재전송에 실패했습니다.');
//             }
//         };
    

//        // 인증 코드 확인
//        const handleVerifyCode = async (e) => {
//         e.preventDefault();
//         try {
//             await axios.post('/auth/email/verify', {
//                 email: formData.email,
//                 code: formData.verificationCode
//             });
//             setIsVerified(true);
//             setError('');
//             alert('이메일 인증이 완료되었습니다.');
//         } catch (error) {
//             setError('인증 코드가 일치하지 않습니다.');
//         }
//     };

//         // 회원가입 제출
//         const handleSubmit = async (e) => {
//             e.preventDefault();
//             if (!isVerified) {
//                 setError('이메일 인증을 완료해주세요.');
//                 return;
//             }

//             try {
//                 await axios.post('/auth/register', {
//                     nickname: formData.nickname,
//                     email: formData.email,
//                     password: formData.password
//                 });
//                 alert('회원가입이 완료되었습니다.');
//                 navigate('/login');
//             } catch (error) {
//                 setError('회원가입에 실패했습니다. 다시 시도해주세요.');
//             }
//         };
    

//     return (
//         <div className="register-container">
//             <div className="register-box">
//                 <h2>회원가입</h2>
//                 {error && <div className="error-message">{error}</div>}
//                 <form onSubmit={handleSubmit}>
//                     <div className="form-group">
//                         <label>닉네임</label>
//                         <input
//                             type="text"
//                             name="nickname"
//                             value={formData.nickname}
//                             onChange={handleChange}
//                             placeholder="닉네임을 입력하세요"
//                             required
//                         />
//                     </div>
//                     <div className="form-group">
//                         <label>이메일</label>
//                         <div className="email-group">
//                             <input
//                                 type="email"
//                                 name="email"
//                                 value={formData.email}
//                                 onChange={handleChange}
//                                 placeholder="이메일을 입력하세요"
//                                 required
//                             />
//                             <button 
//                                 type="button" 
//                                 onClick={handleSendVerification}
//                                 className="verification-button"
//                                 disabled={isVerified}
//                             >
//                                 인증메일 전송
//                             </button>
//                         </div>
//                         {isEmailSent && !isVerified && (
//                             <div className="resend-group">
//                                 <button 
//                                     type="button" 
//                                     onClick={handleResendVerification}
//                                     className="resend-button"
//                                     disabled={resendDisabled}
//                                 >
//                                                             인증메일 재전송
//                                     {resendDisabled && ` (${Math.floor(resendTimer / 60)}:${(resendTimer % 60).toString().padStart(2, '0')})`}
//                                 </button>
//                             </div>
//                         )}
//                     </div>
//                     {isEmailSent && (
//                         <div className="form-group">
//                             <label>인증번호</label>
//                             <div className="verification-group">
//                                 <input
//                                     type="text"
//                                     name="verificationCode"
//                                     value={formData.verificationCode}
//                                     onChange={handleChange}
//                                     placeholder="인증번호를 입력하세요"
//                                     disabled={isVerified}
//                                 />
//                                 <button 
//                                     type="button" 
//                                     onClick={handleVerifyCode}
//                                     className="verify-button"
//                                     disabled={isVerified}
//                                 >
//                                     확인
//                                 </button>
//                             </div>
//                         </div>
//                     )}
//                     <div className="form-group">
//                         <label>비밀번호</label>
//                         <input
//                             type="password"
//                             name="password"
//                             value={formData.password}
//                             onChange={handleChange}
//                             placeholder="비밀번호를 입력하세요"
//                             required
//                         />
//                     </div>
//                     <button 
//                         type="submit" 
//                         className="register-button"
//                         disabled={!isVerified}
//                     >
//                         회원가입
//                     </button>
//                 </form>
//             </div>
//         </div>
//     );
// }

// export default Register;