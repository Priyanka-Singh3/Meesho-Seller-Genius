import React from "react";

const Footer = () => (
  <footer className="w-full bg-white py-6 mt-12 flex flex-col items-center border-t border-[#f3e8ff]">
    <div className="text-[#9B177E] text-lg font-[Outfit]">Meesho Seller Genius</div>
    <div className="text-gray-400 text-sm mt-1">Empowering Sellers &copy; {new Date().getFullYear()}</div>
  </footer>
);

export default Footer; 