import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase/firebase.js';
import { useNavigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const [user, loading] = useAuthState(auth);

  if (loading) return <p>Loading...</p>;
  if (user) {
    navigate('/dashboard');
    return null;
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/dashboard');
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <form onSubmit={handleLogin} className="bg-white p-8 rounded-xl shadow-lg" style={{ fontFamily: 'Mier book, sans-serif' }}>
      <h2 className="text-2xl mb-4 font-semibold">Login</h2>
      <input
        type="email"
        placeholder="Email"
        className="border p-2 w-full mb-4 rounded"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        className="border p-2 w-full mb-4 rounded"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit" className="w-full px-4 py-2 rounded" style={{ background: '#9B177E', color: '#fff', fontFamily: 'Mier book, sans-serif' }}>
        Login
      </button>
    </form>
  );
};

export default Login;
