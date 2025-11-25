import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
const Navbar = () => {
  const navigate=useNavigate()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Courses', href: '/viewCourses' },
    // { label: 'Instructors', href: '#' },
    // { label: 'Resources', href: '#' },
    { label: 'About', href: '/about' },
  ];

  return (
    <nav className="bg-navy-900 text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex items-center">
            <i className="fas fa-graduation-cap text-2xl text-blue-400 mr-2"></i>
            <span className="text-xl font-bold">EduVerse</span>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-8">
            {navLinks.map((link, index) => (
              <a 
                key={index} 
                href={link.href} 
                className="hover:text-blue-300 transition"
              >
                {link.label}
              </a>
            ))}
          </div>
          
          {/* Auth Buttons */}
          <div className="hidden md:flex space-x-4">
            <button className="px-4 py-2 rounded hover:bg-blue-700 transition bg-blue-600" onClick={()=>navigate("/login")}>
              Log In
            </button>
          </div>
          
          {/* Mobile Menu Button */}
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
              className="block py-2 hover:text-blue-300 transition"
            >
              {link.label}
            </a>
          ))}
          <div className="mt-4 pt-4 border-t border-gray-700">
            <button className="w-full mb-2 py-2 rounded hover:bg-blue-700 transition" onClick={()=>navigate("/login")}>
              Log In
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;