import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../config/server';
import Navbar from '../../components/Navbar/Navbar';
import CourseCard from '../../components/Card/CourseCard';
import { useAuth } from '../../context/AuthContext';

const MyCourses = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchMyCourses = async () => {
            try {
                const { data } = await api.get('/users/my-courses');
                if (data.success) {
                    setCourses(data.data);
                }
            } catch (error) {
                console.error("Failed to fetch my courses", error);
            } finally {
                setLoading(false);
            }
        };

        fetchMyCourses();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="mb-12">
                    <h1 className="text-3xl font-bold text-navy-900">My Learning</h1>
                    <p className="text-gray-500 mt-2">Pick up where you left off</p>
                </div>

                {loading ? (
                    <div className="text-center py-20">
                        <i className="fas fa-spinner fa-spin text-4xl text-blue-600"></i>
                    </div>
                ) : courses.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {courses.map((course) => (
                            <div key={course._id} className="relative group">
                                <CourseCard
                                    id={course._id}
                                    title={course.title}
                                    description={course.subtitle || course.description}
                                    rating={course.rating || "New"}
                                    duration={course.totalDuration ? `${Math.round(course.totalDuration / 60)} hours` : "Self-paced"}
                                    price="Enrolled"
                                    badge={course.level}
                                    bgImage={course.thumbnail && !course.thumbnail.includes('default') ? `http://localhost:3000/${course.thumbnail.replace(/\\/g, '/')}` : 'https://via.placeholder.com/300x200'}
                                />
                                <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 group-hover:opacity-100 transition translate-y-2 group-hover:translate-y-0 z-10">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate(`/course/${course._id}/learn`);
                                        }}
                                        className="w-full py-2 bg-blue-600 text-white font-bold rounded-lg shadow-lg hover:bg-blue-700 transition"
                                    >
                                        Resume Learning
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
                        <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <i className="fas fa-book-open text-3xl"></i>
                        </div>
                        <h3 className="text-xl font-bold text-navy-900">No courses yet</h3>
                        <p className="text-gray-500 mt-2 mb-8">You haven't enrolled in any courses yet. Start your learning journey today!</p>
                        <button
                            onClick={() => navigate('/viewCourses')}
                            className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-200"
                        >
                            Browse Courses
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyCourses;
