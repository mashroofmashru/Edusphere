import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import api from "../../config/server";
import { useAuth } from "../../context/AuthContext";
import { useUI } from "../../context/UIContext";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/FooterHome";
import InstructorCard from "../../components/CouseDetail/InstructorCard";
import { PageLoader, EmptyState } from "../../components/UI/Feedback";
import { courseThumb, formatPrice, formatRating, formatDuration, initialOf } from "../../utils/format";

const LESSON_ICON = {
    video: 'fa-play-circle text-blue-500',
    quiz: 'fa-question-circle text-purple-500',
    text: 'fa-file-alt text-amber-500',
};

const Stars = ({ value, className = '' }) => (
    <span className={`flex text-amber-400 ${className}`} aria-label={`${value} out of 5 stars`}>
        {[1, 2, 3, 4, 5].map(i => (
            <i key={i} className={`fas fa-star ${i <= Math.round(value) ? '' : 'text-gray-200'}`} aria-hidden="true"></i>
        ))}
    </span>
);

const CourseDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { user, isAuthenticated } = useAuth();
    const { toast } = useUI();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [enrollLoading, setEnrollLoading] = useState(false);
    const [reviews, setReviews] = useState([]);
    const [newReview, setNewReview] = useState({ rating: 5, comment: "" });
    const [reviewError, setReviewError] = useState("");
    const [reviewLoading, setReviewLoading] = useState(false);

    // Handle the redirect back from Stripe checkout
    useEffect(() => {
        const query = new URLSearchParams(location.search);
        const sessionId = query.get("session_id");
        const status = query.get("status");
        if (!status) return;

        if (status === "success") {
            const done = () => {
                setIsEnrolled(true);
                toast("Payment successful. You're enrolled!");
            };
            if (sessionId) {
                api.post('/payment/verify-session', { sessionId })
                    .then(done)
                    .catch(err => {
                        console.error("Verification failed", err);
                        toast("We couldn't verify your payment yet. Refresh in a moment or contact support.", "warning");
                    });
            } else {
                done();
            }
        }
        if (status === "cancel") {
            toast("Payment was canceled. You haven't been charged.", "info");
        }
        navigate(location.pathname, { replace: true });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const loadCourse = async () => {
        const [courseRes, reviewsRes] = await Promise.all([
            api.get(`/users/course/${id}`),
            api.get(`/users/course/${id}/reviews`)
        ]);
        const data = courseRes.data.data;
        setCourse(data);
        setReviews(reviewsRes.data.data || []);

        if (data.isEnrolled !== undefined) {
            setIsEnrolled(prev => prev || data.isEnrolled);
        } else if (user && data.enrolledStudents) {
            const userId = (user._id || user.id || '').toString();
            setIsEnrolled(prev => prev || data.enrolledStudents.some(s => (s._id || s.id || s).toString() === userId));
        }
    };

    useEffect(() => {
        setLoading(true);
        loadCourse()
            .catch(error => console.error("Failed to load course details", error))
            .finally(() => setLoading(false));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, user]);

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (!newReview.comment.trim()) {
            setReviewError("Please write a few words about the course.");
            return;
        }
        setReviewError("");
        setReviewLoading(true);
        try {
            await api.post(`/users/course/${id}/review`, newReview);
            await loadCourse();
            setNewReview({ rating: 5, comment: "" });
            toast("Thanks! Your review has been posted.");
        } catch (error) {
            console.error("Failed to submit review", error);
            setReviewError(error.response?.data?.message || "Failed to submit review. Please try again.");
        } finally {
            setReviewLoading(false);
        }
    };

    const handleEnroll = async () => {
        if (!isAuthenticated) {
            toast("Sign in or create an account to enroll.", "info");
            navigate('/auth', { state: { from: `/course/${id}` } });
            return;
        }
        if (isEnrolled) {
            navigate(`/course/${id}/learn`);
            return;
        }

        setEnrollLoading(true);
        try {
            if (Number(course.price) > 0) {
                const { data } = await api.post('/payment/create-checkout-session', { courseId: id });
                if (data.success && data.url) {
                    window.location.href = data.url;
                    return;
                }
                toast("Could not start checkout. Please try again.", "error");
            } else {
                await api.post(`/users/course/${id}/enroll`);
                setIsEnrolled(true);
                toast("You're enrolled. Happy learning!");
                navigate(`/course/${id}/learn`);
            }
        } catch (error) {
            console.error("Enrollment failed", error);
            toast(error.response?.data?.message || "Failed to enroll. Please try again.", "error");
        } finally {
            setEnrollLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col bg-gray-50">
                <Navbar />
                <PageLoader label="Loading course" />
            </div>
        );
    }

    if (!course) {
        return (
            <div className="min-h-screen flex flex-col bg-gray-50">
                <Navbar />
                <main className="flex-1 flex items-center justify-center px-4">
                    <EmptyState
                        icon="fa-search"
                        title="Course not found"
                        message="This course may have been removed or the link is incorrect."
                        action={<Link to="/viewCourses" className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition">Browse Courses</Link>}
                    />
                </main>
                <Footer />
            </div>
        );
    }

    const isFree = !(Number(course.price) > 0);
    const rating = formatRating(course.rating);
    const sections = course.sections || [];
    const lessonCount = sections.reduce((n, s) => n + (s.lessons?.length || 0), 0);
    const isOwnCourse = user && course.instructor && (course.instructor._id || course.instructor) === (user._id || user.id);
    const ctaLabel = isEnrolled ? 'Go to Course' : isFree ? 'Enroll for Free' : `Enroll Now · ${formatPrice(course.price)}`;

    const ctaButton = (extra = '') => (
        <button
            onClick={handleEnroll}
            disabled={enrollLoading}
            className={`py-3 px-6 text-white font-bold rounded-xl transition shadow-lg flex items-center justify-center gap-2 disabled:opacity-70 ${isEnrolled ? 'bg-green-600 hover:bg-green-700 shadow-green-200' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'} ${extra}`}
        >
            {enrollLoading ? <><i className="fas fa-spinner fa-spin" aria-hidden="true"></i> Please wait…</> : ctaLabel}
        </button>
    );

    return (
        <div className="min-h-screen flex flex-col bg-gray-50 antialiased">
            <Navbar />
            <main className="flex-1 py-8 md:py-14 pb-28 lg:pb-14">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <nav className="text-sm text-gray-500 mb-4" aria-label="Breadcrumb">
                        <Link to="/viewCourses" className="hover:text-blue-600">Courses</Link>
                        {course.category && <><span className="mx-2">/</span><span>{course.category}</span></>}
                    </nav>

                    <div className="mb-8 rounded-2xl overflow-hidden shadow-xl relative bg-navy-900 aspect-[16/7] sm:aspect-[16/5] min-h-[180px]">
                        <img src={courseThumb(course.thumbnail)} alt="" className="absolute inset-0 w-full h-full object-cover opacity-50" />
                        <div className="relative h-full flex flex-col items-center justify-center text-center px-4 py-8">
                            <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold text-white drop-shadow-lg max-w-4xl">{course.title}</h1>
                            {course.subtitle && <p className="mt-3 text-blue-100 text-sm sm:text-lg max-w-2xl">{course.subtitle}</p>}
                        </div>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-10 min-w-0">
                            <section className="space-y-4">
                                <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-medium text-gray-600">
                                    <a href="#reviews" className="flex items-center gap-1.5 text-amber-500 hover:underline">
                                        <i className="fas fa-star" aria-hidden="true"></i>
                                        {rating ? <>{rating} <span className="text-gray-500">({reviews.length} review{reviews.length === 1 ? '' : 's'})</span></> : <span className="text-gray-500">No ratings yet</span>}
                                    </a>
                                    {course.level && <span><i className="fas fa-layer-group text-blue-500 mr-2" aria-hidden="true"></i>{course.level}</span>}
                                    {course.category && <span><i className="fas fa-tag text-blue-500 mr-2" aria-hidden="true"></i>{course.category}</span>}
                                    <span><i className="fas fa-clock text-blue-500 mr-2" aria-hidden="true"></i>{formatDuration(course.totalDuration)}</span>
                                    <span><i className="fas fa-list text-blue-500 mr-2" aria-hidden="true"></i>{lessonCount} lessons</span>
                                    <span><i className="fas fa-users text-blue-500 mr-2" aria-hidden="true"></i>{course.enrolledStudents?.length || 0} students</span>
                                </div>
                                <h2 className="text-xl font-bold text-navy-900 pt-2">About this course</h2>
                                <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{course.description}</p>
                            </section>

                            <section className="bg-white p-5 sm:p-6 rounded-xl shadow-sm border border-gray-100">
                                <div className="flex flex-wrap items-baseline justify-between gap-2 mb-5">
                                    <h3 className="text-xl font-bold text-navy-900">Course Content</h3>
                                    <p className="text-sm text-gray-500">{sections.length} sections · {lessonCount} lessons</p>
                                </div>
                                {sections.length > 0 ? (
                                    <div className="space-y-3">
                                        {sections.map((section, idx) => (
                                            <details key={idx} className="group border border-gray-100 rounded-lg overflow-hidden" open={idx === 0}>
                                                <summary className="bg-gray-50 p-4 font-bold text-navy-900 flex items-center gap-3 cursor-pointer list-none hover:bg-gray-100 transition">
                                                    <i className="fas fa-chevron-down text-xs text-gray-400 transition-transform group-open:rotate-180" aria-hidden="true"></i>
                                                    <span className="flex-1 min-w-0">{section.title}</span>
                                                    <span className="text-xs text-gray-500 font-normal shrink-0">{section.lessons.length} lesson{section.lessons.length === 1 ? '' : 's'}</span>
                                                </summary>
                                                <ul className="divide-y divide-gray-100">
                                                    {section.lessons.map((lesson, lIdx) => (
                                                        <li key={lIdx} className="p-3 pl-5 sm:pl-10 flex items-center gap-3 text-sm text-gray-600">
                                                            <i className={`fas ${LESSON_ICON[lesson.type] || LESSON_ICON.text}`} aria-hidden="true"></i>
                                                            <span className="flex-1 min-w-0">{lesson.title}</span>
                                                            {lesson.isFreePreview && <span className="text-[10px] font-bold uppercase text-green-700 bg-green-50 px-1.5 py-0.5 rounded">Preview</span>}
                                                            <span className="text-xs text-gray-400 shrink-0">
                                                                {lesson.type === 'quiz' ? `${lesson.questions?.length || 0} questions` : lesson.duration > 0 ? formatDuration(lesson.duration) : ''}
                                                            </span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </details>
                                        ))}
                                    </div>
                                ) : <p className="text-gray-500">Curriculum coming soon.</p>}
                            </section>

                            <section id="reviews" className="space-y-6 scroll-mt-24">
                                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 pb-4">
                                    <h3 className="text-2xl font-bold text-navy-900">Student Reviews</h3>
                                    {rating ? (
                                        <div className="flex items-center gap-2">
                                            <Stars value={course.rating} />
                                            <span className="font-bold text-navy-900">{rating} out of 5</span>
                                        </div>
                                    ) : <span className="text-gray-500 text-sm">No ratings yet</span>}
                                </div>

                                {isEnrolled && (
                                    <div className="bg-white p-5 sm:p-6 rounded-xl border border-blue-100 shadow-sm">
                                        <h4 className="font-bold text-navy-900 mb-4">Write a Review</h4>
                                        <form onSubmit={handleReviewSubmit} className="space-y-4">
                                            <fieldset className="flex flex-wrap gap-3 items-center">
                                                <legend className="sr-only">Your rating</legend>
                                                <span className="text-sm font-medium text-gray-500" aria-hidden="true">Your Rating:</span>
                                                <div className="flex gap-1">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <button
                                                            key={star}
                                                            type="button"
                                                            aria-label={`${star} star${star > 1 ? 's' : ''}`}
                                                            aria-pressed={newReview.rating === star}
                                                            onClick={() => setNewReview({ ...newReview, rating: star })}
                                                            className={`text-2xl transition ${star <= newReview.rating ? 'text-amber-400' : 'text-gray-200 hover:text-amber-200'}`}
                                                        >
                                                            <i className="fas fa-star" aria-hidden="true"></i>
                                                        </button>
                                                    ))}
                                                </div>
                                            </fieldset>
                                            <label htmlFor="review-comment" className="sr-only">Your review</label>
                                            <textarea
                                                id="review-comment"
                                                placeholder="Share your experience with this course..."
                                                className={`w-full p-4 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition min-h-[100px] ${reviewError ? 'border-red-300' : 'border-gray-200'}`}
                                                value={newReview.comment}
                                                onChange={(e) => { setNewReview({ ...newReview, comment: e.target.value }); setReviewError(''); }}
                                                aria-invalid={reviewError ? 'true' : undefined}
                                                aria-describedby={reviewError ? 'review-error' : undefined}
                                            ></textarea>
                                            {reviewError && <p id="review-error" className="text-sm text-red-600" role="alert">{reviewError}</p>}
                                            <button
                                                type="submit"
                                                disabled={reviewLoading}
                                                className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition shadow-lg shadow-blue-200 disabled:opacity-70 flex items-center gap-2"
                                            >
                                                {reviewLoading && <i className="fas fa-spinner fa-spin" aria-hidden="true"></i>} Submit Review
                                            </button>
                                        </form>
                                    </div>
                                )}

                                {reviews.length > 0 ? (
                                    <ul className="grid gap-4">
                                        {reviews.map((review, idx) => (
                                            <li key={review._id || idx} className="bg-white p-5 sm:p-6 rounded-xl border border-gray-100 shadow-sm flex gap-4">
                                                <div className="w-11 h-11 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                                                    {initialOf(review.user?.name)}
                                                </div>
                                                <div className="space-y-2 flex-1 min-w-0">
                                                    <div className="flex flex-wrap justify-between items-start gap-2">
                                                        <div>
                                                            <h5 className="font-bold text-navy-900">{review.user?.name || 'Student'}</h5>
                                                            <Stars value={review.rating} className="text-xs mt-0.5" />
                                                        </div>
                                                        <span className="text-xs text-gray-400 font-medium">{new Date(review.createdAt).toLocaleDateString()}</span>
                                                    </div>
                                                    <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">{review.comment}</p>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div className="text-center py-10 bg-white rounded-xl border border-dashed border-gray-200">
                                        <p className="text-gray-500 font-medium">No reviews yet.{isEnrolled ? ' Be the first to share your thoughts!' : ''}</p>
                                    </div>
                                )}
                            </section>
                        </div>

                        <aside className="lg:col-span-1 space-y-8">
                            <div className="hidden lg:block bg-white p-6 rounded-xl shadow-lg border border-gray-100 sticky top-24">
                                <p className={`text-3xl font-bold mb-4 ${isFree ? 'text-green-600' : 'text-navy-900'}`}>{formatPrice(course.price)}</p>
                                {isOwnCourse ? (
                                    <p className="text-sm text-gray-500 mb-4">This is your course. Manage it from your instructor dashboard.</p>
                                ) : ctaButton('w-full mb-4')}
                                {!isEnrolled && !isFree && (
                                    <p className="text-xs text-center text-gray-500 mb-4 flex items-center justify-center gap-1">
                                        <i className="fas fa-lock" aria-hidden="true"></i> Secure payment via UPI, Cards, NetBanking
                                    </p>
                                )}
                                <ul className="space-y-3 text-sm text-gray-600">
                                    <li><i className="fas fa-check text-green-500 mr-2" aria-hidden="true"></i> Full lifetime access</li>
                                    <li><i className="fas fa-check text-green-500 mr-2" aria-hidden="true"></i> Learn on any device</li>
                                    <li><i className="fas fa-check text-green-500 mr-2" aria-hidden="true"></i> Certificate of completion</li>
                                    <li><i className="fas fa-check text-green-500 mr-2" aria-hidden="true"></i> AI tutor for every lesson</li>
                                </ul>
                            </div>
                            <InstructorCard instructor={course.instructor} />
                        </aside>
                    </div>
                </div>
            </main>

            {/* Mobile: keep the price and enroll action always reachable */}
            {!isOwnCourse && (
                <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] px-4 py-3 flex items-center gap-4">
                    <div className="min-w-0">
                        <p className={`text-xl font-bold ${isFree ? 'text-green-600' : 'text-navy-900'}`}>{formatPrice(course.price)}</p>
                        {!isEnrolled && !isFree && <p className="text-[11px] text-gray-500"><i className="fas fa-lock mr-1" aria-hidden="true"></i>Secure checkout</p>}
                    </div>
                    {ctaButton('flex-1')}
                </div>
            )}

            <Footer />
        </div>
    );
};

export default CourseDetail;
