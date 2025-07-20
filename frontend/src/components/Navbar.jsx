import React from "react";
import { useNavigate } from 'react-router-dom';
import meeshoLogo from '../assets/meeshoLogo.png';

// Use the official Meesho icon image URL or your preferred hosted URL
const meeshoIconUrl = "https://upload.wikimedia.org/wikipedia/commons/3/33/Meesho_logo.png?20230923160934";

const Navbar = ({ showLogout = false, onLogout }) => {
  const navigate = useNavigate();
  return (
    <nav className="sticky top-0 z-20 flex items-center justify-between bg-white shadow px-8 py-4 w-full">
      <div
        className="flex items-center gap-2 cursor-pointer"
        onClick={() => navigate('/dashboard')}
      >
        {/* Meesho Icon from URL */}
        <img src={meeshoIconUrl} alt="Meesho Icon" className="w-10 h-10" />
        {/* Meesho wordmark/logo */}
        <img src={meeshoLogo} alt="Meesho Logo" className="h-12" />
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
