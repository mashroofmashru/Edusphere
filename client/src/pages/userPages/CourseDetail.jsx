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
    video: 'fa-play-circle',
    quiz: 'fa-question-circle',
    text: 'fa-file-alt',
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
            <div className="min-h-screen flex flex-col bg-white">
                <Navbar />
                <PageLoader label="Loading course" />
            </div>
        );
    }

    if (!course) {
        return (
            <div className="min-h-screen flex flex-col bg-white">
                <Navbar />
                <main className="flex-1 flex items-center justify-center px-4">
                    <EmptyState
                        icon="fa-search"
                        title="Course not found"
                        message="This course may have been removed or the link is incorrect."
                        action={<Link to="/viewCourses" className="px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition">Browse courses</Link>}
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
            className={`py-2.5 px-5 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-70 ${isEnrolled ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'} ${extra}`}
        >
            {enrollLoading ? <><i className="fas fa-spinner fa-spin" aria-hidden="true"></i> Please wait…</> : ctaLabel}
        </button>
    );

    const meta = [
        course.level,
        formatDuration(course.totalDuration),
        `${lessonCount} lesson${lessonCount === 1 ? '' : 's'}`,
        `${course.enrolledStudents?.length || 0} enrolled`,
    ].filter(Boolean);

    return (
        <div className="min-h-screen flex flex-col bg-white">
            <Navbar />
            <main className="flex-1 pb-24 lg:pb-0">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <nav className="text-sm text-gray-500 mb-3" aria-label="Breadcrumb">
                        <Link to="/viewCourses" className="hover:text-gray-900">Courses</Link>
                        {course.category && (
                            <>
                                <span className="mx-1.5">/</span>
                                <Link to={`/viewCourses?category=${encodeURIComponent(course.category)}`} className="hover:text-gray-900">{course.category}</Link>
                            </>
                        )}
                    </nav>

                    <div className="grid lg:grid-cols-[1fr_320px] gap-8 lg:gap-12">
                        <div className="min-w-0">
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">{course.title}</h1>
                            {course.subtitle && <p className="mt-2 text-gray-600 sm:text-lg">{course.subtitle}</p>}

                            <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-gray-500">
                                <a href="#reviews" className="hover:underline">
                                    {rating ? (
                                        <><i className="fas fa-star text-amber-400 text-xs mr-1" aria-hidden="true"></i><span className="font-medium text-gray-800">{rating}</span> ({reviews.length} review{reviews.length === 1 ? '' : 's'})</>
                                    ) : 'No ratings yet'}
                                </a>
                                {meta.map((m) => <span key={m}>· {m}</span>)}
                            </div>
                            {course.instructor?.name && (
                                <p className="mt-2 text-sm text-gray-500">
                                    By <a href="#instructor" className="font-medium text-gray-800 hover:underline">{course.instructor.name}</a>
                                </p>
                            )}

                            {/* On small screens the thumbnail sits under the title */}
                            <img src={courseThumb(course.thumbnail)} alt="" className="lg:hidden mt-5 w-full aspect-video object-cover rounded-lg border border-gray-200" />

                            <section className="mt-8">
                                <h2 className="text-lg font-bold text-gray-900">About this course</h2>
                                <p className="mt-2 text-gray-700 leading-relaxed whitespace-pre-wrap">{course.description}</p>
                            </section>

                            <section className="mt-10">
                                <div className="flex flex-wrap items-baseline justify-between gap-2 mb-3">
                                    <h2 className="text-lg font-bold text-gray-900">What's inside</h2>
                                    <p className="text-sm text-gray-500">{sections.length} section{sections.length === 1 ? '' : 's'} · {lessonCount} lessons</p>
                                </div>
                                {sections.length > 0 ? (
                                    <div className="border border-gray-200 rounded-lg divide-y divide-gray-200">
                                        {sections.map((section, idx) => (
                                            <details key={idx} className="group" open={idx === 0}>
                                                <summary className="px-4 py-3 font-medium text-gray-900 flex items-center gap-3 cursor-pointer list-none hover:bg-gray-50">
                                                    <i className="fas fa-chevron-right text-[10px] text-gray-400 transition-transform group-open:rotate-90" aria-hidden="true"></i>
                                                    <span className="flex-1 min-w-0">{section.title}</span>
                                                    <span className="text-xs text-gray-500 font-normal shrink-0">{section.lessons.length} lesson{section.lessons.length === 1 ? '' : 's'}</span>
                                                </summary>
                                                <ul className="pb-2">
                                                    {section.lessons.map((lesson, lIdx) => (
                                                        <li key={lIdx} className="px-4 pl-10 py-2 flex items-center gap-3 text-sm text-gray-600">
                                                            <i className={`fas ${LESSON_ICON[lesson.type] || LESSON_ICON.text} w-4 text-gray-400`} aria-hidden="true"></i>
                                                            <span className="flex-1 min-w-0">{lesson.title}</span>
                                                            {lesson.isFreePreview && <span className="text-xs font-medium text-green-700">Preview</span>}
                                                            <span className="text-xs text-gray-400 shrink-0">
                                                                {lesson.type === 'quiz' ? `${lesson.questions?.length || 0} questions` : lesson.duration > 0 ? formatDuration(lesson.duration) : ''}
                                                            </span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </details>
                                        ))}
                                    </div>
                                ) : <p className="text-gray-500 text-sm">The instructor hasn't added lessons yet.</p>}
                            </section>

                            <section id="instructor" className="mt-10 scroll-mt-24">
                                <InstructorCard instructor={course.instructor} />
                            </section>

                            <section id="reviews" className="mt-10 mb-12 scroll-mt-24">
                                <div className="flex flex-wrap items-baseline justify-between gap-3 mb-4">
                                    <h2 className="text-lg font-bold text-gray-900">Reviews</h2>
                                    {rating && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <Stars value={course.rating} className="text-xs" />
                                            <span className="font-medium text-gray-800">{rating} out of 5</span>
                                        </div>
                                    )}
                                </div>

                                {isEnrolled && (
                                    <form onSubmit={handleReviewSubmit} className="mb-6 rounded-lg border border-gray-200 p-4 space-y-3">
                                        <fieldset className="flex flex-wrap gap-3 items-center">
                                            <legend className="sr-only">Your rating</legend>
                                            <span className="text-sm font-medium text-gray-900" aria-hidden="true">Your rating</span>
                                            <div className="flex gap-0.5">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <button
                                                        key={star}
                                                        type="button"
                                                        aria-label={`${star} star${star > 1 ? 's' : ''}`}
                                                        aria-pressed={newReview.rating === star}
                                                        onClick={() => setNewReview({ ...newReview, rating: star })}
                                                        className={`text-xl transition ${star <= newReview.rating ? 'text-amber-400' : 'text-gray-200 hover:text-amber-200'}`}
                                                    >
                                                        <i className="fas fa-star" aria-hidden="true"></i>
                                                    </button>
                                                ))}
                                            </div>
                                        </fieldset>
                                        <label htmlFor="review-comment" className="sr-only">Your review</label>
                                        <textarea
                                            id="review-comment"
                                            placeholder="What did you think? What would you tell someone before they start?"
                                            className={`w-full rounded-lg border px-3 py-2.5 text-[15px] placeholder:text-gray-400 focus:outline-none focus:ring-2 min-h-[90px] ${reviewError ? 'border-red-400 focus:ring-red-100' : 'border-gray-300 focus:border-blue-600 focus:ring-blue-100'}`}
                                            value={newReview.comment}
                                            onChange={(e) => { setNewReview({ ...newReview, comment: e.target.value }); setReviewError(''); }}
                                            aria-invalid={reviewError ? 'true' : undefined}
                                            aria-describedby={reviewError ? 'review-error' : undefined}
                                        ></textarea>
                                        {reviewError && <p id="review-error" className="text-sm text-red-600" role="alert">{reviewError}</p>}
                                        <button
                                            type="submit"
                                            disabled={reviewLoading}
                                            className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition disabled:opacity-70 flex items-center gap-2"
                                        >
                                            {reviewLoading && <i className="fas fa-spinner fa-spin" aria-hidden="true"></i>} Post review
                                        </button>
                                    </form>
                                )}

                                {reviews.length > 0 ? (
                                    <ul className="divide-y divide-gray-200 border-t border-gray-200">
                                        {reviews.map((review, idx) => (
                                            <li key={review._id || idx} className="py-4 flex gap-3">
                                                <div className="w-9 h-9 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center text-sm font-semibold shrink-0">
                                                    {initialOf(review.user?.name)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                                                        <span className="font-medium text-gray-900 text-sm">{review.user?.name || 'Student'}</span>
                                                        <Stars value={review.rating} className="text-[10px]" />
                                                        <span className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</span>
                                                    </div>
                                                    <p className="mt-1 text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{review.comment}</p>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-sm text-gray-500">No reviews yet.{isEnrolled ? ' You could be the first.' : ''}</p>
                                )}
                            </section>
                        </div>

                        <aside className="hidden lg:block">
                            <div className="sticky top-24 rounded-lg border border-gray-200 overflow-hidden">
                                <img src={courseThumb(course.thumbnail)} alt="" className="w-full aspect-video object-cover border-b border-gray-200" />
                                <div className="p-5">
                                    <p className={`text-2xl font-bold ${isFree ? 'text-green-700' : 'text-gray-900'}`}>{formatPrice(course.price)}</p>
                                    {isOwnCourse ? (
                                        <p className="mt-3 text-sm text-gray-500">This is your course. Manage it from your instructor dashboard.</p>
                                    ) : ctaButton('w-full mt-4')}
                                    {!isEnrolled && !isFree && (
                                        <p className="mt-2 text-xs text-center text-gray-500">Pay by card, UPI or net banking through Stripe.</p>
                                    )}
                                    <ul className="mt-5 space-y-1.5 text-sm text-gray-600">
                                        <li>Yours to keep, no time limit</li>
                                        <li>AI tutor in every lesson</li>
                                        <li>Certificate when you finish</li>
                                    </ul>
                                </div>
                            </div>
                        </aside>
                    </div>
                </div>
            </main>

            {/* Mobile: keep the price and enroll action always reachable */}
            {!isOwnCourse && (
                <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-gray-200 px-4 py-3 flex items-center gap-4">
                    <p className={`text-lg font-bold ${isFree ? 'text-green-700' : 'text-gray-900'}`}>{formatPrice(course.price)}</p>
                    {ctaButton('flex-1')}
                </div>
            )}

            <Footer />
        </div>
    );
};

export default CourseDetail;
