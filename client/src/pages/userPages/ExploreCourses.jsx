import React, { useState, useEffect } from "react";
import CourseCard from "../../components/Card/CourseCard";
import Navbar from "../../components/Navbar/Navbar";
import api from "../../config/server";

const ExploreCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCourses();
    }, 500); // Debounce search
    return () => clearTimeout(timer);
  }, [search, category]);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const [coursesRes, categoriesRes] = await Promise.all([
        api.get(`/users/all-courses?search=${search}&category=${category}`),
        api.get('/admin/categories') // Using the public readable route
      ]);
      setCourses(coursesRes.data.data);
      setCategories(categoriesRes.data.data);
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 pt-10 pb-16">
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-12">
            <p className="text-3xl sm:text-sm font-semibold tracking-wide text-blue-600 uppercase">
              Explore All Courses
            </p>
            <h1 className="mt-2 text-3xl sm:text-4xl font-bold text-navy-900">
              Find the right course for your next step
            </h1>
            <p className="mt-4 text-gray-600 max-w-2xl mx-auto text-sm sm:text-base">
              Browse our complete catalog of expert-led courses and discover the
              perfect learning path to grow your skills and advance your career.
            </p>
          </div>

          {/* Search and Filters */}
          <div className="mb-12 space-y-6">
            <div className="max-w-xl mx-auto">
              <div className="relative group">
                <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition"></i>
                <input
                  type="text"
                  placeholder="Search courses by title..."
                  className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-3">
              {['All', ...categories.map(c => c.name)].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-6 py-2 rounded-full text-sm font-bold transition ${category === cat
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                    : 'bg-white text-gray-600 border border-gray-100 hover:bg-gray-50'
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Courses Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {loading ? (
              <div className="col-span-3 text-center py-20">
                <i className="fas fa-spinner fa-spin text-4xl text-blue-600"></i>
              </div>
            ) : courses.length > 0 ? (
              courses.map((course) => (
                <CourseCard
                  key={course._id}
                  id={course._id}
                  title={course.title}
                  description={course.subtitle || course.description} // Fallback to description
                  rating={course.rating || "New"}
                  duration={course.totalDuration ? `${Math.round(course.totalDuration / 60)} hours` : "Self-paced"}
                  price={`₹${course.price}`}
                  badge={course.level}
                  bgImage={course.thumbnail && !course.thumbnail.includes('default') ? `http://localhost:3000/${course.thumbnail.replace(/\\/g, '/')}` : 'https://via.placeholder.com/300x200'}
                />
              ))
            ) : (
              <div className="col-span-3 text-center py-20 text-gray-500">
                No courses available at the moment.
              </div>
            )}
          </div>

          {/* Button */}
          {/* <div className="mt-10 sm:mt-12 flex justify-center">
            <button className="inline-flex items-center px-8 py-3 bg-white border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition font-medium text-sm sm:text-base">
              View More Courses
            </button>
          </div> */}
        </section>
      </main>
    </>
  );
};

export default ExploreCourses;
