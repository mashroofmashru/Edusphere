import { baseURL } from '../config/server';

const placeholderSvg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 640 360'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='#0f172a'/><stop offset='1' stop-color='#1e40af'/></linearGradient></defs><rect width='640' height='360' fill='url(#g)'/><text x='320' y='212' font-size='96' text-anchor='middle'>🎓</text></svg>`;

/** Local placeholder shown when a course has no thumbnail. */
export const PLACEHOLDER_IMAGE = `data:image/svg+xml,${encodeURIComponent(placeholderSvg)}`;

/** Resolve any stored thumbnail value (Cloudinary URL, relative upload path, or empty) to a usable src. */
export const courseThumb = (thumbnail) => {
  if (!thumbnail || thumbnail.includes('default')) return PLACEHOLDER_IMAGE;
  const path = thumbnail.replace(/\\/g, '/');
  if (/^(https?:|data:|blob:)/.test(path)) return path;
  return `${baseURL || ''}/${path.replace(/^\//, '')}`;
};

export const formatPrice = (price) => {
  const value = Number(price);
  return value > 0 ? `₹${value.toLocaleString('en-IN')}` : 'Free';
};

/** Returns "4.5" style string, or null when the course has no rating yet. */
export const formatRating = (rating) => {
  const value = Number(rating);
  return value > 0 ? value.toFixed(1) : null;
};

/** Duration is stored in minutes. */
export const formatDuration = (minutes) => {
  const total = Math.round(Number(minutes) || 0);
  if (total <= 0) return 'Self-paced';
  if (total < 60) return `${total} min`;
  const h = Math.floor(total / 60);
  const m = total % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
};

export const initialOf = (name, fallback = 'U') =>
  name ? name.trim().charAt(0).toUpperCase() : fallback;

/** Where each role lands after signing in. */
export const homeForRole = (role) =>
  role === 'admin' ? '/admin' : role === 'instructor' ? '/instructor' : '/';

/** Map an API course object to CourseCard props. */
export const toCardProps = (course) => ({
  id: course._id,
  title: course.title,
  description: course.subtitle || course.description,
  rating: formatRating(course.rating) || 'New',
  duration: formatDuration(course.totalDuration),
  price: formatPrice(course.price),
  badge: course.level,
  bgImage: courseThumb(course.thumbnail),
});

/** Sidebar link styling shared by the instructor and admin layouts. */
export const navItemClass = (active) =>
  `flex items-center w-full text-left p-3 rounded-lg transition ${active
    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50'
    : 'text-gray-300 hover:bg-navy-800 hover:text-white'
  }`;
