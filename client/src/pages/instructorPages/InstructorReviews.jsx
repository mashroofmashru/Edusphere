import React, { useState, useEffect, useMemo } from 'react';
import InstructorLayout from '../../components/Navbar/Sidebar';
import api from '../../config/server';
import { EmptyState } from '../../components/UI/Feedback';
import { initialOf } from '../../utils/format';

const Stars = ({ value }) => (
    <span className="flex text-amber-400 text-xs" aria-label={`${value} out of 5 stars`}>
        {[1, 2, 3, 4, 5].map(i => <i key={i} className={`fas fa-star ${i <= value ? '' : 'text-gray-200'}`} aria-hidden="true"></i>)}
    </span>
);

const InstructorReviews = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [courseFilter, setCourseFilter] = useState('All');

    useEffect(() => {
        api.get('/instructor/course-reviews')
            .then(({ data }) => data.success && setReviews(data.data || []))
            .catch(() => console.error('Failed to fetch reviews'))
            .finally(() => setLoading(false));
    }, []);

    const courseTitles = useMemo(
        () => [...new Set(reviews.map(r => r.course?.title).filter(Boolean))],
        [reviews]
    );
    const visible = courseFilter === 'All' ? reviews : reviews.filter(r => r.course?.title === courseFilter);
    const average = visible.length ? (visible.reduce((s, r) => s + Number(r.rating || 0), 0) / visible.length).toFixed(1) : null;

    return (
        <InstructorLayout>
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight">Student Reviews</h1>
                    <p className="text-gray-500 mt-1">See what students are saying about your courses.</p>
                </div>
                {courseTitles.length > 1 && (
                    <select
                        value={courseFilter}
                        onChange={(e) => setCourseFilter(e.target.value)}
                        aria-label="Filter by course"
                        className="w-full sm:w-64 p-2.5 border border-gray-200 rounded-xl bg-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                        <option value="All">All courses</option>
                        {courseTitles.map(t => <option key={t}>{t}</option>)}
                    </select>
                )}
            </header>

            {average && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6 flex items-center gap-6">
                    <p className="text-4xl font-extrabold text-navy-900">{average}</p>
                    <div>
                        <Stars value={Math.round(average)} />
                        <p className="text-sm text-gray-500 mt-1">{visible.length} review{visible.length === 1 ? '' : 's'}</p>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="divide-y divide-gray-100">
                        {[1, 2, 3].map(i => <div key={i} className="p-6"><div className="h-12 bg-gray-100 rounded-lg animate-pulse"></div></div>)}
                    </div>
                ) : visible.length > 0 ? (
                    <ul className="divide-y divide-gray-100">
                        {visible.map(review => (
                            <li key={review._id} className="p-6 hover:bg-gray-50 transition flex gap-4">
                                <div className="w-10 h-10 rounded-full bg-navy-100 text-navy-700 flex items-center justify-center font-bold shrink-0">
                                    {initialOf(review.user?.name)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap justify-between items-start gap-2">
                                        <div className="min-w-0">
                                            <p className="font-bold text-navy-900">{review.user?.name || 'Unknown User'}</p>
                                            <p className="text-xs text-gray-500 truncate">{review.course?.title || 'Unknown Course'}</p>
                                        </div>
                                        <div className="text-right">
                                            <Stars value={review.rating} />
                                            <p className="text-xs text-gray-400 mt-1">{new Date(review.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <p className="text-gray-600 text-sm mt-2 whitespace-pre-wrap">{review.comment}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <EmptyState icon="fa-comment-dots" title="No reviews yet" message="Reviews from your students will appear here." />
                )}
            </div>
        </InstructorLayout>
    );
};

export default InstructorReviews;
