import React from 'react';

const PlayerSidebar = ({ course, activeLesson, onLessonSelect, progress = { completedLessons: [], percentage: 0 } }) => {
    return (
        <div className="w-80 bg-white border-r border-gray-200 h-full flex flex-col overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-white">
                <h2 className="font-bold text-navy-900 text-lg line-clamp-1">{course.title}</h2>
                <div className="mt-4">
                    <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                        <span>Course Progress</span>
                        <span>{progress?.percentage || 0}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2 shadow-inner">
                        <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-700 shadow-sm"
                            style={{ width: `${progress?.percentage || 0}%` }}
                        ></div>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {course.sections.map((section, sIndex) => (
                    <div key={sIndex} className="border-b border-gray-100">
                        <div className="p-4 bg-gray-50/50 font-bold text-[11px] text-navy-800 uppercase tracking-widest flex justify-between items-center">
                            <span>Section {sIndex + 1}: {section.title}</span>
                            <span className="text-[10px] text-gray-400 normal-case font-medium">{section.lessons.length} Lessons</span>
                        </div>
                        <div className="divide-y divide-gray-50">
                            {section.lessons.map((lesson, lIndex) => {
                                const isActive = activeLesson && activeLesson._id === lesson._id;
                                const isCompleted = progress?.completedLessons?.includes(lesson._id);
                                return (
                                    <div
                                        key={lesson._id}
                                        onClick={() => onLessonSelect(lesson, sIndex, lIndex)}
                                        className={`p-4 flex items-start gap-4 cursor-pointer transition-all duration-200 group relative ${isActive ? 'bg-blue-50/70' : 'hover:bg-gray-50'}`}
                                    >
                                        {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-r-full"></div>}
                                        <div className="mt-0.5 flex-shrink-0">
                                            {isCompleted ? (
                                                <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                                                    <i className="fas fa-check text-[10px] text-green-600"></i>
                                                </div>
                                            ) : (
                                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${isActive ? 'border-blue-400 bg-blue-50' : 'border-gray-200 group-hover:border-blue-300'}`}>
                                                    {lesson.type === 'video' && <i className={`fas fa-play text-[8px] ${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-500'}`}></i>}
                                                    {lesson.type === 'quiz' && <i className={`fas fa-question text-[8px] ${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-amber-500'}`}></i>}
                                                    {lesson.type === 'text' && <i className={`fas fa-file-alt text-[8px] ${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-500'}`}></i>}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm font-semibold leading-tight mb-1 ${isActive ? 'text-blue-900' : 'text-gray-700 group-hover:text-navy-900'}`}>{lesson.title}</p>
                                            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                                                <span>{lesson.type}</span>
                                                <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                                <span>{lesson.duration ? `${lesson.duration}m` : (lesson.type === 'quiz' ? `${lesson.questions?.length} Qs` : '5m')}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PlayerSidebar;
