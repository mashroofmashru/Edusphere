// components/Banner.js
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Banner = () => {
  const { isAuthenticated, user } = useAuth();
  const features = [
    {
      icon: "fas fa-book",
      title: "Interactive Lessons",
      description: "Engaging content with quizzes"
    },
    {
      icon: "fas fa-laptop",
      title: "Learn Anywhere",
      description: "Access on all devices"
    },
    {
      icon: "fas fa-certificate",
      title: "Earn Certificates",
      description: "Showcase your skills"
    }
  ];

  return (
    <section className="bg-gradient-to-r from-navy-900 to-blue-800 text-white py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-10 md:mb-0">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 leading-tight">
              Unlock Your Potential with Online Learning
            </h1>
            <p className="text-lg sm:text-xl mb-8 text-blue-100">
              Access thousands of courses taught by industry experts. Learn at your own pace and achieve your goals.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/viewCourses" className="px-6 py-3 bg-blue-500 hover:bg-blue-400 text-white rounded-lg transition font-bold text-center shadow-lg shadow-blue-900/30">
                Browse Courses
              </Link>
              {isAuthenticated ? (
                user?.role === 'user' && (
                  <Link to="/my-courses" className="px-6 py-3 bg-transparent border-2 border-white rounded-lg hover:bg-white hover:text-navy-900 transition font-medium text-center">
                    Continue Learning
                  </Link>
                )
              ) : (
                <Link to="/auth" state={{ mode: 'signup' }} className="px-6 py-3 bg-transparent border-2 border-white rounded-lg hover:bg-white hover:text-navy-900 transition font-medium text-center">
                  Get Started Free
                </Link>
              )}
            </div>
          </div>
          <div className="md:w-1/2 flex justify-center">
            <div className="relative w-full max-w-md">
              <div className="absolute -top-4 -left-4 sm:-top-6 sm:-left-6 w-full h-full bg-blue-400 rounded-xl opacity-20" aria-hidden="true"></div>
              <div className="relative bg-white text-navy-900 p-6 rounded-xl shadow-xl">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center mb-4 last:mb-0">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4 shrink-0">
                      <i className={`${feature.icon} text-blue-600 text-xl`} aria-hidden="true"></i>
                    </div>
                    <div>
                      <h3 className="font-bold">{feature.title}</h3>
                      <p className="text-sm text-gray-600">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Banner;