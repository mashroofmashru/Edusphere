// components/FeaturedCourses.js
import React from 'react';
import CourseCard from '../Card/CourseCard';

const FeaturedCourses = () => {
  const courses = [
    {
      id: 1,
      title: "Web Development Bootcamp",
      description: "Master HTML, CSS, JavaScript and modern frameworks in this comprehensive course.",
      rating: "4.8",
      duration: "42 hours",
      price: "$89.99",
      badge: "Bestseller",
      gradientFrom: "#3b82f6",
      gradientTo: "#1d4ed8"
    },
    {
      id: 2,
      title: "Data Science Fundamentals",
      description: "Learn Python, statistics, machine learning and data visualization from scratch.",
      rating: "4.7",
      duration: "56 hours",
      price: "$99.99",
      badge: "New",
      gradientFrom: "#60a5fa",
      gradientTo: "#3b82f6"
    },
    {
      id: 3,
      title: "Digital Marketing Mastery",
      description: "Master SEO, social media marketing, content strategy and analytics.",
      rating: "4.9",
      duration: "38 hours",
      price: "$79.99",
      badge: "Popular",
      gradientFrom: "#2563eb",
      gradientTo: "#1e40af"
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-navy-900 mb-4">
            Featured Courses
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover our most popular courses handpicked by our team of experts to help you advance your career.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map(course => (
            <CourseCard
              key={course.id}
              title={course.title}
              description={course.description}
              rating={course.rating}
              duration={course.duration}
              price={course.price}
              badge={course.badge}
              gradientFrom={course.gradientFrom}
              gradientTo={course.gradientTo}
            />
          ))}
        </div>
        
        <div className="text-center mt-12">
          <button className="px-8 py-3 bg-white border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition font-medium">
            View All Courses
          </button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedCourses;