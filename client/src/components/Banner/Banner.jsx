// components/Banner.js
import React from 'react';

const Banner = () => {
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
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Unlock Your Potential with Online Learning
            </h1>
            <p className="text-xl mb-6 text-blue-100">
              Access thousands of courses taught by industry experts. Learn at your own pace and achieve your goals.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              {/* <button className="px-6 py-3 bg-blue-500 rounded-lg hover:bg-blue-400 transition font-medium">
                Explore Courses
              </button> */}
              <button className="px-6 py-3 bg-transparent border-2 border-white rounded-lg hover:bg-white hover:text-navy-900 transition font-medium">
                Explore Courses
              </button>
              {/* <button className="px-6 py-3 bg-transparent border-2 border-white rounded-lg hover:bg-white hover:text-navy-900 transition font-medium">
                Become an Instructor
              </button> */}
            </div>
          </div>
          <div className="md:w-1/2 flex justify-center">
            <div className="relative w-full max-w-md">
              <div className="absolute -top-6 -left-6 w-full h-full bg-blue-400 rounded-xl opacity-20"></div>
              <div className="relative bg-white text-navy-900 p-6 rounded-xl shadow-xl">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center mb-4 last:mb-0">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                      <i className={`${feature.icon} text-blue-600 text-xl`}></i>
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