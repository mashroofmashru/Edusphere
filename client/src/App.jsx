import { Routes, Route } from 'react-router-dom'

//imported elements
import Home from './pages/Home';
import AuthSignup from './pages/LoginSignup';
import ExploreCourses from './pages/ExploreCourses';
import CourseDetail from './pages/CourseDetail';
import About from './pages/About';
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<AuthSignup />} />
      <Route path='/viewCourses' element={<ExploreCourses/>}/>
      <Route path='/courseDetail' element={<CourseDetail/>}/>
      <Route path='/about' element={<About/>}/>
    </Routes>
  );
}