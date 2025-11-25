const InstructorCard = () => (
    <div className="bg-white p-6 rounded-xl shadow-lg">
        <h3 className="text-xl font-bold text-text-dark mb-4 border-b pb-3 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2 text-deep-blue" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            Instructor
        </h3>
        <div className="flex items-center space-x-4">
            <img 
                src="https://placehold.co/80x80/000000/ffffff?text=EV" 
                alt="Instructor Profile" 
                className="w-16 h-16 rounded-full object-cover border-2 border-accent-blue"
            />
            <div>
                <p className="font-bold text-lg text-text-dark">Dr. Elias Vance</p>
                <p className="text-sm text-gray-500">Principal Software Architect</p>
            </div>
        </div>
        <p className="text-sm text-gray-600 mt-4">
            Dr. Vance has over 15 years of industry experience building high-scale applications and is a recognized author on software architecture.
        </p>
    </div>
);

export default InstructorCard;