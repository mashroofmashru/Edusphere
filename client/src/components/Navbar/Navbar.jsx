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
  const links = [{ label: 'My Profile', to: '/profile', icon: 'fa-user-circle' }];
  if (role === 'user') links.push({ label: 'My Learning', to: '/my-courses', icon: 'fa-book-open' });
  if (role === 'instructor') links.push({ label: 'Instructor Dashboard', to: '/instructor', icon: 'fa-chalkboard-teacher' });
  if (role === 'admin') links.push({ label: 'Admin Panel', to: '/admin', icon: 'fa-user-shield' });
  return links;
};

const desktopLinkClass = ({ isActive }) =>
  `font-medium transition pb-1 border-b-2 ${isActive ? 'text-white border-blue-400' : 'text-gray-300 border-transparent hover:text-white'}`;

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
    <nav className="bg-navy-900 text-white shadow-lg sticky top-0 z-50 font-sans">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="flex items-center" aria-label="EduSphere home">
            <i className="fas fa-graduation-cap text-2xl text-blue-400 mr-2" aria-hidden="true"></i>
            <span className="text-xl font-bold">EduSphere</span>
          </Link>

          <div className="hidden md:flex space-x-8 items-center">
            {navLinks.map((link) => (
              <NavLink key={link.to} to={link.to} end={link.to === '/'} className={desktopLinkClass}>
                {link.label}
              </NavLink>
            ))}
          </div>

          <div className="hidden md:flex space-x-4 items-center">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-3 rounded-full"
                  aria-haspopup="menu"
                  aria-expanded={isProfileOpen}
                  aria-label="Account menu"
                >
                  <div className="text-right hidden lg:block">
                    <p className="text-sm font-bold">{user.name}</p>
                    <p className="text-xs text-gray-400 capitalize">{user.role}</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold border-2 border-blue-400">
                    {initialOf(user.name)}
                  </div>
                  <i className={`fas fa-chevron-down text-xs text-gray-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} aria-hidden="true"></i>
                </button>

                {isProfileOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)}></div>
                    <div role="menu" className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-xl py-2 text-gray-800 z-50 border border-gray-100 animate-fade-in">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="font-bold text-sm truncate">{user.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                      {links.map((l) => (
                        <button
                          key={l.to}
                          role="menuitem"
                          onClick={() => navigate(l.to)}
                          className="w-full text-left px-4 py-2 hover:bg-gray-50 hover:text-blue-600 transition flex items-center gap-2"
                        >
                          <i className={`fas ${l.icon} w-4`} aria-hidden="true"></i> {l.label}
                        </button>
                      ))}
                      <div className="border-t border-gray-100 my-1"></div>
                      <button
                        role="menuitem"
                        onClick={logout}
                        className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition flex items-center gap-2"
                      >
                        <i className="fas fa-sign-out-alt w-4" aria-hidden="true"></i> Log Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                <Link to="/auth" className="px-4 py-2 text-gray-200 hover:text-white font-medium transition">
                  Log In
                </Link>
                <Link to="/auth" state={{ mode: 'signup' }} className="px-5 py-2 rounded-lg hover:bg-blue-700 transition bg-blue-600 font-bold shadow-lg shadow-blue-900/20">
                  Sign Up
                </Link>
              </>
            )}
          </div>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden w-10 h-10 -mr-2 flex items-center justify-center rounded-lg text-white hover:bg-navy-800"
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
                className={({ isActive }) => `block py-3 border-b border-navy-800 transition ${isActive ? 'text-blue-300 font-bold' : 'hover:text-blue-300'}`}
              >
                {link.label}
              </NavLink>
            ))}
            {isAuthenticated ? (
              <>
                <div className="flex items-center gap-3 py-4 border-b border-navy-800">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold">{initialOf(user.name)}</div>
                  <div className="min-w-0">
                    <p className="font-bold text-sm truncate">{user.name}</p>
                    <p className="text-xs text-gray-400 truncate">{user.email}</p>
                  </div>
                </div>
                {links.map((l) => (
                  <Link key={l.to} to={l.to} className="flex items-center gap-3 py-3 hover:text-blue-300 transition border-b border-navy-800">
                    <i className={`fas ${l.icon} w-4 text-gray-400`} aria-hidden="true"></i> {l.label}
                  </Link>
                ))}
                <button onClick={logout} className="w-full flex items-center gap-3 text-left py-3 text-red-400 hover:text-red-300 transition">
                  <i className="fas fa-sign-out-alt w-4" aria-hidden="true"></i> Log Out
                </button>
              </>
            ) : (
              <div className="mt-4 grid grid-cols-2 gap-3">
                <Link to="/auth" className="py-3 text-center rounded-lg border border-navy-700 font-bold hover:bg-navy-800 transition">
                  Log In
                </Link>
                <Link to="/auth" state={{ mode: 'signup' }} className="py-3 text-center rounded-lg bg-blue-600 font-bold hover:bg-blue-700 transition">
                  Sign Up
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
