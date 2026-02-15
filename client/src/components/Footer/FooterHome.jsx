import React from 'react';

const Footer = () => {
  const quickLinks = [
    "Home", "About Us", "Courses", "Instructors"
  ];

  const socialLinks = [
    { icon: "fab fa-facebook-f", href: "https://www.facebook.com/" },
    { icon: "fab fa-twitter", href: "https://twitter.com/" },
    { icon: "fab fa-instagram", href: "https://www.instagram.com/" },
    { icon: "fab fa-linkedin-in", href: "https://www.linkedin.com/" }
  ];

  return (
    <footer className="bg-navy-900 text-white pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center mb-4">
              <i className="fas fa-graduation-cap text-2xl text-blue-400 mr-2"></i>
              <span className="text-xl font-bold">EduVerse</span>
            </div>
            <p className="text-blue-100 mb-4">
              Empowering learners worldwide with quality education accessible anytime, anywhere.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  className="text-blue-300 hover:text-white transition"
                >
                  <i className={social.icon}></i>
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <a href="#" className="text-blue-100 hover:text-white transition">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-700 text-center text-blue-200">
          <p>&copy; {new Date().getFullYear()} EduVerse. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;