// components/CourseCard.js
import React from 'react';

const CourseCard = ({ 
  title, 
  description, 
  rating, 
  duration, 
  price, 
  badge, 
  gradientFrom, 
  gradientTo 
}) => {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition">
      <div 
        className="h-48 relative"
        style={{ 
          background: `linear-gradient(to right, ${gradientFrom}, ${gradientTo})` 
        }}
      >
        {badge && (
          <div className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
            {badge}
          </div>
        )}
      </div>
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold text-navy-900">{title}</h3>
          <span className="text-yellow-500">
            <i className="fas fa-star"></i> {rating}
          </span>
        </div>
        <p className="text-gray-600 mb-4">{description}</p>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center text-gray-500">
            <i className="far fa-clock mr-1"></i>
            <span>{duration}</span>
          </div>
          <div className="text-blue-600 font-bold">{price}</div>
        </div>
        <button className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition">
          Enroll Now
        </button>
      </div>
    </div>
  );
};

export default CourseCard;