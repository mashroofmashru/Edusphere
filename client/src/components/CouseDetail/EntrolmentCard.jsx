const EnrollmentCard = ({ onEnrollClick }) => (
    <div className="bg-white p-6 rounded-xl shadow-2xl top-24 border-t-4 border-accent-blue">
        <div className="flex justify-between items-end mb-6">
            <span className="text-3xl font-extrabold text-deep-blue">$129.99</span>
            <span className="text-sm text-gray-500 line-through">$249.99</span>
        </div>

        {/* ENROLL NOW BUTTON */}
        <button 
            onClick={onEnrollClick}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-3 rounded-lg transition duration-300 shadow-md transform hover:scale-[1.01] flex items-center justify-center">
            Enroll Now
        </button>

        <p className="text-center text-xs text-gray-500 mt-3">Start learning immediately. 30-day money-back guarantee.</p>
    </div>
);
export default EnrollmentCard;