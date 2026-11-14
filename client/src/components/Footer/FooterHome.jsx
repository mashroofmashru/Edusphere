import React from 'react';
import { Link } from 'react-router-dom';

const quickLinks = [
  { label: 'Home', to: '/' },
  { label: 'Courses', to: '/viewCourses' },
  { label: 'About Us', to: '/about' },
  { label: 'Contact', to: '/about#contact' },
];

const accountLinks = [
  { label: 'Sign In', to: '/auth' },
  { label: 'My Learning', to: '/my-courses' },
  { label: 'Teach on EduSphere', to: '/auth', state: { mode: 'signup' } },
];

const socialLinks = [
  { icon: "fab fa-facebook-f", href: "https://www.facebook.com/", label: "Facebook" },
  { icon: "fab fa-twitter", href: "https://twitter.com/", label: "Twitter" },
  { icon: "fab fa-instagram", href: "https://www.instagram.com/", label: "Instagram" },
  { icon: "fab fa-linkedin-in", href: "https://www.linkedin.com/", label: "LinkedIn" }
];

/** The single site footer used on every public page. */
const Footer = () => (
  <footer className="bg-navy-900 text-white pt-12 pb-6">
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
        <div>
          <Link to="/" className="flex items-center mb-4">
            <i className="fas fa-graduation-cap text-2xl text-blue-400 mr-2" aria-hidden="true"></i>
            <span className="text-xl font-bold">EduSphere</span>
          </Link>
          <p className="text-gray-300 mb-4 max-w-xs">
            Empowering learners worldwide with quality education accessible anytime, anywhere.
          </p>
          <div className="flex gap-3">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                className="w-9 h-9 rounded-full bg-navy-800 flex items-center justify-center text-gray-300 hover:bg-blue-600 hover:text-white transition"
              >
                <i className={social.icon} aria-hidden="true"></i>
              </a>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-bold mb-4">Quick Links</h3>
          <ul className="space-y-2">
            {quickLinks.map((link) => (
              <li key={link.label}>
                <Link to={link.to} className="text-gray-300 hover:text-white transition">{link.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-bold mb-4">Get Started</h3>
          <ul className="space-y-2">
            {accountLinks.map((link) => (
              <li key={link.label}>
                <Link to={link.to} state={link.state} className="text-gray-300 hover:text-white transition">{link.label}</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="pt-6 border-t border-navy-700 text-center text-sm text-gray-400">
        <p>&copy; {new Date().getFullYear()} EduSphere. All rights reserved.</p>
      </div>
    </div>
  </footer>
);

export default Footer;
