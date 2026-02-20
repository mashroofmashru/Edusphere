import React from 'react';
import { baseURL } from '../../config/server';

const CourseDetailsModal = ({ course, onClose }) => {
    if (!course) return null;
    return (
        <div className="fixed inset-0 bg-navy-900/50 backdrop-blur-sm z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-fade-in">
                {/* Header */}
                <div className="p-6 border-b flex justify-between items-center bg-white sticky top-0 z-10">
                    <div>
                        <h2 className="text-2xl font-bold text-navy-900">Course Details</h2>
                        <p className="text-sm text-gray-500">Comprehensive view of course information</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition">
                        <i className="fas fa-times text-xl text-gray-500"></i>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 bg-gray-50 space-y-8">
                    {/* Basic Info */}
                    <div className="flex flex-col md:flex-row gap-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="w-full md:w-1/3 aspect-video bg-gray-200 rounded-xl overflow-hidden flex-shrink-0">
                            <img
                                src={course.thumbnail && !course.thumbnail.includes('default') ? `${baseURL}/${course.thumbnail.replace(/\\/g, '/')}` : 'https://via.placeholder.com/640x360?text=No+Thumbnail'}
                                alt={course.title}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="flex-1 space-y-4">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${course.status === 'Published' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                                        {course.status || 'Draft'}
                                    </span>
                                    <span className="px-2 py-1 rounded text-xs font-bold bg-blue-100 text-blue-600">
                                        {course.level || 'Beginner'}
                                    </span>
                                    <span className="px-2 py-1 rounded text-xs font-bold bg-purple-100 text-purple-600">
                                        {course.category}
                                    </span>
                                </div>
                                <h3 className="text-3xl font-extrabold text-navy-900">{course.title}</h3>
                                {course.subtitle && <p className="text-lg text-gray-600 mt-1">{course.subtitle}</p>}
                            </div>

                            <div className="flex flex-wrap gap-6 pt-4 border-t border-gray-100">
                                <div>
                                    <p className="text-sm text-gray-500 font-medium">Price</p>
                                    <p className="text-xl font-bold text-navy-900">₹{course.price}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 font-medium">Enrolled</p>
                                    <p className="text-xl font-bold text-navy-900">{course.enrolledStudents?.length || 0} students</p>
                                </div>
                                {course.instructor && (
                                    <div>
                                        <p className="text-sm text-gray-500 font-medium">Instructor</p>
                                        <p className="text-xl font-bold text-navy-900">{typeof course.instructor === 'object' ? course.instructor.name : 'View ID'}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h4 className="text-lg font-bold text-navy-900 mb-4">Description</h4>
                        <p className="text-gray-700 whitespace-pre-wrap">{course.description || 'No description provided.'}</p>
                    </div>

                    {/* Curriculum Outline */}
                    {course.sections && course.sections.length > 0 && (
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h4 className="text-lg font-bold text-navy-900 mb-4">Curriculum</h4>
                            <div className="space-y-4">
                                {course.sections.map((section, idx) => (
                                    <div key={idx} className="border border-gray-100 rounded-xl overflow-hidden">
                                        <div className="bg-gray-50 p-4 font-bold text-navy-900 flex items-center gap-3">
                                            <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded flex items-center justify-center text-xs">
                                                {idx + 1}
                                            </div>
                                            {section.title}
                                        </div>
                                        <div className="divide-y divide-gray-50 bg-white">
                                            {section.lessons && section.lessons.map((lesson, lIdx) => (
                                                <div key={lIdx} className="p-4 pl-12 flex justify-between items-center text-gray-600 hover:bg-gray-50 transition">
                                                    <div className="flex items-center gap-3">
                                                        <i className={`fas ${lesson.type === 'video' ? 'fa-play-circle text-blue-500' : lesson.type === 'quiz' ? 'fa-question-circle text-purple-500' : 'fa-file-alt text-amber-500'}`}></i>
                                                        <span className="font-medium text-sm">{lesson.title}</span>
                                                    </div>
                                                    {lesson.duration > 0 && (
                                                        <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded">
                                                            {lesson.duration} min
                                                        </span>
                                                    )}
                                                </div>
                                            ))}
                                            {(!section.lessons || section.lessons.length === 0) && (
                                                <div className="p-4 pl-12 text-sm text-gray-400 italic">No lessons in this section.</div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t bg-white flex justify-end">
                    <button onClick={onClose} className="px-6 py-2 bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 rounded-xl transition">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CourseDetailsModal;
