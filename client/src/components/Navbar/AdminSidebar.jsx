import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import DashboardShell, { SidebarUser } from './DashboardShell';
import { navItemClass } from '../../utils/format';

const sections = [
  { id: 'dashboard', icon: 'fa-home', label: 'Dashboard' },
  { id: 'courses', icon: 'fa-book', label: 'Manage Courses' },
  { id: 'users', icon: 'fa-users', label: 'Manage Users' },
  { id: 'categories', icon: 'fa-tags', label: 'Categories' },
  { id: 'enrollments', icon: 'fa-list-alt', label: 'Enrollments' },
  { id: 'messages', icon: 'fa-envelope', label: 'Messages', badgeKey: 'messages' },
  { id: 'instructors', icon: 'fa-chalkboard-teacher', label: 'Instructor Requests', badgeKey: 'instructors' },
];

/** Admin layout. `badges` = { messages: n, instructors: n } for unread / pending counts. */
const AdminLayout = ({ activeSection, setActiveSection, badges = {}, children }) => {
  const { logout, user } = useAuth();

  return (
    <DashboardShell
      brandIcon="fa-user-shield"
      brandText="Admin Panel"
      sidebar={(close) => (
        <>
          <nav className="space-y-2 flex-1" aria-label="Admin">
            {sections.map((s) => {
              const count = s.badgeKey ? badges[s.badgeKey] : 0;
              return (
                <button
                  key={s.id}
                  onClick={() => { setActiveSection(s.id); close(); }}
                  className={navItemClass(activeSection === s.id)}
                  aria-current={activeSection === s.id ? 'page' : undefined}
                >
                  <i className={`fas ${s.icon} w-6 text-center mr-2`} aria-hidden="true"></i>
                  <span className="flex-1">{s.label}</span>
                  {count > 0 && (
                    <span className="ml-2 min-w-[1.5rem] px-1.5 py-0.5 rounded-full bg-red-500 text-white text-xs font-bold text-center">
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
            <div className="pt-4 border-t border-navy-800 mt-4">
              <Link to="/" onClick={close} className={navItemClass(false)}>
                <i className="fas fa-globe w-6 text-center mr-2" aria-hidden="true"></i> View Site
              </Link>
            </div>
          </nav>

          <div className="mt-auto pt-6 border-t border-navy-800">
            <SidebarUser user={user} subtitle="Administrator" />
            <button
              onClick={logout}
              className="flex items-center p-3 hover:bg-red-600 bg-navy-800/60 rounded-lg transition w-full text-left text-gray-300 hover:text-white"
            >
              <i className="fas fa-sign-out-alt w-6 text-center mr-2" aria-hidden="true"></i> Logout
            </button>
          </div>
        </>
      )}
    >
      {children}
    </DashboardShell>
  );
};

export default AdminLayout;
