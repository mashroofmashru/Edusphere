import React from 'react';

const StatsSection = () => {
  const stats = [
    { number: "50,000+", label: "Active Students" },
    { number: "2,500+", label: "Courses Available" },
    { number: "98%", label: "Satisfaction Rate" }
  ];

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