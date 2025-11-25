import React from 'react';
import { useNavigate } from 'react-router-dom';

const CourseCard = ({
  title,
  description,
  rating,
  duration,
  price,
  badge,
  bgImage
}) => {
  const navigate = useNavigate();
  const goToCourses = () => {
    navigate('/courseDetail');
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition"
      onClick={goToCourses}>
      <div
        className="h-48 relative"
        style={{
          background: `url(${bgImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat"
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
      </div>
    </div>
  );
};

export default CourseCard;