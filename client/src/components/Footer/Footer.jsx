import React from 'react';

const Footer = () => {
  const quickLinks = [
    "Home", "About Us", "Courses", "Instructors", "Blog"
  ];

  const supportLinks = [
    "Contact Us", "FAQs", "Help Center", "Privacy Policy", "Terms of Service"
  ];

  const socialLinks = [
    { icon: "fab fa-facebook-f", href: "#" },
    { icon: "fab fa-twitter", href: "#" },
    { icon: "fab fa-instagram", href: "#" },
    { icon: "fab fa-linkedin-in", href: "#" }
  ];

  return (
    <footer className="bg-navy-900 text-white pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center mb-4">
              <i className="fas fa-graduation-cap text-2xl text-blue-400 mr-2"></i>
              <span className="text-xl font-bold">LearnHub</span>
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
          
          {/* Support */}
          <div>
            <h3 className="text-lg font-bold mb-4">Support</h3>
            <ul className="space-y-2">
              {supportLinks.map((link, index) => (
                <li key={index}>
                  <a href="#" className="text-blue-100 hover:text-white transition">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Newsletter */}
          <div>
            <h3 className="text-lg font-bold mb-4">Newsletter</h3>
            <p className="text-blue-100 mb-4">
              Subscribe to get updates on new courses and offers.
            </p>
            <div className="flex">
              <input 
                type="email" 
                placeholder="Your email" 
                className="px-4 py-2 rounded-l-lg w-full text-navy-900 focus:outline-none"
              />
              <button className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-r-lg transition">
                <i className="fas fa-paper-plane"></i>
              </button>
            </div>
          </div>
        </div>
        
        <div className="pt-8 border-t border-gray-700 text-center text-blue-200">
          <p>&copy; 2023 LearnHub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;