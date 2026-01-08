import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../config/server";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import CourseHeader from "../../components/CouseDetail/CouseHeader";
import Curriculum from "../../components/CouseDetail/Curriculum";
import EnrollmentCard from "../../components/CouseDetail/EntrolmentCard";
import InstructorCard from "../../components/CouseDetail/InstructorCard";
import EnrollmentModal from "../../components/CouseDetail/EntrolmentModel";

const CourseDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const { user, isAuthenticated } = useAuth();
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [enrollLoading, setEnrollLoading] = useState(false);
    const [reviews, setReviews] = useState([]);
    const [newReview, setNewReview] = useState({ rating: 5, comment: "" });
    const [reviewLoading, setReviewLoading] = useState(false);

    useEffect(() => {
        const query = new URLSearchParams(window.location.search);
        if (query.get("status") === "success") {
            // Updated UX: Clear URL and confirm enrollment
            setIsEnrolled(true); // Optimistically set enrolled
            navigate(window.location.pathname, { replace: true });
            // Optionally show a toast here via a library if available, relying on optimistic update for now
        }
        if (query.get("status") === "cancel") {
            alert("Payment was canceled. You haven't been charged.");
            navigate(window.location.pathname, { replace: true });
        }
    }, [id, navigate]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [courseRes, reviewsRes] = await Promise.all([
                    api.get(`/users/course/${id}`),
                    api.get(`/users/course/${id}/reviews`)
                ]);

                setCourse(courseRes.data.data);
                setReviews(reviewsRes.data.data);

                // Use server-side enrollment status if available
                if (courseRes.data.data.isEnrolled !== undefined) {
                    setIsEnrolled(courseRes.data.data.isEnrolled);
                } else if (user && courseRes.data.data.enrolledStudents) {
                    // Fallback for backward compatibility
                    const userId = user._id || user.id;
                    const isUserEnrolled = courseRes.data.data.enrolledStudents.some(student =>
                        (student._id || student.id || student).toString() === userId.toString()
                    );
                    setIsEnrolled(isUserEnrolled);
                }
            } catch (error) {
                console.error("Failed to load course details", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, user]);

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (!newReview.comment) return alert("Please add a comment");

        setReviewLoading(true);
        try {
            const { data } = await api.post(`/users/course/${id}/review`, newReview);
            // Refresh reviews and course data (for average rating)
            const [courseRes, reviewsRes] = await Promise.all([
                api.get(`/users/course/${id}`),
                api.get(`/users/course/${id}/reviews`)
            ]);
            setCourse(courseRes.data.data);
            setReviews(reviewsRes.data.data);
            setNewReview({ rating: 5, comment: "" });
            alert("Review submitted successfully!");
        } catch (error) {
            console.error("Failed to submit review", error);
            alert(error.response?.data?.message || "Failed to submit review");
        } finally {
            setReviewLoading(false);
        }
    };

    const handleEnroll = async () => {
        if (!isAuthenticated) {
            navigate('/auth', { state: { from: `/course/${id}` } });
            return;
        }

        if (isEnrolled) {
            navigate(`/course/${id}/learn`);
            return;
        }

        setEnrollLoading(true);
        try {
            if (course.price > 0) {
                const { data } = await api.post('/payment/create-checkout-session', { courseId: id });
                if (data.success && data.url) {
                    window.location.href = data.url;
                }
            } else {
                await api.post(`/users/course/${id}/enroll`);
                setIsEnrolled(true);
                navigate(`/course/${id}/learn`); // Redirect to player after enrollment
            }
        } catch (error) {
            console.error("Enrollment failed", error);
            alert(error.response?.data?.message || "Failed to enroll. Please try again.");
        } finally {
            setEnrollLoading(false);
        }
    };

    if (loading) return <div className="h-screen flex items-center justify-center text-navy-900"><i className="fas fa-spinner fa-spin text-4xl"></i></div>;
    if (!course) return <div className="p-20 text-center">Course not found</div>;

    return (
        <div style={{ fontFamily: 'Inter, sans-serif' }} className="min-h-screen bg-subtle-gray antialiased">
            <Navbar />
            <main className="py-10 md:py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-10 rounded-xl overflow-hidden shadow-xl h-48 sm:h-64 relative bg-gray-900">
                        <img
                            src={course.thumbnail && !course.thumbnail.includes('default') ? `http://localhost:3000/${course.thumbnail.replace(/\\/g, '/')}` : 'https://via.placeholder.com/1200x500'}
                            alt={course.title}
                            className="w-full h-full object-cover opacity-80"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <h1 className="text-3xl md:text-5xl font-bold text-white text-center shadow-black drop-shadow-lg px-4">{course.title}</h1>
                        </div>
                    </div>
                    <div className="grid lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-10">
                            {/* Header Section */}
                            <div className="space-y-4">
                                <h2 className="text-2xl font-bold text-navy-900">{course.subtitle}</h2>
                                <p className="text-gray-600 leading-relaxed">{course.description}</p>
                                <div className="flex flex-wrap gap-4 text-sm font-medium text-gray-500">
                                    <span className="flex items-center text-amber-500">
                                        <i className="fas fa-star mr-1"></i>
                                        {course.rating} <span className="text-gray-400 ml-1">({reviews.length} reviews)</span>
                                    </span>
                                    <span><i className="fas fa-layer-group text-blue-500 mr-2"></i>{course.level}</span>
                                    <span><i className="fas fa-globe text-blue-500 mr-2"></i>{course.category}</span>
                                    <span><i className="fas fa-clock text-blue-500 mr-2"></i>{course.totalDuration ? Math.round(course.totalDuration / 60) + ' hrs' : 'Self-paced'}</span>
                                </div>
                            </div>

                            {/* Dynamic Curriculum */}
                            {/* ... existing curriculum ... */}
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <h3 className="text-xl font-bold text-navy-900 mb-6">Course Content</h3>
                                {course.sections.length > 0 ? (
                                    <div className="space-y-4">
                                        {course.sections.map((section, idx) => (
                                            <div key={idx} className="border border-gray-100 rounded-lg overflow-hidden">
                                                <div className="bg-gray-50 p-4 font-bold text-navy-900 flex justify-between">
                                                    <span>{section.title}</span>
                                                    <span className="text-xs text-gray-500 font-normal">{section.lessons.length} lessons</span>
                                                </div>
                                                <div className="divide-y divide-gray-100">
                                                    {section.lessons.map((lesson, lIdx) => (
                                                        <div key={lIdx} className="p-3 pl-6 flex items-center gap-3 text-sm text-gray-600 hover:bg-white transition">
                                                            <i className={`fas ${lesson.type === 'video' ? 'fa-play-circle text-blue-400' : 'fa-file-alt text-gray-400'}`}></i>
                                                            {lesson.title}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : <div className="text-gray-500">Curriculum coming soon</div>}
                            </div>

                            {/* Reviews & Ratings Section */}
                            <div id="reviews" className="space-y-8">
                                <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                                    <h3 className="text-2xl font-bold text-navy-900">Student Reviews</h3>
                                    <div className="flex items-center gap-2">
                                        <div className="flex text-amber-400">
                                            {[...Array(5)].map((_, i) => (
                                                <i key={i} className={`fas fa-star ${i < Math.floor(course.rating) ? '' : 'text-gray-200'}`}></i>
                                            ))}
                                        </div>
                                        <span className="font-bold text-navy-900">{course.rating} out of 5</span>
                                    </div>
                                </div>

                                {isEnrolled && (
                                    <div className="bg-white p-6 rounded-xl border border-blue-100 shadow-sm shadow-blue-50">
                                        <h4 className="font-bold text-navy-900 mb-4">Write a Review</h4>
                                        <form onSubmit={handleReviewSubmit} className="space-y-4">
                                            <div className="flex gap-4 items-center">
                                                <span className="text-sm font-medium text-gray-500">Your Rating:</span>
                                                <div className="flex gap-1">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <button
                                                            key={star}
                                                            type="button"
                                                            onClick={() => setNewReview({ ...newReview, rating: star })}
                                                            className={`text-2xl transition ${star <= newReview.rating ? 'text-amber-400' : 'text-gray-200 hover:text-amber-200'}`}
                                                        >
                                                            <i className="fas fa-star"></i>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            <textarea
                                                placeholder="Share your experience with this course..."
                                                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition min-h-[100px]"
                                                value={newReview.comment}
                                                onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                                            ></textarea>
                                            <button
                                                disabled={reviewLoading}
                                                className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition shadow-lg shadow-blue-200"
                                            >
                                                {reviewLoading ? <i className="fas fa-spinner fa-spin"></i> : 'Submit Review'}
                                            </button>
                                        </form>
                                    </div>
                                )}

                                <div className="grid gap-6">
                                    {reviews.length > 0 ? (
                                        reviews.map((review, idx) => (
                                            <div key={idx} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex gap-4">
                                                <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                                                    {review.user?.name?.charAt(0).toUpperCase() || 'U'}
                                                </div>
                                                <div className="space-y-2 flex-1">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <h5 className="font-bold text-navy-900">{review.user?.name}</h5>
                                                            <div className="flex text-amber-400 text-xs mt-0.5">
                                                                {[...Array(5)].map((_, i) => (
                                                                    <i key={i} className={`fas fa-star ${i < review.rating ? '' : 'text-gray-200'}`}></i>
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <span className="text-xs text-gray-400 font-medium">
                                                            {new Date(review.createdAt).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                    <p className="text-gray-600 text-sm leading-relaxed">{review.comment}</p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                            <p className="text-gray-400 font-medium">No reviews yet. Be the first to share your thoughts!</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="lg:col-span-1 space-y-8">
                            {/* Enrollment Card */}
                            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 sticky top-24">
                                <h3 className="text-3xl font-bold text-navy-900 mb-2">₹{course.price}</h3>
                                <button
                                    onClick={handleEnroll}
                                    disabled={enrollLoading}
                                    className={`w-full py-3 text-white font-bold rounded-xl transition shadow-lg mb-4 flex items-center justify-center gap-2 ${isEnrolled ? 'bg-green-600 hover:bg-green-700 shadow-green-200' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'}`}
                                >
                                    {enrollLoading ? <i className="fas fa-spinner fa-spin"></i> : (isEnrolled ? 'Go to Course' : 'Start Learning Now')}
                                </button>
                                <p className="text-xs text-center text-gray-500 mb-4 flex items-center justify-center gap-1">
                                    <i className="fas fa-lock"></i> Secure payment via UPI, Cards, NetBanking
                                </p>
                                <ul className="space-y-3 text-sm text-gray-600">
                                    <li><i className="fas fa-check text-green-500 mr-2"></i> Full lifetime access</li>
                                    <li><i className="fas fa-check text-green-500 mr-2"></i> Access on mobile and TV</li>
                                    <li><i className="fas fa-check text-green-500 mr-2"></i> Certificate of completion</li>
                                </ul>
                            </div>
                            <InstructorCard />
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
            <EnrollmentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </div>
    );
};

export default CourseDetail;