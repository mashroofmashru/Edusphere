import React from 'react';
import { formatDuration } from '../../utils/format';

const TYPE_ICON = { video: 'fa-play', quiz: 'fa-question', text: 'fa-align-left' };

const lessonMeta = (lesson) => {
    if (lesson.type === 'quiz') return `${lesson.questions?.length || 0} questions`;
    return lesson.duration > 0 ? formatDuration(lesson.duration) : null;
};

const PlayerSidebar = ({ course, activeLesson, onLessonSelect, onClose, progress = { completedLessons: [], percentage: 0 } }) => {
    const pct = progress?.percentage || 0;

    return (
        <aside className="w-[85vw] max-w-xs sm:w-80 bg-white border-r border-gray-200 h-full flex flex-col overflow-hidden" aria-label="Course contents">
            <div className="p-5 border-b border-gray-100 flex-shrink-0">
                <div className="flex items-start justify-between gap-3 mb-4">
                    <h2 className="font-extrabold text-navy-900 text-lg leading-tight line-clamp-2">{course.title}</h2>
                    {onClose && (
                        <button onClick={onClose} aria-label="Close course contents" className="lg:hidden w-8 h-8 shrink-0 rounded-lg text-gray-500 hover:bg-gray-100 transition">
                            <i className="fas fa-times" aria-hidden="true"></i>
                        </button>
                    )}
                </div>
                <div className="flex justify-between text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    <span>Your Progress</span>
                    <span className={pct === 100 ? 'text-green-600' : 'text-blue-600'}>{pct}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Course progress">
                    <div className={`h-full rounded-full transition-all duration-700 ${pct === 100 ? 'bg-green-500' : 'bg-blue-600'}`} style={{ width: `${pct}%` }}></div>
                </div>
                <p className="text-xs text-gray-400 mt-2">{progress?.completedLessons?.length || 0} of {course.sections.reduce((n, s) => n + s.lessons.length, 0)} lessons completed</p>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {course.sections.map((section, sIndex) => {
                    const doneInSection = section.lessons.filter(l => progress?.completedLessons?.includes(l._id)).length;
                    return (
                        <div key={sIndex} className="border-b border-gray-100">
                            <div className="px-5 py-3 bg-gray-50 sticky top-0 z-10 flex justify-between items-center gap-2">
                                <span className="text-xs font-bold text-navy-800 uppercase tracking-wider">Section {sIndex + 1}: {section.title}</span>
                                <span className="text-[11px] text-gray-500 font-bold shrink-0">{doneInSection}/{section.lessons.length}</span>
                            </div>
                            <ul>
                                {section.lessons.map((lesson) => {
                                    const isActive = activeLesson && activeLesson._id === lesson._id;
                                    const isCompleted = progress?.completedLessons?.includes(lesson._id);
                                    const meta = lessonMeta(lesson);
                                    return (
                                        <li key={lesson._id}>
                                            <button
                                                onClick={() => onLessonSelect(lesson)}
                                                aria-current={isActive ? 'true' : undefined}
                                                className={`w-full text-left px-5 py-3.5 flex items-start gap-3 transition relative ${isActive ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                                            >
                                                {isActive && <span className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600" aria-hidden="true"></span>}
                                                <span className="mt-0.5 flex-shrink-0">
                                                    {isCompleted ? (
                                                        <span className="w-5 h-5 rounded-full bg-green-500 text-white flex items-center justify-center">
                                                            <i className="fas fa-check text-[10px]" aria-hidden="true"></i>
                                                            <span className="sr-only">Completed:</span>
                                                        </span>
                                                    ) : (
                                                        <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isActive ? 'border-blue-600 text-blue-600' : 'border-gray-300 text-gray-400'}`}>
                                                            <i className={`fas ${TYPE_ICON[lesson.type] || TYPE_ICON.text} text-[8px]`} aria-hidden="true"></i>
                                                        </span>
                                                    )}
                                                </span>
                                                <span className="flex-1 min-w-0">
                                                    <span className={`block text-sm font-semibold leading-snug ${isActive ? 'text-blue-700' : 'text-gray-700'}`}>{lesson.title}</span>
                                                    <span className="block text-[11px] font-medium text-gray-400 mt-0.5 capitalize">
                                                        {lesson.type}{meta ? ` · ${meta}` : ''}
                                                    </span>
                                                </span>
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    );
                })}
            </div>
        </aside>
    );
};

export default PlayerSidebar;
