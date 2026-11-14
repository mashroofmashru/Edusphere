import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom'
import ProtectedRoute from './components/Auth/ProtectedRoute';

import Home from './pages/userPages/Home';
import AuthSignup from './pages/authenticationPage/LoginSignup';
import ExploreCourses from './pages/userPages/ExploreCourses';
import CourseDetail from './pages/userPages/CourseDetail';
import About from './pages/userPages/About';
import InstructorDashboard from './pages/instructorPages/InstructorDashBoard';
import CoursePlayer from './pages/coursePages/CoursePlayer';
import AdminDashboard from './pages/adminPages/AdminDashboard';
import Profile from './pages/userPages/Profile';
import MyCourses from './pages/userPages/MyCourses';
import InstructorCourses from './pages/instructorPages/InstructorCourses';
import InstructorStudents from './pages/instructorPages/InstructorStudents';
import InstructorReviews from './pages/instructorPages/InstructorReviews';
import InstructorSettings from './pages/instructorPages/InstructorSettings';
import NotFound from './pages/NotFound';

const TITLES = [
  [/^\/$/, 'Home'],
  [/^\/auth/, 'Sign In'],
  [/^\/about/, 'About'],
  [/^\/viewCourses/, 'Courses'],
  [/^\/course\/[^/]+\/learn/, 'Learning'],
  [/^\/course\//, 'Course Details'],
  [/^\/profile/, 'My Profile'],
  [/^\/my-courses/, 'My Learning'],
  [/^\/instructor\/courses/, 'My Courses · Instructor'],
  [/^\/instructor\/students/, 'Students · Instructor'],
  [/^\/instructor\/reviews/, 'Reviews · Instructor'],
  [/^\/instructor\/settings/, 'Settings · Instructor'],
  [/^\/instructor/, 'Instructor Dashboard'],
  [/^\/admin/, 'Admin Panel'],
];

// Scroll to top and set the document title on every route change
const RouteEffects = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
    const match = TITLES.find(([re]) => re.test(pathname));
    document.title = match ? `${match[1]} | EduSphere` : 'Page Not Found | EduSphere';
  }, [pathname]);
  return null;
};

export default function App() {
  return (
    <>
      <RouteEffects />
      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<AuthSignup />} />
        <Route path='/about' element={<About />} />
        <Route path='/viewCourses' element={<ExploreCourses />} />
        <Route path='/course/:id' element={<CourseDetail />} />

        {/* Any signed-in user */}
        <Route element={<ProtectedRoute allowedRoles={['user', 'instructor', 'admin']} />}>
          <Route path='/profile' element={<Profile />} />
          <Route path='/my-courses' element={<MyCourses />} />
          <Route path='/course/:id/learn' element={<CoursePlayer />} />
        </Route>

        {/* Instructor */}
        <Route element={<ProtectedRoute allowedRoles={['instructor', 'admin']} />}>
          <Route path="/instructor" element={<InstructorDashboard />} />
          <Route path="/instructor/courses" element={<InstructorCourses />} />
          <Route path="/instructor/students" element={<InstructorStudents />} />
          <Route path="/instructor/reviews" element={<InstructorReviews />} />
          <Route path="/instructor/settings" element={<InstructorSettings />} />
        </Route>

        {/* Admin */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}
