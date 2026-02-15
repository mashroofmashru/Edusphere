import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/Navbar/AdminSidebar';
import api from '../../config/server';
import Toast from '../../components/Alert/Toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const AdminDashboard = () => {
    const [activeSection, setActiveSection] = useState('dashboard');
    const [stats, setStats] = useState({
        users: 0,
        courses: 0,
        revenue: 0,
        enrollments: 0,
        enrollmentTrend: [],
        categoryDistribution: []
    });
    const [users, setUsers] = useState([]);
    const [courses, setCourses] = useState([]);
    const [categories, setCategories] = useState([]);
    const [enrollments, setEnrollments] = useState([]);
    const [messages, setMessages] = useState([]);
    const [newCategory, setNewCategory] = useState({ name: "", description: "" });
    const [replyModal, setReplyModal] = useState({ show: false, messageId: null, replySubject: "", replyBody: "" });
    const [viewMessage, setViewMessage] = useState(null);
    const [viewEnrollment, setViewEnrollment] = useState(null);
    const [viewInstructor, setViewInstructor] = useState(null);
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState({ show: false, message: "", type: "success" });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [usersRes, coursesRes, statsRes, categoriesRes, enrollmentsRes, messagesRes] = await Promise.all([
                api.get('/admin/users'),
                api.get('/admin/courses'),
                api.get('/admin/stats'),
                api.get('/admin/categories'),
                api.get('/admin/enrollments'),
                api.get('/admin/messages')
            ]);

            setUsers(usersRes.data.data || []);
            setCourses(coursesRes.data.data || []);
            setCategories(categoriesRes.data.data || []);
            setStats(statsRes.data.data || {
                users: 0,
                courses: 0,
                revenue: 0,
                enrollments: 0,
                enrollmentTrend: [],
                categoryDistribution: []
            });
            setEnrollments(enrollmentsRes.data.data || []);
            setMessages(messagesRes.data.data || []);
        } catch (err) {
            console.error("Failed to fetch admin data", err);
            setNotification({ show: true, message: "Failed to load data", type: "error" });
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (courseId, currentStatus) => {
        const newStatus = currentStatus === 'Published' ? 'Draft' : 'Published';
        try {
            await api.patch(`/admin/courses/${courseId}/status`, { status: newStatus });
            setNotification({ show: true, message: `Course ${newStatus.toLowerCase()} successfully`, type: "success" });
            fetchData();
        } catch (err) {
            setNotification({ show: true, message: "Failed to update status", type: "error" });
        }
    };

    const handleDeleteCourse = async (id) => {
        if (!window.confirm("Are you sure you want to delete this course?")) return;
        try {
            await api.delete(`/admin/courses/${id}`);
            setNotification({ show: true, message: "Course deleted successfully", type: "success" });
            fetchData();
        } catch (err) {
            setNotification({ show: true, message: "Failed to delete course", type: "error" });
        }
    }

    const handleDeleteUser = async (id) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;
        try {
            await api.delete(`/admin/users/${id}`);
            setNotification({ show: true, message: "User deleted successfully", type: "success" });
            fetchData();
        } catch (err) {
            setNotification({ show: true, message: "Failed to delete user", type: "error" });
        }
    }

    const handleAddCategory = async (e) => {
        e.preventDefault();
        if (!newCategory.name) return;
        try {
            await api.post('/admin/categories', newCategory);
            setNotification({ show: true, message: "Category added successfully", type: "success" });
            setNewCategory({ name: "", description: "" });
            fetchData();
        } catch (err) {
            setNotification({ show: true, message: "Failed to add category", type: "error" });
        }
    }

    const handleDeleteCategory = async (id) => {
        if (!window.confirm("Are you sure?")) return;
        try {
            await api.delete(`/admin/categories/${id}`);
            setNotification({ show: true, message: "Category deleted", type: "success" });
            fetchData();
        } catch (err) {
            setNotification({ show: true, message: "Failed to delete category", type: "error" });
        }
    }

    const openReplyModal = (msg) => {
        setReplyModal({
            show: true,
            messageId: msg._id,
            replySubject: `Re: ${msg.subject}`,
            replyBody: `Dear ${msg.name},\n\nThank you for contacting us.\n\n`
        });
    }

    const handleSendReply = async () => {
        if (!replyModal.replyBody) return;
        try {
            await api.post('/admin/messages/reply', {
                messageId: replyModal.messageId,
                replySubject: replyModal.replySubject,
                replyBody: replyModal.replyBody
            });
            setNotification({ show: true, message: "Reply sent successfully", type: "success" });
            setReplyModal({ show: false, messageId: null, replySubject: "", replyBody: "" });
            fetchData();
        } catch (err) {
            setNotification({ show: true, message: "Failed to send reply", type: "error" });
        }
    }

    return (
        <div className="flex h-screen bg-gray-50 font-sans">
            <AdminSidebar activeSection={activeSection} setActiveSection={setActiveSection} />

            <main className="flex-1 overflow-y-auto p-4 md:p-8">
                <header className="mb-8">
                    <h1 className="text-3xl font-extrabold text-navy-900">
                        {activeSection === 'dashboard' && 'Admin Dashboard'}
                        {activeSection === 'courses' && 'Manage Courses'}
                        {activeSection === 'users' && 'Manage Users'}
                        {activeSection === 'categories' && 'Course Categories'}
                        {activeSection === 'enrollments' && 'Platform Enrollments'}
                        {activeSection === 'messages' && 'Contact Messages'}
                        {activeSection === 'instructors' && 'Instructor Requests'}
                    </h1>
                </header>

                {/* Dashboard Stats View */}
                {activeSection === 'dashboard' && (
                    <div className="space-y-8 animate-fade-in">
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition">
                                <div>
                                    <p className="text-sm font-medium text-gray-400">Total Users</p>
                                    <h3 className="text-2xl font-bold text-navy-900">{stats.users}</h3>
                                </div>
                                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center text-xl">
                                    <i className="fas fa-users"></i>
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition">
                                <div>
                                    <p className="text-sm font-medium text-gray-400">Total Courses</p>
                                    <h3 className="text-2xl font-bold text-navy-900">{stats.courses}</h3>
                                </div>
                                <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center text-xl">
                                    <i className="fas fa-book-open"></i>
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition">
                                <div>
                                    <p className="text-sm font-medium text-gray-400">Active Enrollments</p>
                                    <h3 className="text-2xl font-bold text-navy-900">{stats.enrollments}</h3>
                                </div>
                                <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center text-xl">
                                    <i className="fas fa-graduation-cap"></i>
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition">
                                <div>
                                    <p className="text-sm font-medium text-gray-400">Total Revenue</p>
                                    <h3 className="text-2xl font-bold text-navy-900">₹{stats.revenue}</h3>
                                </div>
                                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center text-xl">
                                    <i className="fas fa-dollar-sign"></i>
                                </div>
                            </div>
                        </div>

                        {/* Charts Section */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Monthly Enrollments Chart */}
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                <h3 className="text-lg font-bold text-navy-900 mb-6">Enrollment Trends (Last 6 Months)</h3>
                                <div className="h-[300px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                            data={stats.enrollmentTrend}
                                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                            <YAxis axisLine={false} tickLine={false} />
                                            <Tooltip
                                                cursor={{ fill: '#f3f4f6' }}
                                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                            />
                                            <Bar dataKey="enrollments" fill="#4F46E5" radius={[4, 4, 0, 0]} barSize={40} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Category Distribution Chart */}
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                <h3 className="text-lg font-bold text-navy-900 mb-6">Course Distribution by Category</h3>
                                <div className="h-[300px] w-full flex items-center justify-center">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={stats.categoryDistribution}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={100}
                                                fill="#8884d8"
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {stats.categoryDistribution.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                            />
                                            <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Courses List View */}
                {activeSection === 'courses' && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr className="text-left text-xs font-semibold text-gray-500 uppercase">
                                    <th className="p-5">Course</th>
                                    <th className="p-5">Instructor</th>
                                    <th className="p-5">Price</th>
                                    <th className="p-5">Status</th>
                                    <th className="p-5 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {courses.map(course => (
                                    <tr key={course._id} className="hover:bg-gray-50">
                                        <td className="p-5">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={course.thumbnail && !course.thumbnail.includes('default') ? `http://localhost:3000/${course.thumbnail.replace(/\\/g, '/')}` : 'https://via.placeholder.com/150'}
                                                    className="w-10 h-10 rounded object-cover bg-gray-200"
                                                    alt=""
                                                />
                                                <div>
                                                    <p className="font-bold text-navy-900">{course.title}</p>
                                                    <span className="text-xs text-gray-500">{course.category}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-5 text-sm">
                                            {course.instructor?.name || 'Unknown'} <br />
                                            <span className="text-xs text-gray-400">{course.instructor?.email}</span>
                                        </td>
                                        <td className="p-5 font-bold">₹{course.price}</td>
                                        <td className="p-5">
                                            <button
                                                onClick={() => handleToggleStatus(course._id, course.status)}
                                                className={`px-3 py-1 rounded-full text-xs font-bold transition ${course.status === 'Published'
                                                    ? 'bg-green-100 text-green-600 hover:bg-green-200'
                                                    : 'bg-amber-100 text-amber-600 hover:bg-amber-200'
                                                    }`}
                                            >
                                                {course.status || 'Draft'}
                                            </button>
                                        </td>
                                        <td className="p-5 text-right space-x-2">
                                            <button onClick={() => handleDeleteCourse(course._id)} className="text-red-500 hover:text-red-700 p-2">
                                                <i className="fas fa-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Users List View */}
                {activeSection === 'users' && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr className="text-left text-xs font-semibold text-gray-500 uppercase">
                                    <th className="p-5">User</th>
                                    <th className="p-5">Role</th>
                                    <th className="p-5 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {users.map(user => (
                                    <tr key={user._id} className="hover:bg-gray-50">
                                        <td className="p-5">
                                            <p className="font-bold text-navy-900">{user.name}</p>
                                            <p className="text-xs text-gray-500">{user.email}</p>
                                        </td>
                                        <td className="p-5">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${user.role === 'admin' ? 'bg-purple-100 text-purple-600' : (user.role === 'instructor' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600')}`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="p-5 text-right">
                                            <button onClick={() => handleDeleteUser(user._id)} className="text-red-500 hover:text-red-700 p-2">
                                                <i className="fas fa-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Categories View */}
                {activeSection === 'categories' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-1">
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                <h3 className="text-xl font-bold text-navy-900 mb-6">Add New Category</h3>
                                <form onSubmit={handleAddCategory} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                        <input
                                            type="text"
                                            className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                                            value={newCategory.name}
                                            onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                                            placeholder="e.g. Web Development"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                        <textarea
                                            className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition min-h-[100px]"
                                            value={newCategory.description}
                                            onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                                            placeholder="Short description..."
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-100"
                                    >
                                        Create Category
                                    </button>
                                </form>
                            </div>
                        </div>
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr className="text-left text-xs font-semibold text-gray-500 uppercase">
                                            <th className="p-5">Category Name</th>
                                            <th className="p-5">Slug</th>
                                            <th className="p-5 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {categories.map(cat => (
                                            <tr key={cat._id} className="hover:bg-gray-50">
                                                <td className="p-5">
                                                    <p className="font-bold text-navy-900">{cat.name}</p>
                                                    <p className="text-xs text-gray-500 line-clamp-1">{cat.description}</p>
                                                </td>
                                                <td className="p-5 text-sm font-mono text-gray-400">{cat.slug}</td>
                                                <td className="p-5 text-right">
                                                    <button onClick={() => handleDeleteCategory(cat._id)} className="text-red-500 hover:text-red-700 p-2">
                                                        <i className="fas fa-trash"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {categories.length === 0 && (
                                            <tr>
                                                <td colSpan="3" className="p-10 text-center text-gray-400">No categories added yet.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* Enrollments View */}
                {activeSection === 'enrollments' && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr className="text-left text-xs font-semibold text-gray-500 uppercase">
                                    <th className="p-5">Student</th>
                                    <th className="p-5">Course</th>
                                    <th className="p-5">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {enrollments.map((enrollment, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50">
                                        <td className="p-5">
                                            <p className="font-bold text-navy-900">{enrollment.studentName}</p>
                                            <p className="text-xs text-gray-500">{enrollment.studentEmail}</p>
                                        </td>
                                        <td className="p-5">
                                            <p className="font-medium text-navy-900">{enrollment.courseTitle}</p>
                                        </td>
                                        <td className="p-5 text-right">
                                            <button
                                                onClick={() => setViewEnrollment(enrollment)}
                                                className="text-blue-600 hover:text-blue-800 text-sm font-bold bg-blue-50 px-3 py-1 rounded transition"
                                            >
                                                Details
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {enrollments.length === 0 && (
                                    <tr>
                                        <td colSpan="3" className="p-10 text-center text-gray-400">No enrollments yet.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Messages View */}
                {activeSection === 'messages' && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr className="text-left text-xs font-semibold text-gray-500 uppercase">
                                    <th className="p-5">From</th>
                                    <th className="p-5">Subject</th>
                                    <th className="p-5">Status</th>
                                    <th className="p-5">Date</th>
                                    <th className="p-5 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {messages.map((msg) => (
                                    <tr key={msg._id} className="hover:bg-gray-50">
                                        <td className="p-5">
                                            <p className="font-bold text-navy-900">{msg.name}</p>
                                            <p className="text-xs text-gray-500">{msg.email}</p>
                                        </td>
                                        <td className="p-5">
                                            <p className="font-medium text-navy-900">{msg.subject}</p>
                                            <p className="text-xs text-gray-500 line-clamp-1">{msg.message}</p>
                                        </td>
                                        <td className="p-5">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${msg.status === 'Replied' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                                                {msg.status}
                                            </span>
                                        </td>
                                        <td className="p-5 text-sm text-gray-400">
                                            {new Date(msg.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="p-5 text-right">
                                            <button
                                                onClick={() => setViewMessage(msg)}
                                                className="text-gray-400 hover:text-blue-600 p-2 mr-2 transition"
                                                title="View Details"
                                            >
                                                <i className="fas fa-eye"></i>
                                            </button>
                                            {msg.status !== 'Replied' && (
                                                <button
                                                    onClick={() => openReplyModal(msg)}
                                                    className="bg-blue-600 text-white px-3 py-1 rounded text-xs font-bold hover:bg-blue-700 transition"
                                                >
                                                    Reply
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {messages.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="p-10 text-center text-gray-400">No messages yet.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
                {/* Instructor Requests View */}
                {activeSection === 'instructors' && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr className="text-left text-xs font-semibold text-gray-500 uppercase">
                                    <th className="p-5">Instructor</th>
                                    <th className="p-5">Status</th>
                                    <th className="p-5">Details</th>
                                    <th className="p-5 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {users.filter(u => u.role === 'instructor').map(user => (
                                    <tr key={user._id} className="hover:bg-gray-50">
                                        <td className="p-5">
                                            <p className="font-bold text-navy-900">{user.name}</p>
                                            <p className="text-xs text-gray-500">{user.email}</p>
                                        </td>
                                        <td className="p-5">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${user.instructorStatus === 'approved' ? 'bg-green-100 text-green-600' :
                                                user.instructorStatus === 'rejected' ? 'bg-red-100 text-red-600' :
                                                    'bg-yellow-100 text-yellow-600'
                                                }`}>
                                                {user.instructorStatus || 'Pending'}
                                            </span>
                                        </td>
                                        <td className="p-5">
                                            <button
                                                onClick={() => setViewInstructor(user)}
                                                className="text-blue-600 hover:text-blue-800 text-sm font-bold bg-blue-50 px-3 py-1 rounded transition"
                                            >
                                                View Profile
                                            </button>
                                        </td>
                                        <td className="p-5 text-right space-x-2">
                                            {user.instructorStatus === 'approved' && (
                                                <button
                                                    onClick={async () => {
                                                        if (!window.confirm("Block this instructor?")) return;
                                                        try {
                                                            await api.patch(`/admin/users/${user._id}/instructor-status`, { status: 'rejected' });
                                                            setNotification({ show: true, message: "Instructor blocked", type: "success" });
                                                            fetchData();
                                                        } catch (e) {
                                                            setNotification({ show: true, message: "Failed to block", type: "error" });
                                                        }
                                                    }}
                                                    className="bg-red-100 text-red-600 px-3 py-1 rounded text-xs font-bold hover:bg-red-200 transition"
                                                >
                                                    Block
                                                </button>
                                            )}
                                            {user.instructorStatus === 'pending' && (
                                                <button
                                                    onClick={async () => {
                                                        try {
                                                            await api.patch(`/admin/users/${user._id}/instructor-status`, { status: 'approved' });
                                                            setNotification({ show: true, message: "Instructor approved", type: "success" });
                                                            fetchData();
                                                        } catch (e) {
                                                            setNotification({ show: true, message: "Failed to approve", type: "error" });
                                                        }
                                                    }}
                                                    className="bg-green-600 text-white px-3 py-1 rounded text-xs font-bold hover:bg-green-700 transition"
                                                >
                                                    Approve
                                                </button>
                                            )}
                                            {user.instructorStatus === 'rejected' && (
                                                <button
                                                    onClick={async () => {
                                                        if (!window.confirm("Unblock this instructor?")) return;
                                                        try {
                                                            await api.patch(`/admin/users/${user._id}/instructor-status`, { status: 'approved' });
                                                            setNotification({ show: true, message: "Instructor unblocked", type: "success" });
                                                            fetchData();
                                                        } catch (e) {
                                                            setNotification({ show: true, message: "Failed to unblock", type: "error" });
                                                        }
                                                    }}
                                                    className="bg-green-100 text-green-600 px-3 py-1 rounded text-xs font-bold hover:bg-green-200 transition"
                                                >
                                                    Unblock
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {users.filter(u => u.role === 'instructor').length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="p-10 text-center text-gray-400">No instructor requests found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>

            {/* Instructor Details Modal */}
            {viewInstructor && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6 animate-fade-in max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-start mb-6 border-b border-gray-100 pb-4">
                            <div>
                                <h2 className="text-2xl font-bold text-navy-900">Instructor Profile</h2>
                                <p className="text-sm text-gray-500">Review details before approval</p>
                            </div>
                            <button
                                onClick={() => setViewInstructor(null)}
                                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition"
                            >
                                <i className="fas fa-times"></i>
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-2xl font-bold">
                                    {viewInstructor.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-navy-900">{viewInstructor.name}</h3>
                                    <p className="text-gray-500">{viewInstructor.email}</p>
                                    <div className="mt-1">
                                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${viewInstructor.instructorStatus === 'approved' ? 'bg-green-100 text-green-600' :
                                            viewInstructor.instructorStatus === 'rejected' ? 'bg-red-100 text-red-600' :
                                                'bg-yellow-100 text-yellow-600'
                                            }`}>
                                            {viewInstructor.instructorStatus || 'Pending'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Headline</h4>
                                <p className="text-navy-900 font-medium bg-gray-50 p-3 rounded-lg border border-gray-100">
                                    {viewInstructor.headline || 'No headline provided'}
                                </p>
                            </div>

                            <div>
                                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Bio</h4>
                                <p className="text-navy-900 bg-gray-50 p-3 rounded-lg border border-gray-100 whitespace-pre-wrap">
                                    {viewInstructor.bio || 'No bio provided'}
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Website</h4>
                                    {viewInstructor.website ? (
                                        <a href={viewInstructor.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-2">
                                            <i className="fas fa-globe"></i> {viewInstructor.website}
                                        </a>
                                    ) : (
                                        <span className="text-gray-400 italic">Not provided</span>
                                    )}
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">LinkedIn</h4>
                                    {viewInstructor.linkedin ? (
                                        <a href={viewInstructor.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-2">
                                            <i className="fab fa-linkedin"></i> {viewInstructor.linkedin}
                                        </a>
                                    ) : (
                                        <span className="text-gray-400 italic">Not provided</span>
                                    )}
                                </div>
                            </div>

                            <div className="pt-6 border-t border-gray-100 flex justify-end gap-3">
                                {viewInstructor.instructorStatus === 'approved' && (
                                    <button
                                        onClick={async () => {
                                            if (!window.confirm("Are you sure you want to block this instructor? They will no longer be able to manage courses.")) return;
                                            try {
                                                await api.patch(`/admin/users/${viewInstructor._id}/instructor-status`, { status: 'rejected' });
                                                setNotification({ show: true, message: "Instructor blocked successfully", type: "success" });
                                                setViewInstructor(null);
                                                fetchData();
                                            } catch (e) {
                                                setNotification({ show: true, message: "Failed to block instructor", type: "error" });
                                            }
                                        }}
                                        className="px-6 py-2 border border-red-200 text-red-600 font-bold rounded-lg hover:bg-red-50 transition"
                                    >
                                        Block Instructor
                                    </button>
                                )}
                                {viewInstructor.instructorStatus === 'pending' && (
                                    <button
                                        onClick={async () => {
                                            if (!window.confirm("Reject this instructor application?")) return;
                                            try {
                                                await api.patch(`/admin/users/${viewInstructor._id}/instructor-status`, { status: 'rejected' });
                                                setNotification({ show: true, message: "Application rejected", type: "success" });
                                                setViewInstructor(null);
                                                fetchData();
                                            } catch (e) {
                                                setNotification({ show: true, message: "Failed to reject", type: "error" });
                                            }
                                        }}
                                        className="px-6 py-2 border border-red-200 text-red-600 font-bold rounded-lg hover:bg-red-50 transition"
                                    >
                                        Reject
                                    </button>
                                )}
                                {viewInstructor.instructorStatus !== 'approved' && viewInstructor.instructorStatus !== 'rejected' && (
                                    <button
                                        onClick={async () => {
                                            try {
                                                await api.patch(`/admin/users/${viewInstructor._id}/instructor-status`, { status: 'approved' });
                                                setNotification({ show: true, message: "Instructor approved", type: "success" });
                                                setViewInstructor(null);
                                                fetchData();
                                            } catch (e) {
                                                setNotification({ show: true, message: "Failed to approve", type: "error" });
                                            }
                                        }}
                                        className="px-6 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition shadow-lg shadow-green-200"
                                    >
                                        Approve Instructor
                                    </button>
                                )}
                                {viewInstructor.instructorStatus === 'rejected' && (
                                    <button
                                        onClick={async () => {
                                            try {
                                                await api.patch(`/admin/users/${viewInstructor._id}/instructor-status`, { status: 'approved' });
                                                setNotification({ show: true, message: "Instructor unblocked", type: "success" });
                                                setViewInstructor(null);
                                                fetchData();
                                            } catch (e) {
                                                setNotification({ show: true, message: "Failed to unblock", type: "error" });
                                            }
                                        }}
                                        className="px-6 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition shadow-lg shadow-green-200"
                                    >
                                        Unblock Instructor
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Reply Modal */}
            {replyModal.show && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 animate-fade-in">
                        <h2 className="text-2xl font-bold text-navy-900 mb-4">Reply to Message</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                                <input
                                    type="text"
                                    className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={replyModal.replySubject}
                                    onChange={(e) => setReplyModal({ ...replyModal, replySubject: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                                <textarea
                                    className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none min-h-[150px]"
                                    value={replyModal.replyBody}
                                    onChange={(e) => setReplyModal({ ...replyModal, replyBody: e.target.value })}
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    onClick={() => setReplyModal({ ...replyModal, show: false })}
                                    className="px-4 py-2 text-gray-500 font-bold hover:bg-gray-100 rounded-lg transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSendReply}
                                    className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition"
                                >
                                    Send Reply
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* View Message Modal */}
            {viewMessage && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6 overflow-y-auto max-h-[90vh] animate-fade-in">
                        <div className="flex justify-between items-start mb-6 border-b border-gray-100 pb-4">
                            <div>
                                <h2 className="text-2xl font-bold text-navy-900">Message Details</h2>
                                <p className="text-sm text-gray-500">View full message content</p>
                            </div>
                            <button
                                onClick={() => setViewMessage(null)}
                                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition"
                            >
                                <i className="fas fa-times"></i>
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-gray-50 p-4 rounded-xl">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">From</p>
                                    <p className="font-bold text-navy-900 text-lg">{viewMessage.name}</p>
                                    <a href={`mailto:${viewMessage.email}`} className="text-sm text-blue-600 hover:underline">{viewMessage.email}</a>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-xl">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Date Sent</p>
                                    <p className="font-medium text-navy-900 text-lg">{new Date(viewMessage.createdAt).toLocaleString()}</p>
                                    <span className={`inline-block mt-2 px-2 py-1 rounded text-xs font-bold ${viewMessage.status === 'Replied' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                                        {viewMessage.status}
                                    </span>
                                </div>
                            </div>

                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Subject</p>
                                <h3 className="text-xl font-bold text-navy-900 border-l-4 border-blue-500 pl-4">{viewMessage.subject}</h3>
                            </div>

                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Message</p>
                                <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 text-gray-700 whitespace-pre-wrap leading-relaxed">
                                    {viewMessage.message}
                                </div>
                            </div>

                            {viewMessage.status === 'Replied' && viewMessage.reply && (
                                <div className="animate-fade-in">
                                    <div className="flex items-center gap-2 mb-2">
                                        <i className="fas fa-share text-blue-500 transform scale-x-[-1]"></i>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Replied on {new Date(viewMessage.reply.repliedAt).toLocaleDateString()}</p>
                                    </div>
                                    <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 text-gray-700">
                                        <p className="font-bold text-navy-900 mb-2">Subject: {viewMessage.reply.subject}</p>
                                        <div className="whitespace-pre-wrap leading-relaxed text-sm">
                                            {viewMessage.reply.body}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="pt-6 border-t border-gray-100 flex justify-end gap-3">
                                <button
                                    onClick={() => setViewMessage(null)}
                                    className="px-6 py-2.5 text-gray-500 font-bold hover:bg-gray-100 rounded-xl transition"
                                >
                                    Close
                                </button>
                                {viewMessage.status !== 'Replied' && (
                                    <button
                                        onClick={() => {
                                            openReplyModal(viewMessage);
                                            setViewMessage(null);
                                        }}
                                        className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-100 flex items-center"
                                    >
                                        <i className="fas fa-reply mr-2"></i> Reply Now
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* View Enrollment Modal */}
            {viewEnrollment && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 animate-fade-in">
                        <div className="flex justify-between items-start mb-6 border-b border-gray-100 pb-4">
                            <div>
                                <h2 className="text-2xl font-bold text-navy-900">Enrollment Details</h2>
                                <p className="text-sm text-gray-500">Full enrollment information</p>
                            </div>
                            <button
                                onClick={() => setViewEnrollment(null)}
                                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition"
                            >
                                <i className="fas fa-times"></i>
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-gray-50 p-4 rounded-xl">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Student</p>
                                <p className="font-bold text-navy-900 text-lg">{viewEnrollment.studentName}</p>
                                <p className="text-sm text-gray-500">{viewEnrollment.studentEmail}</p>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-xl">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Course</p>
                                <p className="font-bold text-navy-900 text-lg">{viewEnrollment.courseTitle}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-50 p-4 rounded-xl">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Date</p>
                                    <p className="font-bold text-navy-900">
                                        {viewEnrollment.enrolledAt ? new Date(viewEnrollment.enrolledAt).toLocaleDateString() : 'N/A'}
                                    </p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-xl">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Status</p>
                                    <span className="inline-block px-2 py-1 rounded text-xs font-bold bg-green-100 text-green-600 uppercase">
                                        {viewEnrollment.status || 'Active'}
                                    </span>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-xl">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Payment ID</p>
                                <p className="font-mono text-sm text-gray-600 break-all">{viewEnrollment.paymentId || 'N/A'}</p>
                            </div>

                            <div className="pt-4 flex justify-end">
                                <button
                                    onClick={() => setViewEnrollment(null)}
                                    className="px-6 py-2 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200 transition"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
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

export default AdminDashboard;
