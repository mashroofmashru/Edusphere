import React, { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { initialOf } from '../../utils/format';

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'Courses', to: '/viewCourses' },
  { label: 'About', to: '/about' },
];

// Role-specific shortcuts shown in the profile dropdown and the mobile menu
const roleLinks = (role) => {
  const links = [{ label: 'My profile', to: '/profile' }];
  if (role === 'user') links.push({ label: 'My learning', to: '/my-courses' });
  if (role === 'instructor') links.push({ label: 'Instructor dashboard', to: '/instructor' });
  if (role === 'admin') links.push({ label: 'Admin panel', to: '/admin' });
  return links;
};

const desktopLinkClass = ({ isActive }) =>
  `text-sm font-medium transition ${isActive ? 'text-gray-900' : 'text-gray-500 hover:text-gray-900'}`;

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Close menus whenever the route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsProfileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!isProfileOpen) return;
    const onKey = (e) => e.key === 'Escape' && setIsProfileOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isProfileOpen]);

  const links = isAuthenticated ? roleLinks(user.role) : [];

  return (
    <nav className="bg-white text-gray-900 border-b border-gray-200 sticky top-0 z-50 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center" aria-label="EduSphere home">
            <i className="fas fa-graduation-cap text-xl text-blue-600 mr-2" aria-hidden="true"></i>
            <span className="text-lg font-bold">EduSphere</span>
          </Link>

          <div className="hidden md:flex gap-7 items-center mr-auto ml-10">
            {navLinks.map((link) => (
              <NavLink key={link.to} to={link.to} end={link.to === '/'} className={desktopLinkClass}>
                {link.label}
              </NavLink>
            ))}
          </div>

          <div className="hidden md:flex gap-2 items-center">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2.5 rounded-full"
                  aria-haspopup="menu"
                  aria-expanded={isProfileOpen}
                  aria-label="Account menu"
                >
                  <div className="text-right hidden lg:block">
                    <p className="text-sm font-semibold leading-tight">{user.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                  </div>
                  <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold">
                    {initialOf(user.name)}
                  </div>
                  <i className={`fas fa-chevron-down text-xs text-gray-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} aria-hidden="true"></i>
                </button>

                {isProfileOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)}></div>
                    <div role="menu" className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-1.5 text-gray-800 z-50 border border-gray-200 animate-fade-in">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="font-bold text-sm truncate">{user.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                      {links.map((l) => (
                        <button
                          key={l.to}
                          role="menuitem"
                          onClick={() => navigate(l.to)}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition"
                        >
                          {l.label}
                        </button>
                      ))}
                      <div className="border-t border-gray-100 my-1"></div>
                      <button
                        role="menuitem"
                        onClick={logout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
                      >
                        Log out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                <Link to="/auth" className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition">
                  Log in
                </Link>
                <Link to="/auth" state={{ mode: 'signup' }} className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition">
                  Sign up
                </Link>
              </>
            )}
          </div>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden w-10 h-10 -mr-2 flex items-center justify-center rounded-lg text-gray-700 hover:bg-gray-100"
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMobileMenuOpen}
          >
            <i className={`fas ${isMobileMenuOpen ? 'fa-times' : 'fa-bars'} text-xl`} aria-hidden="true"></i>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden pb-4 animate-fade-in">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) => `block py-3 border-b border-gray-100 transition ${isActive ? 'text-blue-600 font-semibold' : 'text-gray-700 hover:text-gray-900'}`}
              >
                {link.label}
              </NavLink>
            ))}
            {isAuthenticated ? (
              <>
                <div className="flex items-center gap-3 py-4 border-b border-gray-100">
                  <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">{initialOf(user.name)}</div>
                  <div className="min-w-0">
                    <p className="font-bold text-sm truncate">{user.name}</p>
                    <p className="text-xs text-gray-400 truncate">{user.email}</p>
                  </div>
                </div>
                {links.map((l) => (
                  <Link key={l.to} to={l.to} className="block py-3 text-gray-700 hover:text-gray-900 transition border-b border-gray-100">
                    {l.label}
                  </Link>
                ))}
                <button onClick={logout} className="w-full text-left py-3 text-red-600 transition">
                  Log out
                </button>
              </>
            ) : (
              <div className="mt-4 grid grid-cols-2 gap-3">
                <Link to="/auth" className="py-2.5 text-center rounded-lg border border-gray-300 font-semibold text-gray-800 hover:bg-gray-50 transition">
                  Log in
                </Link>
                <Link to="/auth" state={{ mode: 'signup' }} className="py-2.5 text-center rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition">
                  Sign up
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
