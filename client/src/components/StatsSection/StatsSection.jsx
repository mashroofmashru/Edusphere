import React, { useState, useEffect } from 'react';
import api from '../../config/server';

const StatsSection = () => {
  const [stats, setStats] = useState([
    { number: "50,000+", label: "Active Students" },
    { number: "2,500+", label: "Courses Available" },
    { number: "98%", label: "Satisfaction Rate" }
  ]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/users/stats');
        if (data.success) {
          setStats([
            { number: `${data.data.activeStudents}+`, label: "Active Students" },
            { number: `${data.data.coursesAvailable}+`, label: "Courses Available" },
            { number: data.data.satisfactionRate, label: "Satisfaction Rate" }
          ]);
        }
      } catch (error) {
        console.error("Failed to fetch stats", error);
      }
    };
    fetchStats();
  }, []);

  return (
    <section className="py-16 bg-gradient-to-r from-blue-50 to-blue-100">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white p-8 rounded-xl shadow-sm">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {stat.number}
              </div>
              <div className="text-navy-900 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;