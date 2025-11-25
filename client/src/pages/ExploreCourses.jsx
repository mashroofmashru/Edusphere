import React from "react";
import CourseCard from "../components/Card/CourseCard";
import Navbar from "../components/Navbar/Navbar";

const ExploreCourses = () => {
  const courses = [
    {
      id: 1,
      title: "Web Development",
      description:
        "Master HTML, CSS, JavaScript and modern frameworks in this comprehensive course.",
      rating: "4.8",
      duration: "42 hours",
      price: "$89.99",
      badge: "Bestseller",
      thumbnail:
        "https://media.istockphoto.com/id/2215674535/photo/young-asian-software-development-manager-leads-a-late-night-office-discussion-with-his.jpg?s=2048x2048&w=is&k=20&c=OueOn75ZgEbe0bUfWu0XDOmmPci7j8Dvd7Y72L4hg5k=",
    },
    {
      id: 2,
      title: "Data Science Fundamentals",
      description:
        "Learn Python, statistics, machine learning and data visualization from scratch.",
      rating: "4.7",
      duration: "56 hours",
      price: "$99.99",
      badge: "New",
      thumbnail:
        "https://media.istockphoto.com/id/2148028007/photo/laptop-in-the-front-business-coach-against-projector-with-data.jpg?s=2048x2048&w=is&k=20&c=0ozXR1dlocQF4xX7tP5FHq70KizIUPT_M6iHaNUeJ7M=",
    },
    {
      id: 3,
      title: "Digital Marketing Mastery",
      description:
        "Master SEO, social media marketing, content strategy and analytics.",
      rating: "4.9",
      duration: "38 hours",
      price: "$79.99",
      badge: "Popular",
      thumbnail:
        "https://images.unsplash.com/photo-1542626991-cbc4e32524cc?q=80&w=1169&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      id: 4,
      title: "Frontend with React",
      description:
        "Build modern, high-performing user interfaces using React and related tools.",
      rating: "4.8",
      duration: "30 hours",
      price: "$84.99",
      badge: "Trending",
      thumbnail:
        "https://images.unsplash.com/photo-1553877522-43269d4ea984?q=80&w=1169&auto=format&fit=crop",
    },
    {
      id: 5,
      title: "Backend with Node.js",
      description:
        "Learn to build robust, scalable backend APIs using Node.js and Express.",
      rating: "4.6",
      duration: "40 hours",
      price: "$79.99",
      badge: "Popular",
      thumbnail:
        "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1169&auto=format&fit=crop",
    },
    {
      id: 6,
      title: "UI/UX Design Essentials",
      description:
        "Design intuitive, user-centered experiences with Figma and modern UX practices.",
      rating: "4.7",
      duration: "26 hours",
      price: "$69.99",
      badge: "New",
      thumbnail:
        "https://images.unsplash.com/photo-1602576666092-bf6447a729fc?q=80&w=1332&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
  ];

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

          {/* Courses Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {courses.map((course) => (
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
