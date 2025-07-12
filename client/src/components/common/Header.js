import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogOut, User, Users } from 'lucide-react';

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleProfileCard = () => {
    setIsProfileOpen(!isProfileOpen);
  };

  return (
    <header className="bg-gradient-to-br from-blue-50 to-indigo-100 bg-opacity-80 backdrop-blur-xl shadow-xl border-b border-blue-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link
              to="/"
              className="text-3xl font-bold text-gray-900 bg-clip-text hover:bg-gradient-to-r hover:from-blue-500 hover:to-cyan-500 transition-all duration-300 ease-out transform hover:scale-105"
            >
              SkillSwap
            </Link>
          </div>

          <nav className="hidden md:flex space-x-6">
            {isAuthenticated ? (
              <>
                <Link
                  to="/browse"
                  className="group text-gray-700 hover:text-blue-600 px-4 py-2 rounded-xl text-base font-medium flex items-center transition-all duration-300 ease-out hover:bg-blue-100/50 hover:shadow-md transform hover:-translate-y-0.5"
                >
                  <User className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-300" />
                  Browse Skills
                </Link>
                <Link
                  to="/community"
                  className="group text-gray-700 hover:text-purple-600 px-4 py-2 rounded-xl text-base font-medium flex items-center transition-all duration-300 ease-out hover:bg-purple-100/50 hover:shadow-md transform hover:-translate-y-0.5"
                >
                  <Users className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-300" />
                  Community
                </Link>
                <Link
                  to="/requests"
                  className="group text-gray-700 hover:text-cyan-600 px-4 py-2 rounded-xl text-base font-medium flex items-center transition-all duration-300 ease-out hover:bg-cyan-100/50 hover:shadow-md transform hover:-translate-y-0.5"
                >
                  <User className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-300" />
                  My Requests
                </Link>
                <Link
                  to="/profile"
                  className="group text-gray-700 hover:text-blue-600 px-4 py-2 rounded-xl text-base font-medium flex items-center transition-all duration-300 ease-out hover:bg-blue-100/50 hover:shadow-md transform hover:-translate-y-0.5"
                >
                  <User className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-300" />
                  Profile
                </Link>
                {user?.isAdmin && (
                  <Link
                    to="/admin"
                    className="group text-gray-700 hover:text-cyan-600 px-4 py-2 rounded-xl text-base font-medium flex items-center transition-all duration-300 ease-out hover:bg-cyan-100/50 hover:shadow-md transform hover:-translate-y-0.5"
                  >
                    <User className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-300" />
                    Admin
                  </Link>
                )}
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-blue-600 px-4 py-2 rounded-xl text-base font-medium transition-all duration-300 ease-out hover:bg-blue-100/50 hover:shadow-md transform hover:-translate-y-0.5"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-blue-400 to-cyan-400 text-white hover:from-blue-500 hover:to-cyan-500 px-5 py-2 rounded-xl text-base font-bold transition-all duration-300 ease-out shadow-md hover:shadow-lg transform hover:-translate-y-0.5 hover:scale-105"
                >
                  Sign Up
                </Link>
              </>
            )}
          </nav>

          {isAuthenticated && (
            <div className="flex items-center space-x-6">
              <div className="relative">
                <button
                  onClick={toggleProfileCard}
                  className="flex items-center space-x-2 bg-white/50 backdrop-blur-sm rounded-xl px-4 py-2 hover:bg-blue-100/70 transition-all duration-300 ease-out shadow-sm hover:shadow-md"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full flex items-center justify-center text-white font-bold text-sm transform hover:scale-105 transition-transform duration-300">
                    {user?.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-gray-700">{user?.name}</span>
                </button>
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white/90 backdrop-blur-xl rounded-xl shadow-xl p-5 border border-blue-100 transform transition-all duration-500 ease-out origin-top-right">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full flex items-center justify-center text-white font-bold text-lg transform hover:scale-105 transition-transform duration-300">
                        {user?.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-gray-900">{user?.name}</h3>
                        <p className="text-xs text-gray-600">{user?.email}</p>
                        <p className="text-xs text-gray-600 capitalize">{user?.isAdmin ? 'Admin' : 'User'}</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Skills I Can Offer</h4>
                        <ul className="mt-1 flex flex-wrap gap-1.5">
                          {user?.skillsOffered?.length > 0 ? (
                            user.skillsOffered.map((skill, index) => (
                              <li
                                key={index}
                                className="bg-blue-100/50 text-blue-600 text-xs font-medium px-2 py-0.5 rounded-full hover:bg-blue-200/50 hover:scale-105 transition-all duration-300"
                              >
                                {skill}
                              </li>
                            ))
                          ) : (
                            <li className="text-xs text-gray-600">No skills listed</li>
                          )}
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Skills I Want</h4>
                        <ul className="mt-1 flex flex-wrap gap-1.5">
                          {user?.skillsWanted?.length > 0 ? (
                            user.skillsWanted.map((skill, index) => (
                              <li
                                key={index}
                                className="bg-cyan-100/50 text-cyan-600 text-xs font-medium px-2 py-0.5 rounded-full hover:bg-cyan-200/50 hover:scale-105 transition-all duration-300"
                              >
                                {skill}
                              </li>
                            ))
                          ) : (
                            <li className="text-xs text-gray-600">No skills listed</li>
                          )}
                        </ul>
                      </div>
                    </div>
                    <button
                      onClick={toggleProfileCard}
                      className="w-full mt-4 text-gray-600 hover:text-blue-600 text-xs font-medium transition-all duration-300 ease-out hover:bg-blue-100/50 rounded-lg py-1.5 shadow-sm hover:shadow-md"
                    >
                      Close
                    </button>
                  </div>
                )}
              </div>
              <button
                onClick={handleLogout}
                className="group text-gray-600 hover:text-rose-600 p-2 rounded-xl hover:bg-rose-100/50 transition-all duration-300 ease-out hover:shadow-md transform hover:-translate-y-0.5 hover:scale-110"
                title="Logout"
              >
                <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
              </button>
            </div>
          )}
        </div>
      </div>
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.01); opacity: 0.98; }
        }
        .animate-pulse { animation: pulse 2s ease-in-out infinite; }
      `}</style>
    </header>
  );
};

export default Header;