import React from 'react'
import Navbar from '../../components/Navbar/Navbar';
import Banner from '../../components/Banner/Banner';
import Featuredcourses from '../../components/FeaturedCourses/Featuredcourses';
import StatsSection from '../../components/StatsSection/StatsSection';
import Footer from '../../components/Footer/FooterHome';

// Instructors and admins land on their dashboards after login, but can still browse the public site.
const Home = () => (
  <div className="bg-gray-50 min-h-screen flex flex-col">
    <Navbar />
    <main className="flex-1">
      <Banner />
      <Featuredcourses />
      <StatsSection />
    </main>
    <Footer />
  </div>
);

export default Home
