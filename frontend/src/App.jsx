import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './features/auth/Login';
import ProtectedRoute from './features/auth/ProtectedRoute';
import Dashboard from './features/dashboard/Dashboard';
import AuthPage from './features/auth/AuthPage';
import SellerSignup from './features/auth/SellerSignup';

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
      </Routes>
    </BrowserRouter>
  );
}

export default App
