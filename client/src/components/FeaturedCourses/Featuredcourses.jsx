import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import CourseCard from '../Card/CourseCard';
import api from '../../config/server';
import { CardSkeleton } from '../UI/Feedback';
import { toCardProps } from '../../utils/format';

const Featuredcourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Ask the server for just the top 3 (highest rated, then most enrolled)
    // instead of downloading every course and discarding the rest.
    api.get('/users/all-courses', { params: { sort: 'rating', limit: 3 } })
      .then(({ data }) => {
        if (data.success) setCourses(data.data || []);
      })
      .catch((error) => console.error('Failed to fetch featured courses', error))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-navy-900 mb-4">Featured Courses</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Our top-rated courses, chosen by learners like you, to help you advance your career.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {loading ? (
            [1, 2, 3].map((i) => <CardSkeleton key={i} />)
          ) : courses.length > 0 ? (
            courses.map((course) => <CourseCard key={course._id} {...toCardProps(course)} />)
          ) : (
            <div className="col-span-full text-center text-gray-500 py-10">New courses are on their way. Check back soon!</div>
          )}
        </div>

        <div className="text-center mt-12">
          <Link to="/viewCourses" className="inline-block px-8 py-3 bg-white border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition font-medium">
            View All Courses
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Featuredcourses;
