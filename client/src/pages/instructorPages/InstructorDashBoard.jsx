import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Navbar/Sidebar';
import api from '../../config/server';
import CourseForm from '../../components/Forms/CourseForm';
import Toast from '../../components/Alert/Toast';

import { useNavigate } from 'react-router-dom';

const InstructorDashboard = () => {
  const [activeTab, setActiveTab] = useState('courses');
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [myCourses, setMyCourses] = useState([]);
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [editingCourse, setEditingCourse] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: "", type: "success" });
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      navigate('/');
    } else {
      fetchCourses();
      fetchEnrolledStudents();
    }
  }, [navigate]);

  const fetchCourses = async () => {
    try {
      const { data } = await api.get('/instructor/my-courses');
      setMyCourses(data.courses);
    } catch (err) {
      console.error("Failed to fetch courses");
    }
  };

  const fetchEnrolledStudents = async () => {
    try {
      const { data } = await api.get('/instructor/enrolled-students');
      setEnrolledStudents(data.data);
    } catch (err) {
      console.error("Failed to fetch enrolled students");
    }
  };

  const handleSubmitCourse = async (courseData, courseId) => {
    setLoading(true);
    try {
      if (courseId) {
        // Update existing course
        await api.patch(`/instructor/edit/${courseId}`, courseData);
        setNotification({ show: true, message: "Course updated successfully!", type: "success" });
      } else {
        // Create new course
        await api.post('/instructor/create', courseData);
        setNotification({ show: true, message: "Course created successfully!", type: "success" });
      }
      setShowForm(false);
      setEditingCourse(null);
      fetchCourses();
    } catch (error) {
      setNotification({
        show: true,
        message: error.response?.data?.message || "Operation failed",
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm("Are you sure you want to delete this course? This action cannot be undone.")) return;

    try {
      await api.delete(`/instructor/course/${courseId}`);
      setNotification({ show: true, message: "Course deleted successfully!", type: "success" });
      fetchCourses();
    } catch (error) {
      setNotification({
        show: true,
        message: error.response?.data?.message || "Failed to delete course",
        type: "error"
      });
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      <Sidebar />

      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-navy-900 tracking-tight">Instructor Dashboard</h1>
            <p className="text-gray-500 mt-1">Welcome back! Here's what's happening with your courses.</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="group bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-200 transition-all flex items-center gap-2 transform hover:-translate-y-0.5"
          >
            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition">
              <i className="fas fa-plus text-sm"></i>
            </div>
            Create New Course
          </button>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-sm font-medium text-gray-400 mb-1">Total Students</p>
            <h3 className="text-2xl font-bold text-navy-900">{enrolledStudents.length}</h3>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-sm font-medium text-gray-400 mb-1">Active Courses</p>
            <h3 className="text-2xl font-bold text-navy-900">{myCourses.length}</h3>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('courses')}
            className={`pb-4 px-2 font-bold text-sm transition ${activeTab === 'courses' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
          >
            My Courses
          </button>
          <button
            onClick={() => setActiveTab('students')}
            className={`pb-4 px-2 font-bold text-sm transition ${activeTab === 'students' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
          >
            Enrolled Students
          </button>
        </div>

        {activeTab === 'courses' ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* ... existing table code ... */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    <th className="p-5">Course</th>
                    <th className="p-5">Category</th>
                    <th className="p-5">Students</th>
                    <th className="p-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {myCourses.map(course => (
                    <tr key={course._id}>
                      <td className="p-5 font-bold text-navy-900">{course.title}</td>
                      <td className="p-5 text-gray-600">{course.category}</td>
                      <td className="p-5">{course.enrolledStudents?.length || 0}</td>
                      <td className="p-5 text-right space-x-3">
                        <button
                          onClick={() => {
                            setEditingCourse(course);
                            setShowForm(true);
                          }}
                          className="text-blue-600 hover:text-blue-800 transition"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          onClick={() => handleDeleteCourse(course._id)}
                          className="text-red-500 hover:text-red-700 transition"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    <th className="p-5">Student Name</th>
                    <th className="p-5">Email</th>
                    <th className="p-5">Enrolled Course</th>
                    <th className="p-5">Progress</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {enrolledStudents.length > 0 ? enrolledStudents.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 transition">
                      <td className="p-5 font-bold text-navy-900">{item.name}</td>
                      <td className="p-5 text-gray-600">{item.email}</td>
                      <td className="p-5">
                        <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold">
                          {item.courseTitle}
                        </span>
                      </td>
                      <td className="p-5">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden w-24">
                            <div
                              className="h-full bg-blue-600 rounded-full transition-all duration-500"
                              style={{ width: `${item.progress || 0}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-bold text-navy-900 whitespace-nowrap">{item.progress || 0}%</span>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="4" className="p-12 text-center text-gray-400">No students enrolled yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Course Form Modal */}
      {showForm && (
        <CourseForm
          onClose={() => {
            setShowForm(false);
            setEditingCourse(null);
          }}
          onSubmit={handleSubmitCourse}
          loading={loading}
          initialData={editingCourse}
        />
      )}

      <Toast
        show={notification.show}
        message={notification.message}
        type={notification.type}
        onClose={() => setNotification({ ...notification, show: false })}
      />
    </div>
  );
};

export default InstructorDashboard;