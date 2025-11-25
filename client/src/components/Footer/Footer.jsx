import React from "react";

const Footer = () => (
  <footer className="bg-[#162543] text-white py-10">
    <div className="container mx-auto px-4 text-center text-sm text-blue-200">
      <p>&copy; {new Date().getFullYear()} EduVerse. All rights reserved.</p>
      <p className="mt-2">
        Built with React and Tailwind CSS for a modern learning experience.
      </p>
    </div>
  </footer>
);

export default Footer;
