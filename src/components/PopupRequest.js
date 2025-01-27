import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PopupRequest = () => {
  const [showPopup, setShowPopup] = useState(false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Show popup only for logged-out users when the component mounts
    if (!isAuthenticated) {
      setShowPopup(true);
    }
  }, [isAuthenticated]); // Re-run when the authentication status changes

  const handleLogin = () => {
    navigate('/login');
    setShowPopup(false);
  };

  const handleSignup = () => {
    navigate('/signup');
    setShowPopup(false);
  };

  const handleStayLoggedOut = () => {
    setShowPopup(false);
  };

  if (!showPopup || isAuthenticated) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl text-center">
        <h2 className="mb-5 text-center text-4xl font-bold">Welcome Back!</h2>
        <p className="mb-7 text-center text-lg text-token-text-secondary">Create an account or log in to unlock full features & have get the most!</p>
        
        <div className="flex justify-center space-x-4">
          <button 
            onClick={handleLogin}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          >
            Login
          </button>
          
          <button 
            onClick={handleSignup}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
          >
            Sign Up
          </button>
        </div>
        
        <button 
          onClick={handleStayLoggedOut}
          className="mt-4 text-gray-500 underline"
        >
          Stay Logged Out
        </button>
      </div>
    </div>
  );
};

export default PopupRequest;
