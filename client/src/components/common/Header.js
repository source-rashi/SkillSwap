import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { User, LogOut, Settings, Users, MessageSquare } from 'lucide-react';

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-white/90 backdrop-blur-md shadow-lg border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-18">
          <div className="flex items-center">
            <Link to="/" className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:from-blue-700 hover:to-purple-700 transition-all duration-300">
              SkillSwap
            </Link>
          </div>

          <nav className="hidden md:flex space-x-6">
            {isAuthenticated ? (
              <>
                <Link
                  to="/browse"
                  className="text-gray-700 hover:text-blue-600 px-4 py-3 rounded-xl text-sm font-semibold flex items-center transition-all duration-200 hover:bg-blue-50"
                >
                  <Users className="w-5 h-5 mr-2" />
                  Browse Skills
                </Link>
                <Link
                  to="/requests"
                  className="text-gray-700 hover:text-purple-600 px-4 py-3 rounded-xl text-sm font-semibold flex items-center transition-all duration-200 hover:bg-purple-50"
                >
                  <MessageSquare className="w-5 h-5 mr-2" />
                  My Requests
                </Link>
                <Link
                  to="/profile"
                  className="text-gray-700 hover:text-green-600 px-4 py-3 rounded-xl text-sm font-semibold flex items-center transition-all duration-200 hover:bg-green-50"
                >
                  <Settings className="w-5 h-5 mr-2" />
                  Profile
                </Link>
                {user?.isAdmin && (
                  <Link
                    to="/admin"
                    className="text-gray-700 hover:text-orange-600 px-4 py-3 rounded-xl text-sm font-semibold flex items-center transition-all duration-200 hover:bg-orange-50"
                  >
                    <Settings className="w-5 h-5 mr-2" />
                    Admin
                  </Link>
                )}
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-blue-600 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 hover:bg-blue-50"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  Sign Up
                </Link>
              </>
            )}
          </nav>

          {isAuthenticated && (
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3 bg-gray-50 rounded-xl px-4 py-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {user?.name?.charAt(0)?.toUpperCase()}
                </div>
                <span className="text-sm font-semibold text-gray-700">{user?.name}</span>
              </div>
              <button
                onClick={handleLogout}
                className="text-gray-400 hover:text-red-500 p-2 rounded-xl hover:bg-red-50 transition-all duration-200"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
