const Curriculum = () => (
    <section className="bg-white p-6 sm:p-8 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-text-dark mb-6 border-b pb-3">Course Curriculum</h2>
        <ul className="space-y-4">
            {[{ title: 'Module 1: Deep Dive into React Hooks & Context', description: 'Master custom hooks, useMemo, useCallback, and advanced state patterns.' },
              { title: 'Module 2: Building Robust RESTful APIs with Node.js', description: 'Set up an Express server, middleware, and secure routing.' },
              { title: 'Module 3: Database Integration and ORMs (MongoDB/Mongoose)', description: 'Perform CRUD operations and implement data validation.' },
              { title: 'Module 4: Authentication & Security (JWT)', description: 'Implement secure user registration, login, and token-based access control.' }
            ].map((module, index) => (
                <li key={index} className="p-4 bg-subtle-gray rounded-lg flex items-start space-x-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                    <div>
                        <p className="font-semibold text-gray-800">{module.title}</p>
                        <p className="text-sm text-gray-500">{module.description}</p>
                    </div>
                </li>
            ))}
        </ul>
    </section>
);

export default Curriculum;