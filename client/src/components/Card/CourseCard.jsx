import React from 'react';
import { Link } from 'react-router-dom';
import { PLACEHOLDER_IMAGE } from '../../utils/format';

/**
 * Course tile. Renders as a link, so it's keyboard- and middle-click friendly.
 * `footer` lets callers add extra content (e.g. a progress bar) under the meta row.
 */
const CourseCard = ({
  id,
  title,
  description,
  rating,
  duration,
  price,
  badge,
  bgImage,
  to,
  footer,
}) => {
  const hasRating = rating && rating !== 'New';

  return (
    <Link
      to={to || `/course/${id}`}
      className="group bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-lg hover:-translate-y-0.5 transition flex flex-col h-full"
    >
      <div className="aspect-video relative bg-gray-100 overflow-hidden">
        <img
          src={bgImage || PLACEHOLDER_IMAGE}
          alt=""
          loading="lazy"
          onError={(e) => { e.currentTarget.src = PLACEHOLDER_IMAGE; }}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
        />
        {badge && (
          <span className="absolute top-3 left-3 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow">
            {badge}
          </span>
        )}
      </div>
      <div className="p-5 flex flex-col flex-1">
        <div className="flex justify-between items-start gap-3 mb-2">
          <h3 className="text-lg font-bold text-navy-900 line-clamp-2 group-hover:text-blue-700 transition">{title}</h3>
          <span className={`shrink-0 text-sm font-bold flex items-center gap-1 ${hasRating ? 'text-amber-500' : 'text-gray-400'}`}>
            <i className="fas fa-star" aria-hidden="true"></i>
            <span>{hasRating ? rating : 'New'}</span>
          </span>
        </div>
        {description && <p className="text-gray-600 text-sm mb-4 line-clamp-2">{description}</p>}
        <div className="mt-auto flex justify-between items-center text-sm">
          <span className="flex items-center text-gray-500">
            <i className="far fa-clock mr-1.5" aria-hidden="true"></i>
            {duration}
          </span>
          <span className={`font-bold ${price === 'Free' ? 'text-green-600' : 'text-blue-600'}`}>{price}</span>
        </div>
        {footer}
      </div>
    </Link>
  );
};

export default CourseCard;
