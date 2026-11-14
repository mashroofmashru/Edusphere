import React from 'react';

const InstructorCard = ({ instructor }) => {
    if (!instructor) return null;

    return (
        <div>
            <h2 className="text-lg font-bold text-gray-900 mb-3">Your instructor</h2>
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center text-lg font-semibold shrink-0">
                    {instructor.name ? instructor.name.charAt(0).toUpperCase() : 'I'}
                </div>
                <div className="min-w-0">
                    <p className="font-semibold text-gray-900">{instructor.name || 'Instructor'}</p>
                    {instructor.headline && <p className="text-sm text-gray-500">{instructor.headline}</p>}
                </div>
            </div>
            {instructor.bio && <p className="mt-3 text-sm text-gray-700 leading-relaxed">{instructor.bio}</p>}

            {(instructor.website || instructor.linkedin) && (
                <div className="mt-3 flex gap-4 text-sm">
                    {instructor.website && (
                        <a href={instructor.website} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600 hover:underline">
                            Website
                        </a>
                    )}
                    {instructor.linkedin && (
                        <a href={instructor.linkedin} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600 hover:underline">
                            LinkedIn
                        </a>
                    )}
                </div>
            )}
        </div>
    );
};

export default InstructorCard;
