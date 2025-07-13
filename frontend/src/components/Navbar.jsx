import React from "react";
import { useNavigate } from 'react-router-dom';
import meeshoLogo from '../assets/meeshoLogo.png';

const Navbar = ({ showLogout = false, onLogout }) => {
  const navigate = useNavigate();
  return (
    <nav className="sticky top-0 z-20 flex items-center justify-between bg-white shadow px-8 py-4 w-full">
      <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/dashboard')}>
        <img src={meeshoLogo} alt="Meesho Logo" className="w-79 h-12" />
      </div>
      {showLogout && (
        <button
          onClick={onLogout}
          className="bg-red-600 hover:bg-red-700 text-white font-semibold px-5 py-2 rounded-xl shadow transition"
        >
          Logout
        </button>
      )}
    </nav>
  );
};

export default Navbar; 