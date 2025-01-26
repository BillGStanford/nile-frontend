import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-gray-800">
              Nile. 
            </Link>
          </div>
          <div className="flex items-center">
            {isAuthenticated ? (
              <>
                <span className="text-gray-700 mr-4">Welcome, {user?.username}</span>
                
                {/* Bookshelf Link */}
                <Link
                  to="/bookshelf"
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md mr-4"
                >
                  My Bookshelf
                </Link>

                {/* Settings Link */}
                <Link
                  to="/settings"
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md mr-4"
                >
                  Settings
                </Link>

                
                {isAuthenticated && (
                          <Link
                            to="/publish"
                            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                          >
                            Publish Book
                          </Link>
                        )}

                <button
                  onClick={logout}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md"
                >
                  Login
                </Link>
                
                <Link
                  to="/signup"
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md ml-4"
                >
                  Start Your Journey
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;