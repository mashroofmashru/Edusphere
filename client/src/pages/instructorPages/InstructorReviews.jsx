import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Navbar/Sidebar';
import api from '../../config/server';

const InstructorReviews = () => {
    const [reviews, setReviews] = useState([]);

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            const { data } = await api.get('/instructor/course-reviews');
            if (data.success) {
                setReviews(data.data);
            }
        } catch (err) {
            console.error("Failed to fetch reviews");
        }
    };

    return (
        <div className="flex h-screen bg-gray-50 font-sans">
            <Sidebar />

            <main className="flex-1 overflow-y-auto p-4 md:p-8">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-extrabold text-navy-900 tracking-tight">Student Reviews</h1>
                        <p className="text-gray-500 mt-1">See what students are saying about your courses.</p>
                    </div>
                </header>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="divide-y divide-gray-100">
                        {reviews.length > 0 ? reviews.map(review => (
                            <div key={review._id} className="p-6 hover:bg-gray-50 transition">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-navy-50 text-navy-600 flex items-center justify-center font-bold">
                                            {review.user?.name ? review.user.name.charAt(0).toUpperCase() : 'U'}
                                        </div>
                                        <div>
                                            <p className="font-bold text-navy-900">{review.user?.name || 'Unknown User'}</p>
                                            <p className="text-xs text-gray-500">{review.course?.title || 'Unknown Course'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded text-amber-600 font-bold text-xs">
                                        <span>{review.rating}</span>
                                        <i className="fas fa-star text-[10px]"></i>
                                    </div>
                                </div>
                                <p className="text-gray-600 text-sm pl-13 ml-13 mt-2">{review.comment}</p>
                                <p className="text-right text-xs text-gray-400 mt-2">{new Date(review.createdAt).toLocaleDateString()}</p>
                            </div>
                        )) : (
                            <div className="p-12 text-center text-gray-400">
                                <div className="mb-2"><i className="far fa-comment-dots text-3xl"></i></div>
                                No reviews found for your courses yet.
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default InstructorReviews;
