import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/FooterHome';

const NotFound = () => (
  <div className="min-h-screen flex flex-col bg-gray-50">
    <Navbar />
    <main className="flex-1 flex items-center justify-center px-4 py-20">
      <div className="text-center max-w-md">
        <p className="text-7xl font-extrabold text-blue-600">404</p>
        <h1 className="mt-4 text-2xl sm:text-3xl font-bold text-navy-900">Page not found</h1>
        <p className="mt-3 text-gray-500">The page you're looking for doesn't exist or has been moved.</p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/" className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition">
            Go Home
          </Link>
          <Link to="/viewCourses" className="px-6 py-3 bg-white border border-gray-200 text-navy-900 font-bold rounded-xl hover:bg-gray-50 transition">
            Browse Courses
          </Link>
        </div>
      </div>
    </main>
    <Footer />
  </div>
);

export default NotFound;
