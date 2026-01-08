import React, { useState, useEffect } from 'react';
import CourseCard from '../Card/CourseCard';
import { useNavigate } from 'react-router-dom';
import api from '../../config/server';

const Featuredcourses = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedCourses();
  }, []);

  const fetchFeaturedCourses = async () => {
    try {
      const { data } = await api.get('users/all-courses');
      if (data.success && data.data.length > 0) {
        const shuffled = [...data.data].sort(() => 0.5 - Math.random());
        setCourses(shuffled.slice(0, 3));
      }
    } catch (error) {
      console.error("Failed to fetch featured courses", error);
    } finally {
      setLoading(false);
    }
  };

  const ExploreCousers = () => {
    navigate('/viewCourses');
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-navy-900 mb-4">Featured Courses</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover our most popular courses handpicked by our team of experts to help you advance your career.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            <div className="col-span-3 text-center py-10">
              <i className="fas fa-spinner fa-spin text-4xl text-blue-600"></i>
            </div>
          ) : courses.length > 0 ? (
            courses.map(course => (
              <CourseCard
                key={course._id}
                id={course._id}
                title={course.title}
                description={course.subtitle || course.description}
                rating={course.rating || "New"}
                duration={course.totalDuration ? `${Math.round(course.totalDuration / 60)} hours` : "Self-paced"}
                price={`₹${course.price}`}
                badge={course.level}
                bgImage={course.thumbnail && !course.thumbnail.includes('default') ? `http://localhost:3000/${course.thumbnail.replace(/\\/g, '/')}` : 'https://via.placeholder.com/300x200'}
              />
            ))
          ) : (
            <div className="col-span-3 text-center text-gray-500">No featured courses available</div>
          )}
        </div>

        <div className="text-center mt-12" onClick={ExploreCousers}>
          <button className="px-8 py-3 bg-white border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition font-medium">
            View All Courses
          </button>
        </div>
      </div>
    </div>
  );
};

export default Featuredcourses;