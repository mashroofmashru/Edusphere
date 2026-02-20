import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Navbar/Sidebar';
import api from '../../config/server';
import CourseForm from '../../components/Forms/CourseForm';
import Toast from '../../components/Alert/Toast';
import CourseDetailsModal from '../../components/CouseDetail/CourseDetailsModal';

const InstructorCourses = () => {
    const [courses, setCourses] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [editingCourse, setEditingCourse] = useState(null);
    const [viewCourseDetails, setViewCourseDetails] = useState(null);
    const [notification, setNotification] = useState({ show: false, message: "", type: "success" });
    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const { data } = await api.get('/instructor/my-courses');
            setCourses(data.courses);
        } catch (err) {
            console.error("Failed to fetch courses");
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
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-extrabold text-navy-900 tracking-tight">My Courses</h1>
                        <p className="text-gray-500 mt-1">Manage and edit your published courses.</p>
                    </div>
                    <button
                        onClick={() => setShowForm(true)}
                        className="group bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-200 transition-all flex items-center gap-2 transform hover:-translate-y-0.5"
                    >
                        <i className="fas fa-plus"></i> Create New Course
                    </button>
                </header>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    <th className="p-5">Course</th>
                                    <th className="p-5">Category</th>
                                    <th className="p-5">Price</th>
                                    <th className="p-5">Students</th>
                                    <th className="p-5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {courses.length > 0 ? courses.map(course => (
                                    <tr
                                        key={course._id}
                                        className="hover:bg-gray-50 cursor-pointer transition"
                                        onClick={() => setViewCourseDetails(course)}
                                    >
                                        <td className="p-5">
                                            <p className="font-bold text-navy-900">{course.title}</p>
                                            <p className="text-xs text-green-600 font-bold uppercase mt-1">{course.status || 'Published'}</p>
                                        </td>
                                        <td className="p-5 text-gray-600">{course.category}</td>
                                        <td className="p-5 font-bold text-navy-900">₹{course.price}</td>
                                        <td className="p-5">{course.enrolledStudents?.length || 0}</td>
                                        <td className="p-5 text-right space-x-3">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setEditingCourse(course);
                                                    setShowForm(true);
                                                }}
                                                className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                                            >
                                                <i className="fas fa-edit text-xs"></i>
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteCourse(course._id);
                                                }}
                                                className="w-8 h-8 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition"
                                            >
                                                <i className="fas fa-trash text-xs"></i>
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="5" className="p-12 text-center text-gray-400">
                                            <div className="mb-2"><i className="fas fa-folder-open text-3xl"></i></div>
                                            You haven't created any courses yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

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

            <CourseDetailsModal
                course={viewCourseDetails}
                onClose={() => setViewCourseDetails(null)}
            />

            <Toast
                show={notification.show}
                message={notification.message}
                type={notification.type}
                onClose={() => setNotification({ ...notification, show: false })}
            />
        </div>
    );
};

export default InstructorCourses;
