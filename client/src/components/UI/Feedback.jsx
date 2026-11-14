import React from 'react';

export const Spinner = ({ className = '', label = 'Loading' }) => (
  <div className={`flex flex-col items-center justify-center gap-3 text-gray-500 ${className}`} role="status">
    <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
    <span className="text-sm font-medium">{label}…</span>
  </div>
);

export const PageLoader = ({ label }) => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <Spinner label={label} />
  </div>
);

export const EmptyState = ({ icon = 'fa-folder-open', title, message, action }) => (
  <div className="text-center py-14 px-6">
    <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
      <i className={`fas ${icon} text-2xl`} aria-hidden="true"></i>
    </div>
    {title && <h3 className="text-lg font-bold text-navy-900">{title}</h3>}
    {message && <p className="text-gray-500 mt-1 text-sm max-w-sm mx-auto">{message}</p>}
    {action && <div className="mt-6">{action}</div>}
  </div>
);

/** Skeleton rows for tables while data loads. */
export const TableSkeleton = ({ rows = 5, cols = 4 }) => (
  <>
    {Array.from({ length: rows }).map((_, r) => (
      <tr key={r}>
        {Array.from({ length: cols }).map((_, c) => (
          <td key={c} className="p-5">
            <div className="h-4 bg-gray-100 rounded animate-pulse" style={{ width: `${60 + ((r + c) % 3) * 15}%` }}></div>
          </td>
        ))}
      </tr>
    ))}
  </>
);

export const CardSkeleton = () => (
  <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
    <div className="aspect-video bg-gray-100 animate-pulse"></div>
    <div className="p-5 space-y-3">
      <div className="h-5 bg-gray-100 rounded animate-pulse w-3/4"></div>
      <div className="h-4 bg-gray-100 rounded animate-pulse"></div>
      <div className="h-4 bg-gray-100 rounded animate-pulse w-1/2"></div>
    </div>
  </div>
);
