import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/Navbar/AdminSidebar';
import api from '../../config/server';
import Toast from '../../components/Alert/Toast';

const AdminDashboard = () => {
    const [activeSection, setActiveSection] = useState('courses');
    const [stats, setStats] = useState({ users: 0, courses: 0, revenue: 0 });
    const [users, setUsers] = useState([]);
    const [courses, setCourses] = useState([]);
    const [categories, setCategories] = useState([]);
    const [enrollments, setEnrollments] = useState([]);
    const [newCategory, setNewCategory] = useState({ name: "", description: "" });
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState({ show: false, message: "", type: "success" });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [usersRes, coursesRes, statsRes, categoriesRes, enrollmentsRes] = await Promise.all([
                api.get('/admin/users'),
                api.get('/admin/courses'),
                api.get('/admin/stats'),
                api.get('/admin/categories'),
                api.get('/admin/enrollments')
            ]);

            setUsers(usersRes.data.data || []);
            setCourses(coursesRes.data.data || []);
            setCategories(categoriesRes.data.data || []);
            setStats(statsRes.data.data || { users: 0, courses: 0, revenue: 0 });
            setEnrollments(enrollmentsRes.data.data || []); // Added
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
                    </h1>
                </header>

                {/* Dashboard Stats View */}
                {activeSection === 'dashboard' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-400">Total Users</p>
                                <h3 className="text-2xl font-bold text-navy-900">{stats.users}</h3>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center text-xl">
                                <i className="fas fa-users"></i>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-400">Total Courses</p>
                                <h3 className="text-2xl font-bold text-navy-900">{stats.courses}</h3>
                            </div>
                            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center text-xl">
                                <i className="fas fa-book-open"></i>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-400">Total Revenue</p>
                                <h3 className="text-2xl font-bold text-navy-900">${stats.revenue}</h3>
                            </div>
                            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center text-xl">
                                <i className="fas fa-dollar-sign"></i>
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
                                            <button className="text-blue-600 hover:text-blue-800 text-sm font-bold">Details</button>
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
            </main>

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
