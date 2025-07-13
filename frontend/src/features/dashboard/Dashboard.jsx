import React from 'react'
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase/firebase';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-pink-50">
      {/* Navbar */}
      <nav className="flex items-center justify-between bg-white shadow px-8 py-4 mb-8">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-pink-500 flex items-center justify-center">
            <span className="text-white text-2xl font-extrabold">M</span>
          </div>
          <span className="text-xl font-bold text-pink-600">Meesho Seller Genius</span>
        </div>
        <button
          onClick={handleLogout}
          className="bg-pink-500 hover:bg-pink-600 text-white font-semibold px-5 py-2 rounded-full shadow transition"
        >
          Logout
        </button>
      </nav>
      {/* Dashboard Content */}
      <div className="px-8">
        <h2 className="text-2xl font-bold text-pink-700 mb-4">Dashboard</h2>
        {/* Add your dashboard content here */}
      </div>
    </div>
  );
}

export default Dashboard