import React from 'react'
import Navbar from '../components/Navbar/Navbar';
import Banner from '../components/Banner/Banner';
import FeaturedCourses from '../components/FeaturedCourses/Featuredcourses';
import StatsSection from '../components/StatsSection/StatsSection';
import Footer from '../components/Footer/FooterHome';
const Home = () => {
  return (
    <div className="bg-gray-50">
      <Navbar />
      <Banner />
      <FeaturedCourses />
      <StatsSection />
      <Footer />
    </div>
  )
}

export default Home
