import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../config/server';
import DashboardShell, { SidebarUser } from './DashboardShell';
import { navItemClass } from '../../utils/format';

const approvedLinks = [
  { to: '/instructor', icon: 'fa-home', label: 'Dashboard' },
  { to: '/instructor/courses', icon: 'fa-play-circle', label: 'My Courses' },
  { to: '/instructor/students', icon: 'fa-users', label: 'Students' },
  { to: '/instructor/reviews', icon: 'fa-star', label: 'Reviews' },
];

/** Layout for every instructor page: sidebar + mobile top bar around the page content. */
const InstructorLayout = ({ children }) => {
  const { logout, user } = useAuth();
  const { pathname } = useLocation();
  const [instructorStatus, setInstructorStatus] = useState(user?.role === 'admin' ? 'approved' : null);

  useEffect(() => {
    if (user?.role !== 'instructor') return;
    api.get('/users/profile')
      .then(({ data }) => setInstructorStatus(data.data.instructorStatus))
      .catch(() => console.error('Failed to fetch status'));
  }, [user?.role]);

  const links = instructorStatus === 'approved' ? approvedLinks : [];

  return (
    <DashboardShell
      brandIcon="fa-graduation-cap"
      brandText="EduSphere"
      sidebar={(close) => (
        <>
          <nav className="space-y-2 flex-1" aria-label="Instructor">
            {links.map((l) => (
              <Link key={l.to} to={l.to} onClick={close} className={navItemClass(pathname === l.to)} aria-current={pathname === l.to ? 'page' : undefined}>
                <i className={`fas ${l.icon} mr-3 w-6 text-center`} aria-hidden="true"></i> {l.label}
              </Link>
            ))}
            <Link to="/instructor/settings" onClick={close} className={navItemClass(pathname === '/instructor/settings')}>
              <i className="fas fa-cog mr-3 w-6 text-center" aria-hidden="true"></i> Settings
            </Link>

            <div className="pt-4 border-t border-navy-800 mt-4 space-y-2">
              <Link to="/viewCourses" onClick={close} className={navItemClass(false)}>
                <i className="fas fa-globe mr-3 w-6 text-center" aria-hidden="true"></i> Browse Site
              </Link>
              <Link to="/profile" onClick={close} className={navItemClass(pathname === '/profile')}>
                <i className="fas fa-user mr-3 w-6 text-center" aria-hidden="true"></i> My Profile
              </Link>
            </div>
          </nav>

          <div className="mt-auto pt-6 border-t border-navy-800">
            <SidebarUser user={user} subtitle={instructorStatus === 'approved' ? 'Verified Instructor' : 'Instructor (pending)'} />
            <button
              onClick={logout}
              className="flex items-center p-3 hover:bg-red-600/90 bg-navy-800/60 rounded-lg transition w-full text-left text-gray-300 hover:text-white"
            >
              <i className="fas fa-sign-out-alt mr-3 w-6 text-center" aria-hidden="true"></i> Logout
            </button>
          </div>
        </>
      )}
    >
      {children}
    </DashboardShell>
  );
};

export default InstructorLayout;
