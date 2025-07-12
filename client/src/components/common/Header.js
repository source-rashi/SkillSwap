import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogOut, User } from 'lucide-react';

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
    <header className="bg-white/80 backdrop-blur-xl shadow-2xl border-b border-gray-50 sticky top-0 z-50 rounded-b-3xl">
      <div className="max-w-screen-2xl mx-auto px-8 sm:px-12 lg:px-16">
        <div className="flex justify-between items-center h-24">
          <div className="flex items-center">
            <Link to="/" className="text-4xl font-extrabold bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent hover:from-indigo-600 hover:to-violet-600 transition-all duration-700 ease-out transform hover:scale-105 tracking-tight">
              SkillSwap
            </Link>
          </div>

          <nav className="hidden md:flex space-x-10">
            {isAuthenticated ? (
              <>
                <Link
                  to="/browse"
                  className="group text-gray-500 hover:text-indigo-500 px-6 py-3 rounded-2xl text-lg font-medium flex items-center transition-all duration-500 ease-out hover:bg-indigo-50/50 hover:shadow-lg transform hover:-translate-y-1"
                >
                  <User className="w-5 h-5 mr-2 group-hover:scale-125 group-hover:rotate-12 transition-transform duration-500" />
                  Browse Skills
                </Link>
                <Link
                  to="/requests"
                  className="group text-gray-500 hover:text-violet-500 px-6 py-3 rounded-2xl text-lg font-medium flex items-center transition-all duration-500 ease-out hover:bg-violet-50/50 hover:shadow-lg transform hover:-translate-y-1"
                >
                  <User className="w-5 h-5 mr-2 group-hover:scale-125 group-hover:rotate-12 transition-transform duration-500" />
                  My Requests
                </Link>
                <Link
                  to="/profile"
                  className="group text-gray-500 hover:text-emerald-500 px-6 py-3 rounded-2xl text-lg font-medium flex items-center transition-all duration-500 ease-out hover:bg-emerald-50/50 hover:shadow-lg transform hover:-translate-y-1"
                >
                  <User className="w-5 h-5 mr-2 group-hover:scale-125 group-hover:rotate-12 transition-transform duration-500" />
                  Profile
                </Link>
                {user?.isAdmin && (
                  <Link
                    to="/admin"
                    className="group text-gray-500 hover:text-amber-500 px-6 py-3 rounded-2xl text-lg font-medium flex items-center transition-all duration-500 ease-out hover:bg-amber-50/50 hover:shadow-lg transform hover:-translate-y-1"
                  >
                    <User className="w-5 h-5 mr-2 group-hover:scale-125 group-hover:rotate-12 transition-transform duration-500" />
                    Admin
                  </Link>
                )}
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-500 hover:text-indigo-500 px-6 py-3 rounded-2xl text-lg font-medium transition-all duration-500 ease-out hover:bg-indigo-50/50 hover:shadow-lg transform hover:-translate-y-1"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-indigo-500 to-violet-500 text-white hover:from-indigo-600 hover:to-violet-600 px-8 py-3 rounded-2xl text-lg font-bold transition-all duration-700 ease-out shadow-2xl hover:shadow-xl transform hover:-translate-y-1 hover:scale-110"
                >
                  Sign Up
                </Link>
              </>
            )}
          </nav>

          {isAuthenticated && (
            <div className="flex items-center space-x-10">
              <div className="relative">
                <button
                  onClick={toggleProfileCard}
                  className="flex items-center space-x-4 bg-white/50 backdrop-blur-sm rounded-2xl px-6 py-3 hover:bg-white/70 transition-all duration-500 ease-out shadow-sm hover:shadow-md"
                >
                  <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full flex items-center justify-center text-white font-bold text-lg transform hover:scale-110 hover:rotate-6 transition-transform duration-500">
                    {user?.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <span className="text-lg font-medium text-gray-600 tracking-wide">{user?.name}</span>
                </button>
                {isProfileOpen && (
                  <div className="absolute right-0 mt-3 w-96 bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 transform transition-all duration-700 ease-out origin-top-right hover:scale-105 hover:-rotate-2 perspective-1000">
                    <div className="relative transform-gpu transition-transform duration-700 ease-out hover:[transform:rotateY(10deg)_rotateX(5deg)]">
                      <div className="flex items-center space-x-5 mb-6">
                        <div className="w-20 h-20 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full flex items-center justify-center text-white font-bold text-2xl transform hover:scale-110 transition-transform duration-500">
                          {user?.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-gray-800 tracking-tight">{user?.name}</h3>
                          <p className="text-sm text-gray-500 font-medium">{user?.email}</p>
                          <p className="text-sm text-gray-500 font-medium capitalize">{user?.isAdmin ? 'Admin' : 'User'}</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Skills I Can Offer</h4>
                          <ul className="mt-2 flex flex-wrap gap-2">
                            {user?.skillsOffered?.length > 0 ? (
                              user.skillsOffered.map((skill, index) => (
                                <li key={index} className="bg-indigo-100/50 text-indigo-600 text-sm font-medium px-3 py-1 rounded-full hover:bg-indigo-200/50 transition-all duration-300">
                                  {skill}
                                </li>
                              ))
                            ) : (
                              <li className="text-sm text-gray-500">No skills listed</li>
                            )}
                          </ul>
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Skills I Want</h4>
                          <ul className="mt-2 flex flex-wrap gap-2">
                            {user?.skillsWanted?.length > 0 ? (
                              user.skillsWanted.map((skill, index) => (
                                <li key={index} className="bg-violet-100/50 text-violet-600 text-sm font-medium px-3 py-1 rounded-full hover:bg-violet-200/50 transition-all duration-300">
                                  {skill}
                                </li>
                              ))
                            ) : (
                              <li className="text-sm text-gray-500">No skills listed</li>
                            )}
                          </ul>
                        </div>
                      </div>
                      <button
                        onClick={toggleProfileCard}
                        className="w-full mt-6 text-gray-500 hover:text-indigo-500 text-sm font-medium transition-all duration-300 ease-out hover:bg-indigo-50/50 rounded-lg py-2.5 shadow-sm hover:shadow-md"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={handleLogout}
                className="group text-gray-400 hover:text-rose-500 p-3 rounded-2xl hover:bg-rose-50/50 transition-all duration-500 ease-out hover:shadow-lg transform hover:-translate-y-1"
                title="Logout"
              >
                <LogOut className="w-6 h-6 group-hover:scale-125 group-hover:rotate-12 transition-transform duration-500" />
              </button>
            </div>
          )}
        </div>
      </div>
      <style jsx>{`
        .perspective-1000 {
          perspective: 1000px;
        }
      `}</style>
    </header>
  );
};

export default Header;