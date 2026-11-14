import React from 'react';
import Modal, { ModalHeader } from '../UI/Modal';
import { courseThumb, formatPrice, formatDuration } from '../../utils/format';

const STATUS = {
    Published: 'bg-green-100 text-green-700',
    Draft: 'bg-amber-100 text-amber-700',
    Archived: 'bg-gray-100 text-gray-600',
};

const LESSON_ICON = {
    video: 'fa-play-circle text-blue-500',
    quiz: 'fa-question-circle text-purple-500',
    text: 'fa-file-alt text-amber-500',
};

const CourseDetailsModal = ({ course, onClose }) => {
    if (!course) return null;
    const lessonCount = (course.sections || []).reduce((n, s) => n + (s.lessons?.length || 0), 0);

    return (
        <Modal onClose={onClose} maxWidth="max-w-4xl" label="Course details">
            <div className="p-5 sm:p-6 pb-0">
                <ModalHeader title="Course Details" subtitle="Comprehensive view of course information" onClose={onClose} />
            </div>

            <div className="px-5 sm:px-8 pb-6 space-y-6">
                <div className="flex flex-col md:flex-row gap-6 bg-white p-5 rounded-2xl border border-gray-100">
                    <div className="w-full md:w-1/3 aspect-video bg-gray-200 rounded-xl overflow-hidden flex-shrink-0">
                        <img src={courseThumb(course.thumbnail)} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-4">
                        <div>
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                                <span className={`px-2 py-1 rounded text-xs font-bold ${STATUS[course.status] || STATUS.Draft}`}>{course.status || 'Draft'}</span>
                                <span className="px-2 py-1 rounded text-xs font-bold bg-blue-100 text-blue-700">{course.level || 'Beginner'}</span>
                                {course.category && <span className="px-2 py-1 rounded text-xs font-bold bg-purple-100 text-purple-700">{course.category}</span>}
                            </div>
                            <h3 className="text-2xl sm:text-3xl font-extrabold text-navy-900 break-words">{course.title}</h3>
                            {course.subtitle && <p className="text-base sm:text-lg text-gray-600 mt-1">{course.subtitle}</p>}
                        </div>

                        <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-gray-100">
                            <div>
                                <dt className="text-sm text-gray-500 font-medium">Price</dt>
                                <dd className="text-lg font-bold text-navy-900">{formatPrice(course.price)}</dd>
                            </div>
                            <div>
                                <dt className="text-sm text-gray-500 font-medium">Enrolled</dt>
                                <dd className="text-lg font-bold text-navy-900">{course.enrolledStudents?.length || 0}</dd>
                            </div>
                            <div>
                                <dt className="text-sm text-gray-500 font-medium">Lessons</dt>
                                <dd className="text-lg font-bold text-navy-900">{lessonCount}</dd>
                            </div>
                            {course.instructor && typeof course.instructor === 'object' && (
                                <div className="min-w-0">
                                    <dt className="text-sm text-gray-500 font-medium">Instructor</dt>
                                    <dd className="text-lg font-bold text-navy-900 truncate">{course.instructor.name}</dd>
                                </div>
                            )}
                        </dl>
                    </div>
                </div>

                <section className="bg-white p-5 rounded-2xl border border-gray-100">
                    <h4 className="text-lg font-bold text-navy-900 mb-3">Description</h4>
                    <p className="text-gray-700 whitespace-pre-wrap">{course.description || 'No description provided.'}</p>
                </section>

                <section className="bg-white p-5 rounded-2xl border border-gray-100">
                    <h4 className="text-lg font-bold text-navy-900 mb-4">Curriculum</h4>
                    {course.sections?.length ? (
                        <div className="space-y-4">
                            {course.sections.map((section, idx) => (
                                <div key={idx} className="border border-gray-100 rounded-xl overflow-hidden">
                                    <div className="bg-gray-50 p-4 font-bold text-navy-900 flex items-center gap-3">
                                        <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded flex items-center justify-center text-xs shrink-0">{idx + 1}</span>
                                        <span className="flex-1 min-w-0 truncate">{section.title}</span>
                                        <span className="text-xs font-medium text-gray-500">{section.lessons?.length || 0} lessons</span>
                                    </div>
                                    <ul className="divide-y divide-gray-50 bg-white">
                                        {section.lessons?.map((lesson, lIdx) => (
                                            <li key={lIdx} className="p-3 sm:p-4 sm:pl-12 flex justify-between items-center gap-3 text-gray-600">
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <i className={`fas ${LESSON_ICON[lesson.type] || LESSON_ICON.text}`} aria-hidden="true"></i>
                                                    <span className="font-medium text-sm truncate">{lesson.title}</span>
                                                    {lesson.isFreePreview && <span className="text-[10px] font-bold uppercase text-green-700 bg-green-50 px-1.5 py-0.5 rounded">Preview</span>}
                                                </div>
                                                <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded shrink-0">
                                                    {lesson.type === 'quiz' ? `${lesson.questions?.length || 0} Qs` : lesson.duration > 0 ? formatDuration(lesson.duration) : lesson.type}
                                                </span>
                                            </li>
                                        ))}
                                        {!section.lessons?.length && <li className="p-4 sm:pl-12 text-sm text-gray-400 italic">No lessons in this section.</li>}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-400 italic">No curriculum added yet.</p>
                    )}
                </section>
            </div>

            <div className="p-4 sm:p-6 border-t bg-white flex justify-end sticky bottom-0">
                <button onClick={onClose} className="px-6 py-2 bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 rounded-xl transition">Close</button>
            </div>
        </Modal>
    );
};

export default CourseDetailsModal;
