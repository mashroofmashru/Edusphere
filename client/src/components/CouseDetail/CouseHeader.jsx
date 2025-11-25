const CourseHeader = () => (
    <section className="bg-white p-6 sm:p-8 rounded-xl shadow-lg border-t-4 border-accent-blue">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-deep-blue mb-3">
            Advanced Full-Stack React Development
        </h1>
        <p className="text-xl text-gray-700 mb-6">
            Build and deploy scalable, enterprise-level applications using React, Node.js, and modern databases. Master advanced hooks and state management.
        </p>
        
        {/* Key Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-t pt-4">
            {[{ label: 'Duration', value: '80 Hours', icon: (<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-accent-blue" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>)},
              { label: 'Rating', value: '4.9 / 5.0', icon: (<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-accent-blue" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l-2 5h-5l4 3.5-2 5 5-3.5 5 3.5-2-5 4-3.5h-5z"/></svg>)},
              { label: 'Projects', value: '4 Major Projects', icon: (<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-accent-blue" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>)},
              { label: 'Level', value: 'Advanced', icon: (<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-accent-blue" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20m0-20L8 6m4-4L16 6"/></svg>)}
            ].map((stat, index) => (
                <div key={index} className="flex items-center space-x-2 text-sm">
                    {stat.icon}
                    <div><div className="text-gray-500">{stat.label}</div><div className="font-semibold text-text-dark">{stat.value}</div></div>
                </div>
            ))}
        </div>
    </section>
);

export default CourseHeader;