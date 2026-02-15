import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Navbar/Sidebar';
import api from '../../config/server';
import CourseForm from '../../components/Forms/CourseForm';
import Toast from '../../components/Alert/Toast';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const InstructorDashboard = () => {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalRevenue: 0,
    activeCourses: 0,
    enrollmentTrend: [],
    coursePerformance: []
  });
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
              <h3 className="text-2xl font-bold text-navy-900">₹{stats.totalRevenue ? stats.totalRevenue.toLocaleString() : '0'}</h3>
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
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center text-xl">
              <i className="fas fa-star"></i>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-400">Avg. Rating</p>
              <h3 className="text-2xl font-bold text-navy-900">{stats.averageRating || '0.0'}</h3>
              <p className="text-xs text-gray-400">{stats.totalReviews || 0} reviews</p>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Enrollment Trend Chart */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-navy-900 mb-6">Enrollment Trends (Last 6 Months)</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.enrollmentTrend} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} tick={{ fill: '#9CA3AF' }} />
                  <YAxis axisLine={false} tickLine={false} fontSize={12} tick={{ fill: '#9CA3AF' }} />
                  <Tooltip
                    cursor={{ fill: '#f9fafb' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  />
                  <Bar dataKey="enrollments" fill="#4F46E5" radius={[4, 4, 0, 0]} barSize={30} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Courses Chart */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-navy-900 mb-6">Top Courses by Enrollment</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={stats.coursePerformance}
                  margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={100}
                    tick={{ fontSize: 12, fill: '#4B5563' }}
                    tickFormatter={(value) => value.length > 15 ? `${value.substring(0, 15)}...` : value}
                  />
                  <Tooltip
                    cursor={{ fill: '#f9fafb' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  />
                  <Bar dataKey="students" fill="#10B981" radius={[0, 4, 4, 0]} barSize={20} name="Students" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

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
