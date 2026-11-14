import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../config/server';
import PlayerSidebar from '../../components/CoursePlayer/PlayerSidebar';
import VideoPlayer from '../../components/CoursePlayer/VideoPlayer';
import QuizPlayer from '../../components/CoursePlayer/QuizPlayer';
import AIChat from '../../components/CoursePlayer/AIChat';
import CertificateTemplate from '../../components/Profile/CertificateTemplate';
import { Spinner, EmptyState } from '../../components/UI/Feedback';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import { formatDuration } from '../../utils/format';

const TYPE_ICON = { video: 'fa-play', quiz: 'fa-question', text: 'fa-align-left' };
const TYPE_LABEL = { video: 'Video', quiz: 'Quiz', text: 'Reading' };

const CoursePlayer = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { toast } = useUI();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeLesson, setActiveLesson] = useState(null);
    const [progress, setProgress] = useState({ completedLessons: [], percentage: 0 });
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [certificate, setCertificate] = useState(null);
    const [issuing, setIssuing] = useState(false);

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const courseRes = await api.get(`/users/course/${id}`);
                const data = courseRes.data.data;
                setCourse(data);

                let completed = [];
                try {
                    const progressRes = await api.get(`/users/course/${id}/progress`);
                    if (progressRes.data.success && progressRes.data.data) {
                        setProgress(progressRes.data.data);
                        completed = progressRes.data.data.completedLessons || [];
                    }
                } catch {
                    // No progress yet: start from the first lesson
                }

                // Resume at the first unfinished lesson
                const all = (data.sections || []).flatMap(s => s.lessons || []);
                setActiveLesson(all.find(l => !completed.includes(l._id)) || all[0] || null);
            } catch (error) {
                console.error("Failed to load course", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCourse();
    }, [id]);

    // Flat lesson list for previous / next navigation
    const lessons = useMemo(() => (course?.sections || []).flatMap(s => s.lessons || []), [course]);
    const activeIndex = activeLesson ? lessons.findIndex(l => l._id === activeLesson._id) : -1;
    const prevLesson = activeIndex > 0 ? lessons[activeIndex - 1] : null;
    const nextLesson = activeIndex >= 0 && activeIndex < lessons.length - 1 ? lessons[activeIndex + 1] : null;

    const goTo = (lesson) => {
        if (!lesson) return;
        setActiveLesson(lesson);
        setSidebarOpen(false);
        document.getElementById('lesson-scroll')?.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleToggleComplete = async (lessonId) => {
        const isCompleting = !progress.completedLessons.includes(lessonId);
        try {
            const { data } = await api.patch(`/users/course/${id}/progress`, { lessonId });
            setProgress(data.data);
            if (isCompleting) {
                if (data.data?.percentage === 100) toast("You've completed the course! Claim your certificate.");
                else if (nextLesson) goTo(nextLesson);
            }
        } catch (error) {
            console.error("Failed to update progress", error);
            toast("Couldn't save your progress. Please try again.", "error");
        }
    };

    const openCertificate = async () => {
        setIssuing(true);
        try {
            const { data } = await api.post(`/users/course/${id}/certificate`);
            setCertificate({ ...data.data, course: { title: course.title } });
        } catch (error) {
            console.error("Failed to issue certificate", error);
            toast(error.response?.data?.message || "Failed to issue certificate", "error");
        } finally {
            setIssuing(false);
        }
    };

    if (loading) return (
        <div className="h-screen w-full flex items-center justify-center bg-gray-50">
            <Spinner label="Loading your course" />
        </div>
    );
    if (!course) return (
        <div className="h-screen flex items-center justify-center bg-gray-50 px-4">
            <EmptyState
                icon="fa-exclamation-circle"
                title="Course not available"
                message="We couldn't load this course. You may not be enrolled, or it may have been removed."
                action={<Link to="/my-courses" className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition">Back to My Learning</Link>}
            />
        </div>
    );

    const isDone = activeLesson && progress.completedLessons.includes(activeLesson._id);

    return (
        <div className="flex h-screen w-full bg-gray-50 relative overflow-hidden font-sans">
            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 bg-navy-900/40 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} aria-hidden="true"></div>
            )}

            <div className={`fixed inset-y-0 left-0 z-50 transform lg:static lg:block transition-transform duration-300 shadow-2xl lg:shadow-none ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
                <PlayerSidebar
                    course={course}
                    activeLesson={activeLesson}
                    onLessonSelect={goTo}
                    progress={progress}
                    onClose={() => setSidebarOpen(false)}
                />
            </div>

            <div className="flex-1 flex flex-col min-w-0 w-full relative overflow-hidden">
                {/* Header */}
                <header className="bg-white border-b border-gray-200 px-3 sm:px-6 lg:px-8 py-3 flex justify-between items-center gap-3 shrink-0">
                    <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            aria-label="Open course contents"
                            className="lg:hidden w-10 h-10 rounded-lg border border-gray-200 flex shrink-0 items-center justify-center text-gray-600 hover:text-blue-600 hover:bg-gray-50 transition"
                        >
                            <i className="fas fa-list" aria-hidden="true"></i>
                        </button>
                        <button
                            onClick={() => navigate(user?.role === 'user' ? '/my-courses' : `/course/${id}`)}
                            className="px-3 sm:px-4 py-2 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-gray-50 transition flex items-center gap-2 font-bold text-sm shrink-0"
                        >
                            <i className="fas fa-arrow-left" aria-hidden="true"></i>
                            <span className="hidden sm:inline">{user?.role === 'user' ? 'My Learning' : 'Course Page'}</span>
                        </button>
                        <span className="hidden md:block text-sm font-bold text-navy-900 truncate border-l border-gray-200 pl-4">{course.title}</span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        {progress.percentage === 100 && (
                            <button
                                onClick={openCertificate}
                                disabled={issuing}
                                className="px-3 sm:px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-bold transition flex items-center gap-2 disabled:opacity-60"
                            >
                                <i className={`fas ${issuing ? 'fa-spinner fa-spin' : 'fa-award'}`} aria-hidden="true"></i>
                                <span className="hidden sm:inline">Certificate</span>
                            </button>
                        )}
                        {activeLesson && activeLesson.type !== 'quiz' && (
                            <button
                                onClick={() => handleToggleComplete(activeLesson._id)}
                                aria-pressed={isDone}
                                className={`px-3 sm:px-5 py-2 rounded-lg text-sm font-bold transition flex items-center gap-2 ${isDone
                                    ? 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100'
                                    : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                                title={isDone ? 'Mark as not complete' : 'Mark as complete'}
                            >
                                <i className={`fas ${isDone ? 'fa-check-circle' : 'fa-check'}`} aria-hidden="true"></i>
                                <span className="hidden sm:inline">{isDone ? 'Completed' : 'Mark Complete'}</span>
                            </button>
                        )}
                    </div>
                </header>

                <div id="lesson-scroll" className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
                    <div className="max-w-5xl mx-auto pb-24">
                        {activeLesson ? (
                            <div className="space-y-6 animate-fade-in" key={activeLesson._id}>
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex shrink-0 items-center justify-center text-lg">
                                        <i className={`fas ${TYPE_ICON[activeLesson.type] || TYPE_ICON.text}`} aria-hidden="true"></i>
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                                            Lesson {activeIndex + 1} of {lessons.length} · {TYPE_LABEL[activeLesson.type] || 'Lesson'}
                                            {activeLesson.duration > 0 && ` · ${formatDuration(activeLesson.duration)}`}
                                        </p>
                                        <h1 className="text-xl sm:text-2xl font-extrabold text-navy-900 mt-1 break-words">{activeLesson.title}</h1>
                                    </div>
                                </div>

                                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                    {activeLesson.type === 'video' && <VideoPlayer lesson={activeLesson} />}
                                    {activeLesson.type === 'quiz' && (
                                        <div className="p-4 sm:p-8">
                                            <QuizPlayer
                                                key={activeLesson._id}
                                                lesson={activeLesson}
                                                alreadyPassed={isDone}
                                                onComplete={() => {
                                                    if (!progress.completedLessons.includes(activeLesson._id)) {
                                                        api.patch(`/users/course/${id}/progress`, { lessonId: activeLesson._id })
                                                            .then(({ data }) => setProgress(data.data))
                                                            .catch(() => toast("Couldn't save your quiz result.", "error"));
                                                    }
                                                }}
                                                onContinue={nextLesson ? () => goTo(nextLesson) : undefined}
                                            />
                                        </div>
                                    )}
                                    {activeLesson.type === 'text' && (
                                        <article className="p-6 sm:p-10">
                                            <p className="whitespace-pre-wrap text-gray-700 sm:text-lg leading-relaxed">{activeLesson.content || 'This lesson has no content yet.'}</p>
                                        </article>
                                    )}
                                </div>

                                {/* Previous / next */}
                                <nav className="flex justify-between gap-3" aria-label="Lesson navigation">
                                    <button
                                        onClick={() => goTo(prevLesson)}
                                        disabled={!prevLesson}
                                        className="flex-1 sm:flex-none min-w-0 px-4 py-3 bg-white border border-gray-200 rounded-xl text-left hover:border-blue-300 hover:bg-blue-50/40 transition disabled:opacity-40 disabled:pointer-events-none"
                                    >
                                        <span className="block text-xs font-bold text-gray-400 uppercase"><i className="fas fa-arrow-left mr-1" aria-hidden="true"></i> Previous</span>
                                        <span className="block text-sm font-bold text-navy-900 truncate sm:max-w-[16rem]">{prevLesson?.title || '—'}</span>
                                    </button>
                                    <button
                                        onClick={() => goTo(nextLesson)}
                                        disabled={!nextLesson}
                                        className="flex-1 sm:flex-none min-w-0 px-4 py-3 bg-white border border-gray-200 rounded-xl text-right hover:border-blue-300 hover:bg-blue-50/40 transition disabled:opacity-40 disabled:pointer-events-none"
                                    >
                                        <span className="block text-xs font-bold text-gray-400 uppercase">Next <i className="fas fa-arrow-right ml-1" aria-hidden="true"></i></span>
                                        <span className="block text-sm font-bold text-navy-900 truncate sm:max-w-[16rem]">{nextLesson?.title || '—'}</span>
                                    </button>
                                </nav>
                            </div>
                        ) : (
                            <div className="bg-white rounded-2xl border border-gray-100 mt-6">
                                <EmptyState icon="fa-book-open" title="No lessons yet" message="The instructor hasn't added any lessons to this course yet." />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <AIChat course={course} activeLesson={activeLesson} />

            {certificate && (
                <CertificateTemplate certificate={certificate} user={user} onClose={() => setCertificate(null)} />
            )}
        </div>
    );
};

export default CoursePlayer;
