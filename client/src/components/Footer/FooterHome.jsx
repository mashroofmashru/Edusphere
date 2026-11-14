import React from 'react';
import { Link } from 'react-router-dom';

const links = [
  { label: 'Courses', to: '/viewCourses' },
  { label: 'About', to: '/about' },
  { label: 'Teach on EduSphere', to: '/auth', state: { mode: 'signup' } },
  { label: 'Contact', to: '/about#contact' },
];

/** The single site footer used on every public page. */
const Footer = () => (
  <footer className="border-t border-gray-200 bg-white">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between text-sm">
      <div className="flex items-center gap-2 text-gray-500">
        <i className="fas fa-graduation-cap text-blue-600" aria-hidden="true"></i>
        <span className="font-semibold text-gray-900">EduSphere</span>
        <span>&copy; {new Date().getFullYear()}</span>
      </div>
      <nav className="flex flex-wrap gap-x-6 gap-y-2" aria-label="Footer">
        {links.map((link) => (
          <Link key={link.label} to={link.to} state={link.state} className="text-gray-500 hover:text-gray-900">
            {link.label}
          </Link>
        ))}
      </nav>
    </div>
  </footer>
);

export default Footer;
