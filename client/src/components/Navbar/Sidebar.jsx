import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import api from '../../config/server';

const Sidebar = () => {
  const { logout, user } = useAuth();
  const location = useLocation();
  const [instructorStatus, setInstructorStatus] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const fetchStatus = async () => {
      if (user?.role === 'instructor') {
        try {
          const { data } = await api.get('/users/profile');
          setInstructorStatus(data.data.instructorStatus);
        } catch (err) {
          console.error("Failed to fetch status");
        }
      }
    };
    if (user) fetchStatus();
  }, [user]);

  const isActive = (path) => {
    return location.pathname === path;
  };

  const linkClass = (path) =>
    `flex items-center p-3 rounded-lg transition ${isActive(path)
      ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50'
      : 'hover:bg-gray-800 text-gray-300 hover:text-white'
    }`;

  const isApproved = instructorStatus === 'approved';

  return (
    <>
      {/* Mobile Toggle */}
      <button 
          className="lg:hidden fixed bottom-6 right-6 z-50 w-14 h-14 bg-navy-900 text-white rounded-full shadow-2xl flex items-center justify-center text-2xl hover:bg-navy-800 transition"
          onClick={() => setMobileOpen(!mobileOpen)}
      >
          <i className={`fas ${mobileOpen ? 'fa-times' : 'fa-bars'}`}></i>
      </button>

      {/* Overlay */}
      {mobileOpen && (
          <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden transition-opacity"
              onClick={() => setMobileOpen(false)}
          ></div>
      )}

      <aside className={`w-64 bg-navy-900 text-white flex-col min-h-screen fixed lg:static top-0 left-0 h-screen z-40 transform transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} flex overflow-y-auto`}>
        <div className="p-6 flex flex-col h-full">
          <div className="flex items-center mb-8 pt-4 lg:pt-0">
            <i className="fas fa-graduation-cap text-2xl text-blue-400 mr-2"></i>
            <span className="text-xl font-bold">EduSphere</span>
          </div>

          <nav className="space-y-2 flex-1">
            {isApproved && (
              <>
                <Link to="/instructor" onClick={() => setMobileOpen(false)} className={linkClass("/instructor")}>
                  <i className="fas fa-home mr-3 w-6 text-center"></i> Dashboard
                </Link>
                <Link to="/instructor/courses" onClick={() => setMobileOpen(false)} className={linkClass("/instructor/courses")}>
                  <i className="fas fa-play-circle mr-3 w-6 text-center"></i> My Courses
                </Link>
                <Link to="/instructor/students" onClick={() => setMobileOpen(false)} className={linkClass("/instructor/students")}>
                  <i className="fas fa-users mr-3 w-6 text-center"></i> Students
                </Link>
                <Link to="/instructor/reviews" onClick={() => setMobileOpen(false)} className={linkClass("/instructor/reviews")}>
                  <i className="fas fa-star mr-3 w-6 text-center"></i> Reviews
                </Link>
              </>
            )}

            <Link to="/instructor/settings" onClick={() => setMobileOpen(false)} className={linkClass("/instructor/settings")}>
              <i className="fas fa-cog mr-3 w-6 text-center"></i> Settings
            </Link>

            <div className="pt-4 border-t border-gray-800 mt-4">
              <Link to="/profile" onClick={() => setMobileOpen(false)} className={linkClass("/profile")}>
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
    </>
  );
};

export default Sidebar;
