import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../config/server';
import PlayerSidebar from '../../components/CoursePlayer/PlayerSidebar';
import VideoPlayer from '../../components/CoursePlayer/VideoPlayer';
import QuizPlayer from '../../components/CoursePlayer/QuizPlayer';
import AIChat from '../../components/CoursePlayer/AIChat';

const CoursePlayer = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeLesson, setActiveLesson] = useState(null);
    const [progress, setProgress] = useState({ completedLessons: [], percentage: 0 });
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const courseRes = await api.get(`/users/course/${id}`);
                setCourse(courseRes.data.data);

                const progressRes = await api.get(`/users/course/${id}/progress`);
                if (progressRes.data.success) {
                    setProgress(progressRes.data.data);
                }

                if (courseRes.data.data.sections.length > 0 && courseRes.data.data.sections[0].lessons.length > 0) {
                    setActiveLesson(courseRes.data.data.sections[0].lessons[0]);
                }
            } catch (error) {
                console.error("Failed to load course", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCourse();
    }, [id]);

    const handleToggleComplete = async (lessonId) => {
        const isCompleting = !progress.completedLessons.includes(lessonId);
        try {
            const { data } = await api.patch(`/users/course/${id}/progress`, { lessonId });
            setProgress(data.data);

            if (isCompleting && course && activeLesson) {
                let currentSectionIndex = -1;
                let currentLessonIndex = -1;

                course.sections.forEach((section, sIndex) => {
                    const lIndex = section.lessons.findIndex(l => l._id === activeLesson._id);
                    if (lIndex !== -1) {
                        currentSectionIndex = sIndex;
                        currentLessonIndex = lIndex;
                    }
                });

                if (currentSectionIndex !== -1 && currentLessonIndex !== -1) {
                    const currentSection = course.sections[currentSectionIndex];
                    if (currentLessonIndex + 1 < currentSection.lessons.length) {
                        setActiveLesson(currentSection.lessons[currentLessonIndex + 1]);
                    } else if (currentSectionIndex + 1 < course.sections.length && course.sections[currentSectionIndex + 1].lessons.length > 0) {
                        setActiveLesson(course.sections[currentSectionIndex + 1].lessons[0]);
                    }
                }
            }
        } catch (error) {
            console.error("Failed to update progress", error);
        }
    };

    if (loading) return (
        <div className="h-screen w-full flex flex-col items-center justify-center bg-[#f4f7f9] text-navy-900">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
            <p className="font-bold text-gray-500 animate-pulse tracking-widest uppercase text-sm">Loading Environment...</p>
        </div>
    );
    if (!course) return <div className="p-8 text-center text-xl font-bold text-gray-400">Course not found</div>;

    return (
        <div style={{ fontFamily: 'Outfit, Inter, sans-serif' }} className="flex h-screen w-full bg-[#f8fafc] relative overflow-hidden font-sans">
            {/* Dynamic Background Gradients */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-300/20 blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-300/20 blur-[120px] pointer-events-none"></div>

            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-navy-900/40 backdrop-blur-sm z-40 lg:hidden transition-all duration-300"
                    onClick={() => setSidebarOpen(false)}
                ></div>
            )}

            <div className={`fixed inset-y-0 left-0 z-50 transform lg:static lg:block transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-2xl lg:shadow-none ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
                <PlayerSidebar
                    course={course}
                    activeLesson={activeLesson}
                    onLessonSelect={(lesson) => {
                        setActiveLesson(lesson);
                        setSidebarOpen(false);
                    }}
                    progress={progress}
                    handleToggleComplete={handleToggleComplete}
                />
            </div>

            <div className="flex-1 flex flex-col min-w-0 w-full relative z-10 overflow-hidden">
                {/* Premium Glassmorphic Header */}
                <div className="backdrop-blur-xl bg-white/80 border-b border-white/60 px-5 md:px-10 py-4 flex justify-between items-center shadow-[0_4px_30px_rgb(0,0,0,0.04)] shrink-0 z-20 transition-all">
                    <div className="flex items-center gap-3 sm:gap-5">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden w-11 h-11 rounded-full bg-white shadow-sm border border-gray-100 flex shrink-0 items-center justify-center text-gray-600 hover:text-blue-600 hover:shadow-md transition-all active:scale-95"
                        >
                            <i className="fas fa-bars"></i>
                        </button>
                        <button
                            onClick={() => navigate('/my-courses')}
                            className="group px-4 sm:px-5 py-2 sm:py-2.5 bg-white/50 hover:bg-white rounded-full border border-gray-200/50 shadow-sm hover:shadow text-gray-600 hover:text-blue-600 transition-all duration-300 flex items-center gap-2.5 font-bold text-xs sm:text-sm backdrop-blur-md active:scale-95"
                        >
                            <i className="fas fa-arrow-left group-hover:-translate-x-1.5 transition-transform duration-300"></i> <span className="hidden sm:inline tracking-wide">Back to Dashboard</span>
                        </button>
                    </div>

                    <div className="flex items-center gap-4 sm:gap-8">
                        <div className="hidden xl:flex items-center gap-3 px-5 py-2.5 bg-blue-50/50 rounded-full border border-blue-100/50 text-sm text-navy-900 font-bold max-w-[400px] shadow-sm">
                            <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0 shadow-inner">
                                <i className="fas fa-graduation-cap text-[11px]"></i>
                            </div>
                            <span className="truncate tracking-wide">{course.title}</span>
                        </div>

                        {activeLesson && (
                            <div className="flex items-center gap-2 sm:gap-4">
                                {progress.percentage === 100 && (
                                    <button
                                        onClick={async () => {
                                            try {
                                                const { data } = await api.post(`/users/course/${id}/certificate`);
                                                alert(`Congratulations! Your Certificate ID is ${data.data.certificateId}`);
                                            } catch (error) {
                                                console.error("Failed to issue certificate", error);
                                            }
                                        }}
                                        className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-full text-xs sm:text-sm font-bold hover:shadow-[0_8px_20px_rgba(245,158,11,0.4)] transition-all duration-300 flex items-center gap-2 whitespace-nowrap active:scale-95 group"
                                    >
                                        <i className="fas fa-award text-lg group-hover:scale-110 transition-transform"></i> <span className="hidden sm:inline uppercase tracking-wider">Certificate</span>
                                    </button>
                                )}
                                <button
                                    onClick={() => handleToggleComplete(activeLesson._id)}
                                    className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-bold transition-all duration-300 flex items-center gap-2.5 whitespace-nowrap active:scale-95 uppercase tracking-wider ${progress.completedLessons.includes(activeLesson._id)
                                        ? 'bg-gradient-to-r from-emerald-400 to-teal-500 text-white shadow-[0_8px_20px_rgba(16,185,129,0.3)] hover:shadow-[0_8px_25px_rgba(16,185,129,0.4)]'
                                        : 'bg-gradient-to-r from-navy-800 to-navy-900 text-white shadow-[0_8px_20px_rgba(15,23,42,0.3)] hover:shadow-[0_8px_25px_rgba(15,23,42,0.4)]'
                                        }`}
                                >
                                    {progress.completedLessons.includes(activeLesson._id) ? (
                                        <><i className="fas fa-check-circle text-lg animate-fade-in"></i> <span className="hidden sm:inline">Completed</span></>
                                    ) : (
                                        <><i className="fas fa-check sm:hidden"></i> <span className="hidden sm:inline">Mark Complete</span></>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-10 custom-scrollbar z-10 scroll-smooth">
                    <div className="max-w-5xl mx-auto pb-24">
                        {activeLesson ? (
                            <div className="space-y-8 animate-fade-in">

                                {/* Current Lesson Metadata Card */}
                                <div className="bg-gradient-to-r from-blue-700 via-indigo-600 to-purple-700 p-6 sm:p-8 rounded-[2rem] shadow-[0_20px_40px_-15px_rgba(79,70,229,0.5)] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-1000 ease-in-out"></div>
                                    <div className="flex items-center gap-5 relative z-10 w-full sm:w-auto">
                                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/10 backdrop-blur-xl flex shrink-0 items-center justify-center text-white text-xl sm:text-2xl shadow-inner border border-white/20">
                                            <i className={`fas ${activeLesson.type === 'video' ? 'fa-play ml-1' : activeLesson.type === 'quiz' ? 'fa-question' : 'fa-align-left'}`}></i>
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-xl sm:text-2xl font-extrabold text-white truncate tracking-tight">{activeLesson.title}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Lesson Media Feature */}
                                <div className="bg-white/90 backdrop-blur-lg p-2 sm:p-3 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-white relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-b from-gray-50/50 to-transparent pointer-events-none"></div>
                                    <div className="relative z-10">
                                        {activeLesson.type === 'video' && <VideoPlayer lesson={activeLesson} />}
                                        {activeLesson.type === 'quiz' && (
                                            <div className="p-4 sm:p-10">
                                                <QuizPlayer
                                                    lesson={activeLesson}
                                                    onComplete={() => {
                                                        if (!progress.completedLessons.includes(activeLesson._id)) {
                                                            handleToggleComplete(activeLesson._id);
                                                        }
                                                    }}
                                                />
                                            </div>
                                        )}
                                        {activeLesson.type === 'text' && (
                                            <div className="p-8 sm:p-14 bg-white rounded-[1.5rem] prose prose-sm sm:prose-lg max-w-none shadow-sm">
                                                <h2 className="text-3xl sm:text-4xl font-extrabold text-navy-900 mb-8 tracking-tight">{activeLesson.title}</h2>
                                                <div className="w-20 h-1.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full mb-8"></div>
                                                <p className="whitespace-pre-wrap text-gray-600 sm:text-lg leading-relaxed font-medium">{activeLesson.content}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-32 bg-white/60 backdrop-blur-xl rounded-[3rem] border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] px-6 text-center mt-10">
                                <div className="w-28 h-28 bg-gradient-to-tr from-blue-100 to-indigo-50 rounded-[2rem] flex items-center justify-center mb-8 shadow-inner rotate-3 hover:rotate-0 transition-transform duration-500">
                                    <i className="fas fa-book-open text-5xl text-blue-500"></i>
                                </div>
                                <h3 className="text-3xl font-extrabold text-navy-900 mb-3 tracking-tight">Ready to master a new skill?</h3>
                                <p className="text-gray-500 text-lg max-w-md mx-auto leading-relaxed">Select any module from your course layout on the left to begin your learning journey.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Premium AI Assistant */}
            <AIChat course={course} activeLesson={activeLesson} />
        </div>
    );
};

export default CoursePlayer;
