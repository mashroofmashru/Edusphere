import React, { useState, useEffect } from 'react';
import api from '../../config/server';

const LABELS = ['Learners', 'Courses', 'Satisfaction'];

const StatsSection = () => {
  // null = still loading; never flash made-up numbers before the real ones arrive
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/users/stats')
      .then(({ data }) => {
        if (!data.success) return;
        setStats([
          `${Number(data.data.activeStudents || 0).toLocaleString('en-IN')}+`,
          `${Number(data.data.coursesAvailable || 0).toLocaleString('en-IN')}+`,
          data.data.satisfactionRate || '—',
        ]);
      })
      .catch((error) => {
        console.error('Failed to fetch stats', error);
        setStats(['—', '—', '—']);
      });
  }, []);

  return (
    <section className="py-16 bg-gradient-to-r from-blue-50 to-blue-100" aria-label="Platform statistics">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 text-center">
          {LABELS.map((label, index) => (
            <div key={label} className="bg-white p-8 rounded-xl shadow-sm">
              <div className="text-4xl font-bold text-blue-600 mb-2 h-10 flex items-center justify-center">
                {stats ? stats[index] : <span className="block w-24 h-8 bg-blue-50 rounded animate-pulse"></span>}
              </div>
              <div className="text-navy-900 font-medium">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
