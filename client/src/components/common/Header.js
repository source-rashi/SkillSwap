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
    <header className="bg-white/80 backdrop-blur-xl shadow-xl border-b border-blue-100 sticky top-0 z-50 rounded-b-xl">
      <div className="max-w-screen-xl mx-auto px-6 sm:px-8 lg:px-10">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center">
            <Link to="/" className="text-3xl font-extrabold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent hover:from-blue-500 hover:to-cyan-500 transition-all duration-700 ease-out transform hover:scale-105 tracking-tight animate-pulse-slow">
              SkillSwap
            </Link>
          </div>

          <nav className="hidden md:flex space-x-8">
            {isAuthenticated ? (
              <>
                <Link
                  to="/browse"
                  className="group text-gray-500 hover:text-blue-400 px-5 py-2 rounded-xl text-base font-medium flex items-center transition-all duration-500 ease-out hover:bg-blue-50/50 hover:shadow-md transform hover:-translate-y-0.5"
                >
                  <User className="w-4 h-4 mr-2 group-hover:scale-125 group-hover:rotate-12 transition-transform duration-500" />
                  Browse Skills
                </Link>
                <Link
                  to="/community"
                  className="group text-gray-500 hover:text-purple-400 px-5 py-2 rounded-xl text-base font-medium flex items-center transition-all duration-500 ease-out hover:bg-purple-50/50 hover:shadow-md transform hover:-translate-y-0.5"
                >
                  <Users className="w-4 h-4 mr-2 group-hover:scale-125 group-hover:rotate-12 transition-transform duration-500" />
                  Community
                </Link>
                <Link
                  to="/requests"
                  className="group text-gray-500 hover:text-cyan-400 px-5 py-2 rounded-xl text-base font-medium flex items-center transition-all duration-500 ease-out hover:bg-cyan-50/50 hover:shadow-md transform hover:-translate-y-0.5"
                >
                  <User className="w-4 h-4 mr-2 group-hover:scale-125 group-hover:rotate-12 transition-transform duration-500" />
                  My Requests
                </Link>
                <Link
                  to="/profile"
                  className="group text-gray-500 hover:text-blue-400 px-5 py-2 rounded-xl text-base font-medium flex items-center transition-all duration-500 ease-out hover:bg-blue-50/50 hover:shadow-md transform hover:-translate-y-0.5"
                >
                  <User className="w-4 h-4 mr-2 group-hover:scale-125 group-hover:rotate-12 transition-transform duration-500" />
                  Profile
                </Link>
                {user?.isAdmin && (
                  <Link
                    to="/admin"
                    className="group text-gray-500 hover:text-cyan-400 px-5 py-2 rounded-xl text-base font-medium flex items-center transition-all duration-500 ease-out hover:bg-cyan-50/50 hover:shadow-md transform hover:-translate-y-0.5"
                  >
                    <User className="w-4 h-4 mr-2 group-hover:scale-125 group-hover:rotate-12 transition-transform duration-500" />
                    Admin
                  </Link>
                )}
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-500 hover:text-blue-400 px-5 py-2 rounded-xl text-base font-medium transition-all duration-500 ease-out hover:bg-blue-50/50 hover:shadow-md transform hover:-translate-y-0.5"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-blue-400 to-cyan-400 text-white hover:from-blue-500 hover:to-cyan-500 px-6 py-2 rounded-xl text-base font-bold transition-all duration-700 ease-out shadow-xl hover:shadow-lg transform hover:-translate-y-0.5 hover:scale-105"
                >
                  Sign Up
                </Link>
              </>
            )}
          </nav>

          {isAuthenticated && (
            <div className="flex items-center space-x-8">
              <div className="relative">
                <button
                  onClick={toggleProfileCard}
                  className="flex items-center space-x-3 bg-white/50 backdrop-blur-sm rounded-xl px-5 py-2 hover:bg-blue-50/70 transition-all duration-500 ease-out shadow-sm hover:shadow-md animate-pulse-slow"
                >
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full flex items-center justify-center text-white font-bold text-base transform hover:scale-110 hover:rotate-6 transition-transform duration-500">
                    {user?.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <span className="text-base font-medium text-gray-600 tracking-wide">{user?.name}</span>
                </button>
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white/90 backdrop-blur-xl rounded-xl shadow-xl p-6 transform transition-all duration-700 ease-out origin-top-right hover:scale-102 perspective-1000 [transform-style:preserve-3d] animate-flip-in">
                    <div className="relative transform-gpu transition-transform duration-700 ease-out hover:[transform:rotateY(10deg)_rotateX(5deg)]">
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full flex items-center justify-center text-white font-bold text-xl transform hover:scale-110 transition-transform duration-500">
                          {user?.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800 tracking-tight">{user?.name}</h3>
                          <p className="text-xs text-gray-500 font-medium">{user?.email}</p>
                          <p className="text-xs text-gray-500 font-medium capitalize">{user?.isAdmin ? 'Admin' : 'User'}</p>
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
                                  className="bg-blue-100/50 text-blue-500 text-xs font-medium px-2.5 py-1 rounded-full hover:bg-blue-200/50 hover:scale-105 transition-all duration-300 transform hover:-translate-y-0.5"
                                >
                                  {skill}
                                </li>
                              ))
                            ) : (
                              <li className="text-xs text-gray-500">No skills listed</li>
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
                                  className="bg-cyan-100/50 text-cyan-500 text-xs font-medium px-2.5 py-1 rounded-full hover:bg-cyan-200/50 hover:scale-105 transition-all duration-300 transform hover:-translate-y-0.5"
                                >
                                  {skill}
                                </li>
                              ))
                            ) : (
                              <li className="text-xs text-gray-500">No skills listed</li>
                            )}
                          </ul>
                        </div>
                      </div>
                      <button
                        onClick={toggleProfileCard}
                        className="w-full mt-4 text-gray-500 hover:text-blue-500 text-xs font-medium transition-all duration-300 ease-out hover:bg-blue-50/50 rounded-lg py-2 shadow-sm hover:shadow-md transform hover:scale-105"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={handleLogout}
                className="group text-gray-400 hover:text-rose-500 p-2 rounded-xl hover:bg-rose-50/50 transition-all duration-500 ease-out hover:shadow-md transform hover:-translate-y-0.5 hover:scale-110"
                title="Logout"
              >
                <LogOut className="w-5 h-5 group-hover:scale-125 group-hover:rotate-12 transition-transform duration-500" />
              </button>
            </div>
          )}
        </div>
      </div>
      <style jsx>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        @keyframes pulse-slow {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.015);
            opacity: 0.95;
          }
        }
        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }
        @keyframes flip-in {
          from {
            transform: rotateY(-90deg);
            opacity: 0;
          }
          to {
            transform: rotateY(0);
            opacity: 1;
          }
        }
        .animate-flip-in {
          animation: flip-in 0.7s ease-out forwards;
        }
      `}</style>
    </header>
  );
};

export default Header;