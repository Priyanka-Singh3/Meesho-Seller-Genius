import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './features/auth/Login';
import ProtectedRoute from './features/auth/ProtectedRoute';
import Dashboard from './features/dashboard/Dashboard';
import AuthPage from './features/auth/AuthPage';
import SellerSignup from './features/auth/SellerSignup';
import BulkListing from './features/dashboard/BulkListing';
import DynamicPricing from './features/dashboard/DynamicPricing';
import SocialMediaPost from './features/dashboard/SocialMediaPost';

function App() {
  

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/seller-signup" element={<SellerSignup />} />
        <Route path="/bulk-listing" element={<ProtectedRoute><BulkListing /></ProtectedRoute>} />
        <Route path="/dynamic-pricing" element={<ProtectedRoute><DynamicPricing /></ProtectedRoute>} />
        <Route path="/social-media-post" element={<ProtectedRoute><SocialMediaPost /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App
