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
  const meta = [badge, duration].filter(Boolean).join(' · ');

  return (
    <Link to={to || `/course/${id}`} className="group flex flex-col h-full">
      <div className="aspect-video rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
        <img
          src={bgImage || PLACEHOLDER_IMAGE}
          alt=""
          loading="lazy"
          onError={(e) => { e.currentTarget.src = PLACEHOLDER_IMAGE; }}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="pt-3 flex flex-col flex-1">
        <h3 className="font-semibold text-gray-900 leading-snug line-clamp-2 group-hover:text-blue-600">{title}</h3>
        {description && <p className="mt-1 text-sm text-gray-500 line-clamp-2">{description}</p>}
        <div className="mt-auto pt-2 flex items-center justify-between gap-3 text-sm">
          <span className="text-gray-500 truncate">
            {hasRating ? (
              <><i className="fas fa-star text-amber-400 text-xs mr-1" aria-hidden="true"></i><span className="font-medium text-gray-700">{rating}</span></>
            ) : (
              <span>New</span>
            )}
            {meta && <span> · {meta}</span>}
          </span>
          <span className={`shrink-0 font-semibold ${price === 'Free' ? 'text-green-700' : 'text-gray-900'}`}>{price}</span>
        </div>
        {footer}
      </div>
    </Link>
  );
};

export default CourseCard;
