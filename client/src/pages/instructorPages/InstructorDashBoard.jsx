import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Navbar/Sidebar';
import api from '../../config/server';
import CourseForm from '../../components/Forms/CourseForm';
import Toast from '../../components/Alert/Toast';
import { useNavigate } from 'react-router-dom';

const InstructorDashboard = () => {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ totalStudents: 0, totalRevenue: 0, activeCourses: 0 });
  const [notification, setNotification] = useState({ show: false, message: "", type: "success" });
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      navigate('/');
    } else {
      fetchStats();
    }
  }, [navigate]);

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/instructor/dashboard-stats');
      if (data.success) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error("Failed to fetch stats");
    }
  };

  const handleSubmitCourse = async (courseData, courseId) => {
    setLoading(true);
    try {
      // Logic for creating course only, since edit is likely done from My Courses page
      // But keeping support for robustness
      if (courseId) {
        await api.patch(`/instructor/edit/${courseId}`, courseData);
        setNotification({ show: true, message: "Course updated successfully!", type: "success" });
      } else {
        await api.post('/instructor/create', courseData);
        setNotification({ show: true, message: "Course created successfully!", type: "success" });
      }
      setShowForm(false);
      fetchStats();
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

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      <Sidebar />

      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-navy-900 tracking-tight">Instructor Dashboard</h1>
            <p className="text-gray-500 mt-1">Welcome back! Manage your courses and track performance.</p>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center text-xl">
              <i className="fas fa-users"></i>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-400">Total Students</p>
              <h3 className="text-2xl font-bold text-navy-900">{stats.totalStudents}</h3>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center text-xl">
              <i className="fas fa-wallet"></i>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-400">Total Revenue</p>
              <h3 className="text-2xl font-bold text-navy-900">₹{stats.totalRevenue.toLocaleString()}</h3>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center text-xl">
              <i className="fas fa-book-open"></i>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-400">Active Courses</p>
              <h3 className="text-2xl font-bold text-navy-900">{stats.activeCourses}</h3>
            </div>
          </div>
        </div>

        {/* Empty State or Welcome Graphic could go here if needed, but keeping it clean for now */}

      </main>

      {/* Course Form Modal */}
      {showForm && (
        <CourseForm
          onClose={() => setShowForm(false)}
          onSubmit={handleSubmitCourse}
          loading={loading}
          initialData={null}
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