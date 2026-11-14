import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

/**
 * Shared layout for instructor and admin areas:
 * a fixed sidebar on desktop, and a top bar with a slide-in drawer on mobile
 * (replaces the floating bottom-right toggle that covered page content).
 */
const DashboardShell = ({ brandIcon, brandText, sidebar, children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => setMobileOpen(false), [location.pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e) => e.key === 'Escape' && setMobileOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [mobileOpen]);

  const close = () => setMobileOpen(false);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-50 font-sans">
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={close} aria-hidden="true"></div>
      )}

      <aside
        className={`w-64 shrink-0 bg-navy-900 text-white fixed lg:static inset-y-0 left-0 z-50 transform transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} flex flex-col overflow-y-auto`}
        aria-label="Sidebar"
      >
        <div className="p-6 flex flex-col h-full">
          <div className="flex items-center justify-between mb-8">
            <Link to="/" className="flex items-center" aria-label="EduSphere home">
              <i className={`fas ${brandIcon} text-2xl text-blue-400 mr-2`} aria-hidden="true"></i>
              <span className="text-xl font-bold">{brandText}</span>
            </Link>
            <button onClick={close} className="lg:hidden w-9 h-9 rounded-lg hover:bg-navy-800 flex items-center justify-center" aria-label="Close menu">
              <i className="fas fa-times" aria-hidden="true"></i>
            </button>
          </div>
          {sidebar(close)}
        </div>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
        {/* Mobile top bar */}
        <header className="lg:hidden flex items-center justify-between bg-navy-900 text-white px-4 py-3 shrink-0">
          <button onClick={() => setMobileOpen(true)} className="w-10 h-10 -ml-2 rounded-lg hover:bg-navy-800 flex items-center justify-center" aria-label="Open menu">
            <i className="fas fa-bars text-lg" aria-hidden="true"></i>
          </button>
          <span className="font-bold flex items-center gap-2">
            <i className={`fas ${brandIcon} text-blue-400`} aria-hidden="true"></i> {brandText}
          </span>
          <span className="w-10"></span>
        </header>

        <main className="flex-1 w-full overflow-y-auto p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
};

export const SidebarUser = ({ user, subtitle }) => (
  <div className="flex items-center gap-3 mb-4 px-2">
    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold shrink-0">
      {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
    </div>
    <div className="min-w-0">
      <p className="text-sm font-bold truncate">{user?.name || 'User'}</p>
      <p className="text-xs text-gray-400 truncate">{subtitle || user?.email}</p>
    </div>
  </div>
);

export default DashboardShell;
