import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../config/server';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/FooterHome';
import CourseCard from '../../components/Card/CourseCard';
import { CardSkeleton, EmptyState } from '../../components/UI/Feedback';
import { toCardProps } from '../../utils/format';

const MyCourses = () => {
    const [courses, setCourses] = useState([]);
    const [progress, setProgress] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMyCourses = async () => {
            try {
                const { data } = await api.get('/users/my-courses');
                if (!data.success) return;
                setCourses(data.data);

                // Progress isn't part of the list response, so fetch it per course in parallel
                const results = await Promise.allSettled(
                    data.data.map(c => api.get(`/users/course/${c._id}/progress`))
                );
                const map = {};
                results.forEach((r, i) => {
                    if (r.status === 'fulfilled' && r.value.data.success) {
                        map[data.data[i]._id] = r.value.data.data?.percentage || 0;
                    }
                });
                setProgress(map);
            } catch (error) {
                console.error("Failed to fetch my courses", error);
            } finally {
                setLoading(false);
            }
        };
        fetchMyCourses();
    }, []);

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
                <div className="mb-10">
                    <h1 className="text-2xl sm:text-3xl font-bold text-navy-900">My Learning</h1>
                    <p className="text-gray-500 mt-2">Pick up where you left off</p>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                        {[1, 2, 3].map(i => <CardSkeleton key={i} />)}
                    </div>
                ) : courses.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                        {courses.map((course) => {
                            const pct = progress[course._id];
                            const done = pct === 100;
                            return (
                                <CourseCard
                                    key={course._id}
                                    {...toCardProps(course)}
                                    to={`/course/${course._id}/learn`}
                                    price={done ? 'Completed' : 'Enrolled'}
                                    footer={
                                        <div className="mt-4 pt-4 border-t border-gray-100">
                                            {pct !== undefined && (
                                                <div className="mb-3">
                                                    <div className="flex justify-between text-xs font-bold text-gray-500 mb-1">
                                                        <span>{done ? 'Course complete' : 'Progress'}</span>
                                                        <span className={done ? 'text-green-600' : 'text-blue-600'}>{pct}%</span>
                                                    </div>
                                                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Course progress">
                                                        <div className={`h-full rounded-full ${done ? 'bg-green-500' : 'bg-blue-600'}`} style={{ width: `${pct}%` }}></div>
                                                    </div>
                                                </div>
                                            )}
                                            <span className="block w-full py-2 text-center bg-blue-600 text-white font-bold rounded-lg group-hover:bg-blue-700 transition">
                                                {done ? 'Review Course' : pct ? 'Resume Learning' : 'Start Learning'}
                                            </span>
                                        </div>
                                    }
                                />
                            );
                        })}
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
                        <EmptyState
                            icon="fa-book-open"
                            title="No courses yet"
                            message="You haven't enrolled in any courses yet. Start your learning journey today!"
                            action={<Link to="/viewCourses" className="inline-block px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-200">Browse Courses</Link>}
                        />
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
};

export default MyCourses;
