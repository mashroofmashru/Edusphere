import React, { useState, useEffect } from 'react';
import InstructorLayout from '../../components/Navbar/Sidebar';
import api from '../../config/server';
import CourseForm from '../../components/Forms/CourseForm';
import CourseDetailsModal from '../../components/CouseDetail/CourseDetailsModal';
import { useUI } from '../../context/UIContext';
import { EmptyState, TableSkeleton } from '../../components/UI/Feedback';
import { courseThumb, formatPrice } from '../../utils/format';

const STATUS_STYLES = {
    Published: 'bg-green-100 text-green-700',
    Draft: 'bg-amber-100 text-amber-700',
    Archived: 'bg-gray-100 text-gray-600',
};

const StatusBadge = ({ status }) => (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold uppercase ${STATUS_STYLES[status] || STATUS_STYLES.Draft}`}>
        {status || 'Draft'}
    </span>
);

const InstructorCourses = () => {
    const { toast, confirm } = useUI();
    const [courses, setCourses] = useState([]);
    const [fetching, setFetching] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editingCourse, setEditingCourse] = useState(null);
    const [viewCourseDetails, setViewCourseDetails] = useState(null);

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const { data } = await api.get('/instructor/my-courses');
            setCourses(data.courses || []);
        } catch {
            toast('Failed to load your courses', 'error');
        } finally {
            setFetching(false);
        }
    };

    const handleSubmitCourse = async (courseData, courseId) => {
        setSaving(true);
        try {
            if (courseId) {
                await api.patch(`/instructor/edit/${courseId}`, courseData);
                toast('Course updated successfully!');
            } else {
                await api.post('/instructor/create', courseData);
                toast('Course created successfully!');
            }
            setShowForm(false);
            setEditingCourse(null);
            fetchCourses();
        } catch (error) {
            toast(error.response?.data?.message || 'Operation failed', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteCourse = async (course) => {
        const ok = await confirm({
            title: 'Delete this course?',
            message: `"${course.title}" will be permanently removed. This action cannot be undone.`,
            confirmText: 'Delete',
            danger: true,
        });
        if (!ok) return;
        try {
            await api.delete(`/instructor/course/${course._id}`);
            toast('Course deleted successfully!');
            fetchCourses();
        } catch (error) {
            toast(error.response?.data?.message || 'Failed to delete course', 'error');
        }
    };

    const openEditor = (course = null) => {
        setEditingCourse(course);
        setShowForm(true);
    };

    const actions = (course) => (
        <div className="flex gap-2 justify-end">
            <button
                onClick={(e) => { e.stopPropagation(); openEditor(course); }}
                className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                aria-label={`Edit ${course.title}`}
                title="Edit course"
            >
                <i className="fas fa-edit text-xs" aria-hidden="true"></i>
            </button>
            <button
                onClick={(e) => { e.stopPropagation(); handleDeleteCourse(course); }}
                className="w-9 h-9 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition"
                aria-label={`Delete ${course.title}`}
                title="Delete course"
            >
                <i className="fas fa-trash text-xs" aria-hidden="true"></i>
            </button>
        </div>
    );

    return (
        <InstructorLayout>
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight">My Courses</h1>
                    <p className="text-gray-500 mt-1">Manage and edit your courses.</p>
                </div>
                <button
                    onClick={() => openEditor()}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-200 transition flex items-center gap-2 w-full sm:w-auto justify-center"
                >
                    <i className="fas fa-plus" aria-hidden="true"></i> Create New Course
                </button>
            </header>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {!fetching && courses.length === 0 ? (
                    <EmptyState
                        title="No courses yet"
                        message="Create your first course to start teaching on EduSphere."
                        action={<button onClick={() => openEditor()} className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition">Create Course</button>}
                    />
                ) : (
                    <>
                        {/* Mobile cards */}
                        <ul className="md:hidden divide-y divide-gray-100">
                            {fetching ? (
                                [1, 2, 3].map(i => <li key={i} className="p-4"><div className="h-14 bg-gray-100 rounded-lg animate-pulse"></div></li>)
                            ) : courses.map(course => (
                                <li key={course._id}>
                                    <div className="p-4 flex gap-3 items-center">
                                        <button onClick={() => setViewCourseDetails(course)} className="flex gap-3 items-center flex-1 min-w-0 text-left">
                                            <img src={courseThumb(course.thumbnail)} alt="" className="w-14 h-14 rounded-lg object-cover bg-gray-100 shrink-0" />
                                            <div className="min-w-0">
                                                <p className="font-bold text-navy-900 truncate">{course.title}</p>
                                                <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                                                    <StatusBadge status={course.status} />
                                                    <span>{formatPrice(course.price)}</span>
                                                    <span>· {course.enrolledStudents?.length || 0} students</span>
                                                </div>
                                            </div>
                                        </button>
                                        {actions(course)}
                                    </div>
                                </li>
                            ))}
                        </ul>

                        {/* Desktop table */}
                        <div className="hidden md:block overflow-x-auto">
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
                                    {fetching ? <TableSkeleton cols={5} /> : courses.map(course => (
                                        <tr
                                            key={course._id}
                                            className="hover:bg-gray-50 cursor-pointer transition"
                                            onClick={() => setViewCourseDetails(course)}
                                        >
                                            <td className="p-5">
                                                <div className="flex items-center gap-3">
                                                    <img src={courseThumb(course.thumbnail)} alt="" className="w-12 h-12 rounded-lg object-cover bg-gray-100 shrink-0" />
                                                    <div className="min-w-0">
                                                        <p className="font-bold text-navy-900 line-clamp-1">{course.title}</p>
                                                        <div className="mt-1"><StatusBadge status={course.status} /></div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-5 text-gray-600">{course.category}</td>
                                            <td className="p-5 font-bold text-navy-900">{formatPrice(course.price)}</td>
                                            <td className="p-5">{course.enrolledStudents?.length || 0}</td>
                                            <td className="p-5">{actions(course)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>

            {showForm && (
                <CourseForm
                    onClose={() => {
                        setShowForm(false);
                        setEditingCourse(null);
                    }}
                    onSubmit={handleSubmitCourse}
                    loading={saving}
                    initialData={editingCourse}
                />
            )}

            <CourseDetailsModal
                course={viewCourseDetails}
                onClose={() => setViewCourseDetails(null)}
            />
        </InstructorLayout>
    );
};

export default InstructorCourses;
