import React, { useState, useEffect, useMemo } from "react";
import CourseCard from "../../components/Card/CourseCard";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/FooterHome";
import { CardSkeleton, EmptyState } from "../../components/UI/Feedback";
import { toCardProps } from "../../utils/format";
import api from "../../config/server";

const SORTS = {
  popular: (a, b) => (b.enrolledStudents?.length || 0) - (a.enrolledStudents?.length || 0),
  rating: (a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0),
  newest: (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
  priceLow: (a, b) => Number(a.price) - Number(b.price),
  priceHigh: (a, b) => Number(b.price) - Number(a.price),
};

const selectClass = "p-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-navy-900 focus:ring-2 focus:ring-blue-500 outline-none";

const ExploreCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [categories, setCategories] = useState([]);
  const [level, setLevel] = useState("All");
  const [price, setPrice] = useState("All");
  const [sort, setSort] = useState("popular");

  // Categories only need loading once
  useEffect(() => {
    api.get('/admin/categories')
      .then(({ data }) => setCategories(data.data || []))
      .catch((error) => console.error("Failed to fetch categories", error));
  }, []);

  // Debounced server-side search; previous results stay visible while the next set loads
  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ search: search.trim(), category });
        const { data } = await api.get(`/users/all-courses?${params}`);
        setCourses(data.data || []);
      } catch (error) {
        console.error("Failed to fetch courses", error);
      } finally {
        setLoading(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [search, category]);

  const visible = useMemo(() => {
    return courses
      .filter((c) => level === "All" || c.level === level)
      .filter((c) => price === "All" || (price === "Free" ? Number(c.price) === 0 : Number(c.price) > 0))
      .sort(SORTS[sort]);
  }, [courses, level, price, sort]);

  const filtersActive = search || category !== "All" || level !== "All" || price !== "All";
  const resetFilters = () => {
    setSearch("");
    setCategory("All");
    setLevel("All");
    setPrice("All");
  };

  const firstLoad = loading && courses.length === 0;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 pt-10 pb-16">
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-12">
            <p className="text-sm font-semibold tracking-wide text-blue-600 uppercase">Explore All Courses</p>
            <h1 className="mt-2 text-2xl sm:text-4xl font-bold text-navy-900">Find the right course for your next step</h1>
            <p className="mt-4 text-gray-600 max-w-2xl mx-auto text-sm sm:text-base">
              Browse our complete catalog of expert-led courses and discover the perfect learning path to grow your skills.
            </p>
          </div>

          <div className="mb-8 space-y-5">
            <div className="max-w-xl mx-auto">
              <div className="relative group">
                <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition" aria-hidden="true"></i>
                <input
                  type="text"
                  aria-label="Search courses"
                  placeholder="Search courses by title..."
                  className="w-full pl-12 pr-12 py-3 bg-white border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    aria-label="Clear search"
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
                  >
                    <i className="fas fa-times" aria-hidden="true"></i>
                  </button>
                )}
              </div>
            </div>

            <div className="flex overflow-x-auto gap-3 pb-2 hide-scrollbar" role="group" aria-label="Category">
              {['All', ...categories.map(c => c.name)].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  aria-pressed={category === cat}
                  className={`shrink-0 whitespace-nowrap px-5 py-2 rounded-full text-sm font-bold transition ${category === cat
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
              <p className="text-sm text-gray-500" aria-live="polite">
                {firstLoad ? 'Loading courses…' : `${visible.length} course${visible.length === 1 ? '' : 's'}${search ? ` for "${search}"` : ''}`}
                {loading && !firstLoad && <i className="fas fa-spinner fa-spin ml-2 text-blue-600" aria-hidden="true"></i>}
              </p>
              <div className="grid grid-cols-3 sm:flex gap-2">
                <select aria-label="Level" value={level} onChange={(e) => setLevel(e.target.value)} className={selectClass}>
                  <option value="All">All levels</option>
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                </select>
                <select aria-label="Price" value={price} onChange={(e) => setPrice(e.target.value)} className={selectClass}>
                  <option value="All">Any price</option>
                  <option value="Free">Free</option>
                  <option value="Paid">Paid</option>
                </select>
                <select aria-label="Sort by" value={sort} onChange={(e) => setSort(e.target.value)} className={selectClass}>
                  <option value="popular">Most popular</option>
                  <option value="rating">Highest rated</option>
                  <option value="newest">Newest</option>
                  <option value="priceLow">Price: low to high</option>
                  <option value="priceHigh">Price: high to low</option>
                </select>
              </div>
            </div>
          </div>

          <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 transition-opacity ${loading && !firstLoad ? 'opacity-60' : ''}`}>
            {firstLoad ? (
              Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)
            ) : visible.length > 0 ? (
              visible.map((course) => <CourseCard key={course._id} {...toCardProps(course)} />)
            ) : (
              <div className="col-span-full bg-white rounded-2xl border border-gray-100">
                {filtersActive ? (
                  <EmptyState
                    icon="fa-search"
                    title="No matching courses"
                    message={search ? `We couldn't find anything for "${search}". Try another keyword or remove some filters.` : 'Try removing some filters.'}
                    action={<button onClick={resetFilters} className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition">Clear all filters</button>}
                  />
                ) : (
                  <EmptyState icon="fa-book-open" title="No courses yet" message="New courses are on their way. Check back soon!" />
                )}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default ExploreCourses;
