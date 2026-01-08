import { Routes, Route } from 'react-router-dom'
import ProtectedRoute from './components/Auth/ProtectedRoute';

//imported elements
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

export default function App() {
  return (
    <Routes>
      {/* user routers */}
      <Route path="/" element={<Home />} />
      <Route path="/auth" element={<AuthSignup />} />
      <Route path='/about' element={<About />} />
      <Route path='/viewCourses' element={<ExploreCourses />} />
      <Route path='/course/:id' element={<CourseDetail />} />
      <Route element={<ProtectedRoute allowedRoles={['user', 'instructor', 'admin']} />}>
        <Route path='/profile' element={<Profile />} />
        <Route path='/my-courses' element={<MyCourses />} />
        <Route path='/course/:id/learn' element={<CoursePlayer />} />
      </Route>

      {/* Instructor Router */}
      <Route element={<ProtectedRoute allowedRoles={['instructor', 'admin']} />}>
        <Route path="/instructor" element={<InstructorDashboard />} />
        <Route path="/instructor/courses" element={<InstructorCourses />} />
        <Route path="/instructor/students" element={<InstructorStudents />} />
        <Route path="/instructor/reviews" element={<InstructorReviews />} />
        <Route path="/instructor/settings" element={<InstructorSettings />} />
      </Route>

      {/* admin Roters */}
      <Route path="/admin" element={<AdminDashboard />} />
    </Routes>
  );
}