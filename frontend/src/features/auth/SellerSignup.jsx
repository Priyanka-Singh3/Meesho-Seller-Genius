import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signUp } from '../../services/authService';
import { auth } from '../../firebase/firebase';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { signInWithGoogle } from '../../services/authService';
import rightImageSignup from '../../assets/right-image-signup.png';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const SellerSignup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    let hasError = false;
    let newError = { name: '', email: '', password: '' };
    if (!name) {
      newError.name = 'This field is required.';
      hasError = true;
    }
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
    setLoading(true);
    try {
      await signUp(email, password);
      toast.success('Signup successful!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message);
      setError({ ...newError, email: err.message });
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    try {
      await signInWithGoogle();
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans flex flex-col">
      <ToastContainer position="top-center" autoClose={3000} />
      <Navbar />
      <div className="flex flex-1">
        {/* Left: Form */}
        <div className="flex-1 flex flex-col justify-start px-12 py-8 bg-white max-w-xl">
          <h1 className="text-4xl font-extrabold text-[#34313b] mb-2 mt-4">Welcome to Meesho</h1>
          <p className="text-base text-[#7a7a7a] mb-8">Create your account to start selling</p>
          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block mb-1 text-sm font-medium text-[#34313b]">Name</label>
              <input
                type="text"
                className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:border-[#9B177E] transition text-base ${error.name ? 'border-[#e53935] bg-[#fff6f6]' : 'border-[#d3d3d3] bg-white'}`}
                value={name}
                onChange={e => { setName(e.target.value); setError({ ...error, name: '' }); }}
                placeholder="Enter your name"
              />
              {error.name && <span className="text-xs text-[#e53935] mt-1 block">{error.name}</span>}
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-[#34313b]">Email</label>
              <input
                type="email"
                className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:border-[#9B177E] transition text-base ${error.email ? 'border-[#e53935] bg-[#fff6f6]' : 'border-[#d3d3d3] bg-white'}`}
                value={email}
                onChange={e => { setEmail(e.target.value); setError({ ...error, email: '' }); }}
                placeholder="Enter your email"
              />
              {error.email && <span className="text-xs text-[#e53935] mt-1 block">{error.email}</span>}
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-[#34313b]">Password</label>
              <input
                type="password"
                className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:border-[#9B177E] transition text-base ${error.password ? 'border-[#e53935] bg-[#fff6f6]' : 'border-[#d3d3d3] bg-white'}`}
                value={password}
                onChange={e => { setPassword(e.target.value); setError({ ...error, password: '' }); }}
                placeholder="Enter your password"
              />
              {error.password && <span className="text-xs text-[#e53935] mt-1 block">{error.password}</span>}
            </div>
            <button
              type="submit"
              className="w-full p-3 rounded-lg mt-4 text-white font-semibold text-base"
              style={{ background: loading ? '#e5e5e5' : '#9B177E', cursor: loading ? 'not-allowed' : 'pointer' }}
              disabled={loading}
            >
              Create Account
            </button>
          </form>
          <div className="flex items-center my-6">
            <div className="flex-grow h-px bg-gray-200" />
            <span className="mx-2 text-gray-400 text-sm">Or Continue With</span>
            <div className="flex-grow h-px bg-gray-200" />
          </div>
          <div className="flex flex-col items-center gap-4 mb-4">
            <button type="button" onClick={handleGoogle} className="bg-white border border-gray-200 rounded-full p-2 shadow hover:shadow-md transition"><img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-6 h-6" /></button>
            <div className="text-center text-sm mt-2">
              Already a user?{' '}
              <button className="text-[#35063e] font-semibold hover:underline" onClick={() => navigate('/')}>Log in</button>
            </div>
          </div>
        </div>
        {/* Right: Illustration */}
        <div className="flex-1 flex items-center justify-center px-0 py-0 bg-[#f8f7fa] border-l border-[#ececec] min-w-[350px] h-full">
          <img src={rightImageSignup} alt="Signup Illustration" className="w-full h-full object-cover" />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SellerSignup; 