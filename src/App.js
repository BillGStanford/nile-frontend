import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import PopupRequest from './components/PopupRequest';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import PublishBook from './pages/PublishBook';
import BookDetails from './pages/BookDetails';
import SettingsPage from './pages/SettingsPage';
import BookshelfPage from './pages/BookshelfPage';
import { AuthProvider, useAuth } from './context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-white-200"> 
          <Navbar />
          <PopupRequest />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route 
              path="/publish" 
              element={
                <ProtectedRoute>
                  <PublishBook />
                </ProtectedRoute>
              } 
            />
            <Route path="/book/:id" element={<BookDetails />} />
            <Route 
              path="/settings" 
              element={
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/bookshelf" 
              element={
                <ProtectedRoute>
                  <BookshelfPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
