import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import CourseCard from "../../components/Card/CourseCard";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/FooterHome";
import { CardSkeleton } from "../../components/UI/Feedback";
import { toCardProps } from "../../utils/format";
import api from "../../config/server";

const SORTS = {
  popular: (a, b) => (b.enrollCount || 0) - (a.enrollCount || 0),
  rating: (a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0),
  newest: (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
  priceLow: (a, b) => Number(a.price) - Number(b.price),
  priceHigh: (a, b) => Number(b.price) - Number(a.price),
};

const selectClass = "rounded-lg border border-gray-300 bg-white py-2 pl-3 pr-8 text-sm text-gray-700 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100";

const ExploreCourses = () => {
  // The home page search sends people here with ?search=...
  const [searchParams] = useSearchParams();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "All");
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
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Courses</h1>
            <p className="mt-1 text-sm text-gray-500" aria-live="polite">
              {firstLoad
                ? 'Loading…'
                : `${visible.length} course${visible.length === 1 ? '' : 's'}${search ? ` matching "${search}"` : ''}`}
              {loading && !firstLoad && <i className="fas fa-spinner fa-spin ml-2 text-gray-400" aria-hidden="true"></i>}
            </p>
          </div>

          <div className="relative w-full md:w-80">
            <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400" aria-hidden="true"></i>
            <input
              type="search"
              aria-label="Search courses"
              placeholder="Search by title"
              className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-[15px] placeholder:text-gray-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="mt-6 border-b border-gray-200">
          <div className="flex gap-6 overflow-x-auto hide-scrollbar -mb-px" role="group" aria-label="Category">
            {['All', ...categories.map(c => c.name)].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                aria-pressed={category === cat}
                className={`shrink-0 whitespace-nowrap border-b-2 pb-2.5 text-sm font-medium transition ${category === cat
                  ? 'border-blue-600 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-900'
                  }`}
              >
                {cat === 'All' ? 'All courses' : cat}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 mb-6 flex flex-wrap items-center gap-2">
          <select aria-label="Level" value={level} onChange={(e) => setLevel(e.target.value)} className={selectClass}>
            <option value="All">Any level</option>
            <option>Beginner</option>
            <option>Intermediate</option>
            <option>Advanced</option>
          </select>
          <select aria-label="Price" value={price} onChange={(e) => setPrice(e.target.value)} className={selectClass}>
            <option value="All">Any price</option>
            <option value="Free">Free</option>
            <option value="Paid">Paid</option>
          </select>
          <select aria-label="Sort by" value={sort} onChange={(e) => setSort(e.target.value)} className={`${selectClass} sm:ml-auto`}>
            <option value="popular">Most popular</option>
            <option value="rating">Highest rated</option>
            <option value="newest">Newest</option>
            <option value="priceLow">Price: low to high</option>
            <option value="priceHigh">Price: high to low</option>
          </select>
          {filtersActive && (
            <button onClick={resetFilters} className="text-sm font-medium text-blue-600 hover:underline px-1">
              Clear filters
            </button>
          )}
        </div>

        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-8 transition-opacity ${loading && !firstLoad ? 'opacity-60' : ''}`}>
          {firstLoad ? (
            Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)
          ) : visible.length > 0 ? (
            visible.map((course) => <CourseCard key={course._id} {...toCardProps(course)} />)
          ) : (
            <div className="col-span-full py-12 text-center">
              {filtersActive ? (
                <>
                  <p className="font-medium text-gray-900">Nothing matches that.</p>
                  <p className="mt-1 text-sm text-gray-500">
                    {search ? `No courses for "${search}". Try a different word or ` : 'Try '}
                    <button onClick={resetFilters} className="font-medium text-blue-600 hover:underline">clearing the filters</button>.
                  </p>
                </>
              ) : (
                <p className="text-gray-500">No courses published yet. Check back soon.</p>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ExploreCourses;
