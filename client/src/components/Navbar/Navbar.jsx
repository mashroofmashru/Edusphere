import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Courses', href: '/viewCourses' },
    { label: 'About', href: '/about' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-navy-900 text-white shadow-lg sticky top-0 z-50 font-sans">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">

          <div className="flex items-center cursor-pointer" onClick={() => navigate("/")}>
            <i className="fas fa-graduation-cap text-2xl text-blue-400 mr-2"></i>
            <span className="text-xl font-bold">EduVerse</span>
          </div>

          <div className="hidden md:flex space-x-8 items-center">
            {navLinks.map((link, index) => (
              <a
                key={index}
                href={link.href}
                className="hover:text-blue-300 transition font-medium"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="hidden md:flex space-x-4 items-center">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-3 focus:outline-none"
                >
                  <div className="text-right hidden lg:block">
                    <p className="text-sm font-bold">{user.name}</p>
                    <p className="text-xs text-gray-400 uppercase">{user.role}</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold border-2 border-blue-400">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                </button>

                {/* Dropdown */}
                {isProfileOpen && (
                  <div className="absolute right-0 mt-3 w-48 bg-white rounded-xl shadow-xl py-2 text-gray-800 z-50 border border-gray-100">
                    <div className="px-4 py-2 border-b border-gray-100 lg:hidden">
                      <p className="font-bold text-sm">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                    <button
                      onClick={() => navigate('/profile')}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 hover:text-blue-600 transition flex items-center gap-2"
                    >
                      <i className="fas fa-user-circle"></i> View Profile
                    </button>
                    {user?.role === 'user' && (
                      <button
                        onClick={() => navigate('/my-courses')}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 hover:text-blue-600 transition flex items-center gap-2"
                      >
                        <i className="fas fa-book-open"></i> My Courses
                      </button>
                    )}
                    {user?.role === 'instructor' && (
                      <button
                        onClick={() => navigate('/instructor')}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 hover:text-blue-600 transition flex items-center gap-2"
                      >
                        <i className="fas fa-chalkboard-teacher"></i> Dashboard
                      </button>
                    )}
                    <div className="border-t border-gray-100 my-1"></div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition flex items-center gap-2"
                    >
                      <i className="fas fa-sign-out-alt"></i> Log Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button className="px-6 py-2 rounded-lg hover:bg-blue-700 transition bg-blue-600 font-bold shadow-lg shadow-blue-900/20" onClick={() => navigate("/auth")}>
                Log In
              </button>
            )}
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-white focus:outline-none"
            >
              <i className="fas fa-bars text-xl"></i>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} md:hidden pb-4`}>
          {navLinks.map((link, index) => (
            <a
              key={index}
              href={link.href}
              className="block py-3 hover:text-blue-300 transition border-b border-gray-800"
            >
              {link.label}
            </a>
          ))}
          {isAuthenticated && (
            <>
              <button onClick={() => navigate('/profile')} className="w-full text-left py-3 hover:text-blue-300 transition border-b border-gray-800">
                My Profile ({user.name})
              </button>
              {user?.role === 'instructor' && (
                <button onClick={() => navigate('/instructor')} className="w-full text-left py-3 hover:text-blue-300 transition border-b border-gray-800">
                  Instructor Dashboard
                </button>
              )}
              <button onClick={handleLogout} className="w-full text-left py-3 text-red-400 hover:text-red-300 transition">
                Log Out
              </button>
            </>
          )}
          {!isAuthenticated && (
            <div className="mt-4 pt-4 border-t border-gray-700">
              <button className="w-full mb-2 py-3 rounded-lg hover:bg-blue-700 transition bg-blue-600 font-bold" onClick={() => navigate("/auth")}>
                Log In
              </button>
            </div>
          )}
        </div>
      </div>
      {/* Overlay for closing dropdown */}
      {isProfileOpen && <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)}></div>}
    </nav>
  );
};

export default Navbar;