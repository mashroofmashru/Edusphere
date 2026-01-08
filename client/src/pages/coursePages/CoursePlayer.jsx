import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../config/server';
import PlayerSidebar from '../../components/CoursePlayer/PlayerSidebar';
import VideoPlayer from '../../components/CoursePlayer/VideoPlayer';
import QuizPlayer from '../../components/CoursePlayer/QuizPlayer';

const CoursePlayer = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeLesson, setActiveLesson] = useState(null);
    const [progress, setProgress] = useState({ completedLessons: [], percentage: 0 });

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const courseRes = await api.get(`/users/course/${id}`);
                setCourse(courseRes.data.data);

                const progressRes = await api.get(`/users/course/${id}/progress`);
                if (progressRes.data.success) {
                    setProgress(progressRes.data.data);
                }

                // Auto-select first lesson
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
        try {
            const { data } = await api.patch(`/users/course/${id}/progress`, { lessonId });
            setProgress(data.data);
        } catch (error) {
            console.error("Failed to update progress", error);
        }
    };

    if (loading) return <div className="h-screen flex items-center justify-center text-navy-900"><i className="fas fa-spinner fa-spin text-4xl"></i></div>;
    if (!course) return <div className="p-8 text-center">Course not found</div>;

    return (
        <div style={{ fontFamily: 'Inter, sans-serif' }} className="flex h-screen bg-subtle-gray">
            <PlayerSidebar
                course={course}
                activeLesson={activeLesson}
                onLessonSelect={(lesson) => setActiveLesson(lesson)}
                progress={progress}
                handleToggleComplete={handleToggleComplete}
            />

            <div className="flex-1 flex flex-col min-w-0">
                {/* Player Header */}
                <div className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center shadow-sm">
                    <button
                        onClick={() => navigate('/my-courses')}
                        className="text-gray-600 hover:text-navy-900 transition flex items-center gap-2 font-bold text-sm"
                    >
                        <i className="fas fa-arrow-left"></i> Back to Dashboard
                    </button>
                    <div className="flex items-center gap-6">
                        <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500 font-medium">
                            <i className="fas fa-graduation-cap text-blue-500"></i>
                            <span className="truncate max-w-[200px]">{course.title}</span>
                        </div>
                        {activeLesson && (
                            <div className="flex items-center gap-3">
                                {progress.percentage === 100 && (
                                    <button
                                        onClick={async () => {
                                            try {
                                                const { data } = await api.post(`/users/course/${id}/certificate`);
                                                alert(`Congratulations! Your Certificate ID is ${data.data.certificateId}`);
                                                // We can navigate to a certificate page later
                                            } catch (error) {
                                                console.error("Failed to issue certificate", error);
                                            }
                                        }}
                                        className="px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-bold hover:bg-amber-600 transition flex items-center gap-2 shadow-lg shadow-amber-100"
                                    >
                                        <i className="fas fa-certificate"></i> Get Certificate
                                    </button>
                                )}
                                <button
                                    onClick={() => handleToggleComplete(activeLesson._id)}
                                    className={`px-4 py-2 rounded-lg text-sm font-bold transition flex items-center gap-2 ${progress.completedLessons.includes(activeLesson._id)
                                            ? 'bg-green-100 text-green-700 hover:bg-green-200 shadow-sm shadow-green-100'
                                            : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200'
                                        }`}
                                >
                                    {progress.completedLessons.includes(activeLesson._id) ? (
                                        <><i className="fas fa-check-circle"></i> Completed</>
                                    ) : (
                                        'Mark as Complete'
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 md:p-8">
                    <div className="max-w-5xl mx-auto">
                        {activeLesson ? (
                            <div className="space-y-6">
                                {activeLesson.type === 'video' && <VideoPlayer lesson={activeLesson} />}
                                {activeLesson.type === 'quiz' && (
                                    <QuizPlayer
                                        lesson={activeLesson}
                                        onComplete={() => {
                                            if (!progress.completedLessons.includes(activeLesson._id)) {
                                                handleToggleComplete(activeLesson._id);
                                            }
                                        }}
                                    />
                                )}
                                {activeLesson.type === 'text' && (
                                    <div className="bg-white p-8 sm:p-12 rounded-2xl shadow-sm border border-gray-100 prose max-w-none">
                                        <h2 className="text-3xl font-bold text-navy-900 mb-6 border-b border-gray-100 pb-4">{activeLesson.title}</h2>
                                        <p className="whitespace-pre-wrap text-gray-700 text-lg leading-relaxed">{activeLesson.content}</p>
                                    </div>
                                )}

                                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex justify-between items-center">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                                            <i className="fas fa-info-circle"></i>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-navy-900">Current Lesson</h4>
                                            <p className="text-sm text-gray-500">{activeLesson.title}</p>
                                        </div>
                                    </div>
                                    {/* Navigation buttons could go here */}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
                                <i className="fas fa-book-reader text-6xl text-gray-200 mb-4"></i>
                                <p className="text-gray-400 font-bold text-xl">Select a lesson to start learning</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CoursePlayer;
