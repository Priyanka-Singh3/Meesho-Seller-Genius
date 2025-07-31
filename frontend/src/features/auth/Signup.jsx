import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signUp } from '../../services/authService';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../firebase/firebase.js';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Signup = ({ onSwitchToLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState({ email: '', password: '' });
  const [instagramId, setInstagramId] = useState('');
  const [facebookId, setFacebookId] = useState('');
  const navigate = useNavigate();
  const [user, loading] = useAuthState(auth);

  if (loading) return <p>Loading...</p>;
  if (user) {
    navigate('/dashboard');
    return null;
  }

  const handleSignup = async (e) => {
    e.preventDefault();
    let hasError = false;
    let newError = { email: '', password: '' };
    if (!email) {
      newError.email = 'This field is required.';
      hasError = true;
    }
    if (!password) {
      newError.password = 'This field is required.';
      hasError = true;
    }
    setError(newError);
    if (hasError) return;
    try {
      await signUp(email, password);
      // Save IDs to localStorage as a prototype
      localStorage.setItem('instagramId', instagramId);
      localStorage.setItem('facebookId', facebookId);
      toast.success('Signup successful!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message);
      setError({ ...newError, email: err.message });
    }
  };

  return (
    <>
      <ToastContainer position="top-center" autoClose={3000} />
      <form
        onSubmit={handleSignup}
        className="w-full max-w-sm mx-auto p-0" style={{ fontFamily: 'Mier book, sans-serif' }}
      >
        <h2 className="text-2xl mb-4 font-semibold">Sign Up</h2>
        <div className="mb-4">
          <label className="block mb-1 text-sm font-medium text-[#34313b]">Email</label>
          <input
            type="email"
            className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:border-[#9B177E] transition text-base ${error.email ? 'border-[#e53935] bg-[#fff6f6]' : 'border-[#d3d3d3] bg-white'}`}
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError({ ...error, email: '' }); }}
            required
            placeholder="Enter your email"
          />
          {error.email && <span className="text-xs text-[#e53935] mt-1 block">{error.email}</span>}
        </div>
        <div className="mb-4">
          <label className="block mb-1 text-sm font-medium text-[#34313b]">Password</label>
          <input
            type="password"
            className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:border-[#9B177E] transition text-base ${error.password ? 'border-[#e53935] bg-[#fff6f6]' : 'border-[#d3d3d3] bg-white'}`}
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError({ ...error, password: '' }); }}
            required
            placeholder="Enter your password"
          />
          {error.password && <span className="text-xs text-[#e53935] mt-1 block">{error.password}</span>}
        </div>
        <div className="mb-4">
          <label className="block mb-1 text-sm font-medium text-[#34313b]">Instagram ID (optional)</label>
          <input
            type="text"
            className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:border-[#9B177E] transition text-base border-[#d3d3d3] bg-white"
            value={instagramId}
            onChange={e => setInstagramId(e.target.value)}
            placeholder="Enter your Instagram username"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1 text-sm font-medium text-[#34313b]">Facebook ID (optional)</label>
          <input
            type="text"
            className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:border-[#9B177E] transition text-base border-[#d3d3d3] bg-white"
            value={facebookId}
            onChange={e => setFacebookId(e.target.value)}
            placeholder="Enter your Facebook username"
          />
        </div>
        <button
          type="submit"
          className="w-full p-2 rounded-lg mt-2"
          style={{ background: '#9B177E', color: '#fff', fontFamily: 'Mier book, sans-serif', fontWeight: 600 }}
        >
          Sign Up
        </button>
        <p className="text-sm text-center mt-4">
          Already have an account?{' '}
          <button type="button" className="text-[#35063e] font-semibold hover:underline" onClick={onSwitchToLogin}>
            Log in
          </button>
        </p>
      </form>
    </>
  );
};

export default Signup;
