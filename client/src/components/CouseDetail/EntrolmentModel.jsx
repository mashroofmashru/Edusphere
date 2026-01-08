import React from "react";
import { useState } from "react";
const EnrollmentModal = ({ isOpen, onClose }) => {
    const [message, setMessage] = useState('');
    const [messageClass, setMessageClass] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();

        // Simple form validation check
        const formData = new FormData(e.target);
        const name = formData.get('fullName');

        if (!name || !formData.get('email') || !formData.get('terms')) {
            setMessage('Please fill in all required fields.');
            setMessageClass('bg-red-100 text-red-800');
            return;
        }

        setIsLoading(true);
        setMessage('Processing enrollment...');
        setMessageClass('bg-yellow-100 text-yellow-800');

        // Simulate API call delay
        setTimeout(() => {
            setIsLoading(false);
            setMessage(`Thank you, ${name}! Redirecting to payment...`);
            setMessageClass('bg-green-100 text-green-800');

            // Auto-close modal after success
            setTimeout(onClose, 3000);

        }, 2000);
    };

    if (!isOpen) return null;

    // Tailwind classes for the modal structure
    const modalClasses = `fixed inset-0 modal-backdrop flex items-center justify-center p-4 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`;
    const dialogClasses = "bg-white rounded-xl shadow-2xl max-w-lg w-full transform transition-all overflow-hidden scale-100";

    return (
        <div className={modalClasses}>
            <div className={dialogClasses} role="dialog" aria-modal="true" aria-labelledby="modal-title">
                {/* Modal Header */}
                <div className="p-6 bg-blue-700 text-white flex justify-between items-center">
                    <h3 id="modal-title" className="text-xl font-bold">Enroll in Advanced React Development</h3>
                    <button onClick={onClose} className="text-white hover:text-gray-200 transition">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                {/* Modal Body / Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <p className="text-gray-600">Please provide your details to complete your enrollment. Course fee: <span className="font-bold text-deep-blue">₹129.99</span></p>

                    {/* Name Field */}
                    <div>
                        <label htmlFor="full-name" className="block text-sm font-medium text-gray-700 mb-1">Full Name <span className="text-red-500">*</span></label>
                        <input type="text" id="full-name" name="fullName" required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-accent-blue focus:border-accent-blue transition duration-150" placeholder="John Doe" />
                    </div>

                    {/* Email Field */}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address <span className="text-red-500">*</span></label>
                        <input type="email" id="email" name="email" required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-accent-blue focus:border-accent-blue transition duration-150" placeholder="you@example.com" />
                    </div>

                    {/* Phone Field */}
                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                        <input type="tel" id="phone" name="phone"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-accent-blue focus:border-accent-blue transition duration-150" placeholder="(123) 456-7890" />
                    </div>

                    {/* Terms Checkbox */}
                    <div className="flex items-start">
                        <input id="terms" name="terms" type="checkbox" required
                            className="h-4 w-4 text-accent-blue border-gray-300 rounded mt-1" />
                        <label htmlFor="terms" className="ml-3 text-sm text-gray-600">
                            I agree to the <a href="#" className="text-accent-blue hover:underline">Terms and Conditions</a> <span className="text-red-500">*</span>
                        </label>
                    </div>

                    {/* Submit Button */}
                    <button type="submit" disabled={isLoading}
                        className={`bg-green-600 w-full font-semibold py-3 rounded-lg shadow-md transition duration-300 ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-deep-blue hover:bg-text-dark transform hover:scale-[1.005]'
                            } text-white`}>
                        {isLoading ? 'Processing...' : 'Proceed to Payment'}
                    </button>
                    {message && (
                        <div className={`p-3 rounded-lg text-center font-medium ${messageClass}`}>
                            {message}
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default EnrollmentModal;