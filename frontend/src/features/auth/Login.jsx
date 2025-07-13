import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase/firebase.js';
import { useNavigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const [user, loadingAuth] = useAuthState(auth);
  const [loading, setLoading] = useState(false);

  if (loadingAuth) return <p>Loading...</p>;
  if (user) {
    navigate('/dashboard');
    return null;
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/dashboard');
    } catch (error) {
      alert(error.message);
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleLogin} className="bg-white p-8 rounded-xl shadow-lg">
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
      <button
        type="submit"
        className={`w-full px-4 py-2 rounded transition font-semibold flex items-center justify-center
          ${loading ? 'bg-[#e5e5e5] cursor-not-allowed' : 'bg-[#9B177E] hover:bg-[#7a125f] active:bg-[#5c0e47]'}
          text-white relative`}
        style={{ fontFamily: 'Outfit, Arial, sans-serif' }}
        disabled={loading}
      >
        {loading ? (
          <span className="flex items-center">
            <span className="animate-spin rounded-full h-5 w-5 border-2 border-t-2 border-white border-t-[#9B177E] mr-2"></span>
            Logging in...
          </span>
        ) : (
          'Login'
        )}
      </button>
    </form>
  );
};

export default Login;
