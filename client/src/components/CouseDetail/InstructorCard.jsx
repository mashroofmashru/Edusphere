import React from 'react';

const InstructorCard = ({ instructor }) => {
    if (!instructor) return null;

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <h3 className="text-xl font-bold text-navy-900 mb-4 border-b border-gray-100 pb-3 flex items-center">
                <i className="fas fa-chalkboard-teacher mr-2 text-blue-600"></i>
                Instructor
            </h3>
            <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-full bg-navy-100 text-navy-600 flex items-center justify-center text-2xl font-bold border-2 border-white shadow-sm">
                    {instructor.name ? instructor.name.charAt(0).toUpperCase() : 'I'}
                </div>
                <div>
                    <p className="font-bold text-lg text-navy-900">{instructor.name || 'Instructor'}</p>
                    <p className="text-sm text-gray-500">{instructor.headline || 'Course Instructor'}</p>
                </div>
            </div>
            <p className="text-sm text-gray-600 mt-4 leading-relaxed">
                {instructor.bio || "No biography available for this instructor."}
            </p>

            {(instructor.website || instructor.linkedin) && (
                <div className="mt-4 pt-4 border-t border-gray-100 flex gap-4">
                    {instructor.website && (
                        <a href={instructor.website} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-600 transition">
                            <i className="fas fa-globe"></i> Website
                        </a>
                    )}
                    {instructor.linkedin && (
                        <a href={instructor.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-700 transition">
                            <i className="fab fa-linkedin"></i> LinkedIn
                        </a>
                    )}
                </div>
            )}
        </div>
    );
};

export default InstructorCard;