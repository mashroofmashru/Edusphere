import React from 'react';
import CourseCard from '../Card/CourseCard';
import { useNavigate } from 'react-router-dom';

const FeaturedCourses = () => {
  const navigate= useNavigate();
  const ExploreCousers = () => {
        navigate('/viewCourses');
        window.scrollTo({ top: 0, behavior: "smooth" });
    };
  const courses = [
    {
      id: 1,
      title: "Web Development Bootcamp",
      description: "Master in HTML, CSS, JavaScript, frameworks in this course.",
      rating: "4.8",
      duration: "42 hours",
      price: "$89.99",
      badge: "Bestseller",
      thumbnail:"https://media.istockphoto.com/id/2215674535/photo/young-asian-software-development-manager-leads-a-late-night-office-discussion-with-his.jpg?s=2048x2048&w=is&k=20&c=OueOn75ZgEbe0bUfWu0XDOmmPci7j8Dvd7Y72L4hg5k="
    },
    {
      id: 2,
      title: "Data Science Fundamentals",
      description: "Learn Python, statistics, machine learning and data visualization from scratch.",
      rating: "4.7",
      duration: "56 hours",
      price: "$99.99",
      badge: "New",
      thumbnail:"https://media.istockphoto.com/id/2148028007/photo/laptop-in-the-front-business-coach-against-projector-with-data.jpg?s=2048x2048&w=is&k=20&c=0ozXR1dlocQF4xX7tP5FHq70KizIUPT_M6iHaNUeJ7M="
    },
    {
      id: 3,
      title: "Digital Marketing Mastery",
      description: "Master SEO, social media marketing, content strategy and analytics.",
      rating: "4.9",
      duration: "38 hours",
      price: "$79.99",
      badge: "Popular",
      thumbnail:"https://images.unsplash.com/photo-1542626991-cbc4e32524cc?q=80&w=1169&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
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
              bgImage={course.thumbnail}
            />
          ))}
        </div>
        
        <div className="text-center mt-12" onClick={ExploreCousers}>
          <button className="px-8 py-3 bg-white border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition font-medium">
            View All Courses
          </button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedCourses;