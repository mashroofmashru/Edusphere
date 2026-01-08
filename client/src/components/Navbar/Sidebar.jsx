import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const { logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => {
    // Exact match for dashboard home, startsWith for others to handle sub-routes if any
    return location.pathname === path;
  };

  const linkClass = (path) =>
    `flex items-center p-3 rounded-lg transition ${isActive(path)
      ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50'
      : 'hover:bg-gray-800 text-gray-300 hover:text-white'
    }`;

  return (
    <aside className="w-64 bg-navy-900 text-white hidden lg:flex lg:flex-col min-h-screen sticky top-0 h-screen overflow-y-auto">
      <div className="p-6 flex flex-col h-full">
        <div className="flex items-center mb-8">
          <i className="fas fa-graduation-cap text-2xl text-blue-400 mr-2"></i>
          <span className="text-xl font-bold">EduVerse</span>
        </div>

        <nav className="space-y-2 flex-1">
          <Link to="/instructor" className={linkClass("/instructor")}>
            <i className="fas fa-home mr-3 w-6 text-center"></i> Dashboard
          </Link>
          <Link to="/instructor/courses" className={linkClass("/instructor/courses")}>
            <i className="fas fa-play-circle mr-3 w-6 text-center"></i> My Courses
          </Link>
          <Link to="/instructor/students" className={linkClass("/instructor/students")}>
            <i className="fas fa-users mr-3 w-6 text-center"></i> Students
          </Link>
          <Link to="/instructor/reviews" className={linkClass("/instructor/reviews")}>
            <i className="fas fa-star mr-3 w-6 text-center"></i> Reviews
          </Link>
          <Link to="/instructor/settings" className={linkClass("/instructor/settings")}>
            <i className="fas fa-cog mr-3 w-6 text-center"></i> Settings
          </Link>

          <div className="pt-4 border-t border-gray-800 mt-4">
            <Link to="/profile" className={linkClass("/profile")}>
              <i className="fas fa-user mr-3 w-6 text-center"></i> View as Student
            </Link>
          </div>
        </nav>

        <div className="mt-auto pt-6 border-t border-gray-800">
          <button
            onClick={logout}
            className="flex items-center p-3 hover:bg-red-600/90 bg-gray-800/50 rounded-lg transition w-full text-left text-gray-300 hover:text-white"
          >
            <i className="fas fa-sign-out-alt mr-3 w-6 text-center"></i> Logout
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
