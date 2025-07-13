import React, { useState, useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase/firebase';
import { useNavigate } from 'react-router-dom';
import FeatureCard from '../../components/FeatureCard';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import dashboardBanner from '../../assets/dashboard-banner.png';
import dynamicPricingImg from '../../assets/dynamic-pricing.png';
import bulkListingImg from '../../assets/bulk-listing.png';
import socialMediaImg from '../../assets/social-media.png';

const Dashboard = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar showLogout={true} onLogout={handleLogout} />
      {/* Banner Image with Overlay Text */}
      <div className="w-full mb-8 relative">
        <img src={dashboardBanner} alt="Dashboard Banner" className="w-full h-72 md:h-96 object-cover" />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white drop-shadow-lg text-center mb-4" style={{ textShadow: '0 2px 16px rgba(0,0,0,0.4)' }}>
            Smart Selling, Trusted by Millions.
          </h1>
        </div>
      </div>
      {/* Light gap/section below banner */}
      <div className="w-full bg-[#F8F2FC] py-10 flex flex-col items-center mb-2">
        <h2 className="text-3xl md:text-4xl text-transparent bg-clip-text bg-gradient-to-r from-[#9B177E] to-[#F43F5E] text-center mb-2 tracking-tight font-[Outfit]">
          Explore Powerful Seller Tools
        </h2>
        {/* Animated subtitle */}
        <AnimatedSubtitle />
      </div>
      {/* Dashboard Content */}
      <div className="px-8 flex-1">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
          <div
            className="flex flex-col items-center cursor-pointer"
            onClick={() => navigate('/bulk-listing')}
          >
            <FeatureCard
              image={bulkListingImg}
              bgColor="#F3E8FF"
            />
            <div className="mt-6 text-2xl text-[#9B177E] text-center tracking-tight">Generate Bulk Listing</div>
            <div className="mt-2 text-base text-gray-500 text-center max-w-xs">Easily create multiple product listings at once.</div>
          </div>
          <div
            className="flex flex-col items-center cursor-pointer"
            onClick={() => navigate('/dynamic-pricing')}
          >
            <FeatureCard
              image={dynamicPricingImg}
              bgColor="#F3E8FF"
            />
            <div className="mt-6 text-2xl text-[#9B177E] text-center tracking-tight">Dynamic Pricing</div>
            <div className="mt-2 text-base text-gray-500 text-center max-w-xs">Optimize your prices for maximum profit.</div>
          </div>
          <div
            className="flex flex-col items-center cursor-pointer"
            onClick={() => navigate('/social-media-post')}
          >
            <FeatureCard
              image={socialMediaImg}
              bgColor="#F3E8FF"
            />
            <div className="mt-6 text-2xl text-[#9B177E] text-center tracking-tight">Social Media Post</div>
            <div className="mt-2 text-base text-gray-500 text-center max-w-xs">Create and share posts to boost your sales.</div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

// Animated subtitle component
const phrases = [
  "Bulk upload your products in seconds!",
  "Unlock dynamic pricing for more profit.",
  "Create viral social media posts instantly.",
  "Grow your business with smart automation."
];

function AnimatedSubtitle() {
  const [index, setIndex] = useState(0);
  const [displayed, setDisplayed] = useState('');
  const [typing, setTyping] = useState(true);

  useEffect(() => {
    let timeout;
    if (typing) {
      if (displayed.length < phrases[index].length) {
        timeout = setTimeout(() => {
          setDisplayed(phrases[index].slice(0, displayed.length + 1));
        }, 40);
      } else {
        timeout = setTimeout(() => setTyping(false), 1200);
      }
    } else {
      timeout = setTimeout(() => {
        setDisplayed('');
        setTyping(true);
        setIndex((prev) => (prev + 1) % phrases.length);
      }, 600);
    }
    return () => clearTimeout(timeout);
  }, [displayed, typing, index]);

  return (
    <div className="text-lg text-gray-500 text-center max-w-2xl mb-2 min-h-[28px] font-[Outfit] transition-all duration-300">
      {displayed}
      <span className="inline-block w-2 h-6 align-middle animate-pulse">|</span>
    </div>
  );
}

export default Dashboard;