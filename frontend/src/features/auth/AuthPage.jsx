import React, { useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Navigate, useNavigate } from 'react-router-dom';
import { auth } from '../../firebase/firebase';
import Login from './Login';
import dashboardImage from '../../assets/dashboard-image.png';
import { signInWithGoogle } from '../../services/authService';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

export default function AuthPage() {
  const [user, loading] = useAuthState(auth);
  const navigate = useNavigate();

  const handleGoogle = async () => {
    try {
      await signInWithGoogle();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (user) return <Navigate to="/dashboard" />;

  return (
    <div className="bg-white font-sans min-h-screen flex flex-col">
      <Navbar />
      {/* Centered Auth Card with Illustration */}
      <div className="flex items-center justify-center py-8 flex-1" style={{ minHeight: 'calc(100vh - 120px)' }}>
        <div className="bg-white rounded-2xl shadow-2xl flex flex-row w-full max-w-3xl min-h-[320px] overflow-hidden" style={{ height: '420px' }}>
          {/* Illustration Section */}
          <div className="hidden md:flex flex-col justify-center items-center bg-[#fbe9f2] px-8 py-8 w-1/2">
            <img src={dashboardImage} alt="Dashboard Illustration" className="w-full max-w-xs rounded-xl shadow" />
          </div>
          {/* Form Section */}
          <div className="flex-1 flex flex-col items-center justify-center px-8 py-8">
            <div className="w-full max-w-xs">
              <Login />
              {/* Social Login Buttons */}
              <div className="flex items-center my-6">
                <div className="flex-grow h-px bg-gray-200" />
                <span className="mx-2 text-gray-400 text-sm">Or Continue With</span>
                <div className="flex-grow h-px bg-gray-200" />
              </div>
              <div className="flex justify-center gap-4 mb-4">
                <button type="button" onClick={handleGoogle} className="bg-white border border-gray-200 rounded-full p-2 shadow hover:shadow-md transition"><img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-6 h-6" /></button>
              </div>
              {/* Seller Sign Up Link */}
              <div className="text-center text-sm mt-2">
                New to Meesho?{' '}
                <button className="text-[#35063e] font-semibold hover:underline" onClick={() => navigate('/seller-signup')}>Sign Up</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
} 