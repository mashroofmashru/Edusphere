import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar/Navbar';
import Banner from '../../components/Banner/Banner';
import Featuredcourses from '../../components/FeaturedCourses/Featuredcourses';
import StatsSection from '../../components/StatsSection/StatsSection';
import Footer from '../../components/Footer/FooterHome';

const Home = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'admin') {
        navigate('/admin', { replace: true });
      } else if (user.role === 'instructor') {
        navigate('/instructor', { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  return (
    <div className="bg-gray-50">
      <Navbar />
      <Banner />
      <Featuredcourses />
      <StatsSection />
      <Footer />
    </div>
  )
}

export default Home
