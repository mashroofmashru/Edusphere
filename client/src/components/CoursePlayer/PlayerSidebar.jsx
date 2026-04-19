import React from 'react';

const PlayerSidebar = ({ course, activeLesson, onLessonSelect, progress = { completedLessons: [], percentage: 0 } }) => {
    return (
        <div className="w-80 bg-white/90 backdrop-blur-2xl shadow-[4px_0_24px_rgba(0,0,0,0.02)] border-r border-gray-100 h-full flex flex-col overflow-hidden relative z-50">
            {/* Sidebar Header */}
            <div className="p-7 border-b border-gray-100 bg-white shadow-sm flex-shrink-0">
                <h2 className="font-extrabold text-navy-900 text-xl leading-tight line-clamp-2 mb-5 tracking-tight">{course.title}</h2>
                <div>
                    <div className="flex justify-between text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2.5">
                        <span>Course Progress</span>
                        <span className="text-blue-600">{progress?.percentage || 0}%</span>
                    </div>
                    <div className="w-full bg-gray-100/80 rounded-full h-2.5 shadow-inner overflow-hidden relative">
                        <div
                            className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full transition-all duration-1000 ease-out relative"
                            style={{ width: `${progress?.percentage || 0}%` }}
                        >
                            <div className="absolute top-0 right-0 bottom-0 w-10 bg-gradient-to-l from-white/40 to-transparent"></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sidebar Modules */}
            <div className="flex-1 overflow-y-auto custom-scrollbar bg-gray-50/30">
                {course.sections.map((section, sIndex) => (
                    <div key={sIndex} className="border-b border-gray-100/80">
                        <div className="px-6 py-4 bg-white/70 backdrop-blur-md sticky top-0 z-10 font-bold text-xs text-navy-800 uppercase tracking-widest flex justify-between items-center shadow-sm">
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-navy-800 to-navy-500">Section {sIndex + 1}: {section.title}</span>
                            <span className="text-[10px] bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full normal-case font-bold">{section.lessons.length}</span>
                        </div>
                        <div className="divide-y divide-gray-50/50">
                            {section.lessons.map((lesson, lIndex) => {
                                const isActive = activeLesson && activeLesson._id === lesson._id;
                                const isCompleted = progress?.completedLessons?.includes(lesson._id);
                                return (
                                    <div
                                        key={lesson._id}
                                        onClick={() => onLessonSelect(lesson, sIndex, lIndex)}
                                        className={`px-6 py-4 flex items-start gap-4 cursor-pointer transition-all duration-300 group relative ${isActive ? 'bg-blue-50/40' : 'hover:bg-white'}`}
                                    >
                                        {isActive && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-r-full shadow-[2px_0_8px_rgba(79,70,229,0.5)]"></div>}
                                        <div className="mt-0.5 flex-shrink-0 relative z-10">
                                            {isCompleted ? (
                                                <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shadow-sm border border-emerald-200">
                                                    <i className="fas fa-check text-[10px] text-emerald-600"></i>
                                                </div>
                                            ) : (
                                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${isActive ? 'border-blue-500 bg-white shadow-[0_0_10px_rgba(59,130,246,0.3)]' : 'border-gray-200 group-hover:border-blue-300 bg-white group-hover:shadow-sm'}`}>
                                                    {lesson.type === 'video' && <i className={`fas fa-play text-[8px] ${isActive ? 'text-blue-600 translate-x-px' : 'text-gray-300 group-hover:text-blue-400 translate-x-px'}`}></i>}
                                                    {lesson.type === 'quiz' && <i className={`fas fa-question text-[8px] ${isActive ? 'text-blue-600' : 'text-gray-300 group-hover:text-amber-400'}`}></i>}
                                                    {lesson.type === 'text' && <i className={`fas fa-align-left text-[8px] ${isActive ? 'text-blue-600' : 'text-gray-300 group-hover:text-blue-400'}`}></i>}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0 relative z-10">
                                            <p className={`text-sm font-bold leading-tight mb-1.5 transition-colors duration-300 ${isActive ? 'text-blue-700' : 'text-gray-600 group-hover:text-navy-900'}`}>{lesson.title}</p>
                                            <div className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-tighter ${isActive ? 'text-blue-400' : 'text-gray-400 group-hover:text-gray-500'}`}>
                                                <span>{lesson.type}</span>
                                                <span className={`w-1 h-1 rounded-full ${isActive ? 'bg-blue-300' : 'bg-gray-300'}`}></span>
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
