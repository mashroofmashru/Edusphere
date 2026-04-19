import React, { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Link } from 'react-router-dom'

const AdminSidebar = ({ activeSection, setActiveSection }) => {
    const { logout } = useAuth()
    const [mobileOpen, setMobileOpen] = useState(false)

    const handleNavClick = (section) => {
        setActiveSection(section);
        setMobileOpen(false);
    };

    return (
        <>
            {/* Mobile Toggle */}
            <button
                className="lg:hidden fixed bottom-6 right-6 z-50 w-14 h-14 bg-navy-900 text-white rounded-full shadow-2xl flex items-center justify-center text-2xl hover:bg-navy-800 transition"
                onClick={() => setMobileOpen(!mobileOpen)}
            >
                <i className={`fas ${mobileOpen ? 'fa-times' : 'fa-bars'}`}></i>
            </button>


            {mobileOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden transition-opacity"
                    onClick={() => setMobileOpen(false)}
                ></div>
            )}

            <aside className={`w-64 bg-navy-900 text-white flex-col min-h-screen fixed lg:static top-0 left-0 h-full z-40 transform transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} flex overflow-y-auto`}>
                <div className="p-6 flex flex-col h-full">
                    <div className="flex items-center mb-8 pt-4 lg:pt-0">
                        <i className="fas fa-user-shield text-2xl text-blue-400 mr-2"></i>
                        <span className="text-xl font-bold">Admin Panel</span>
                    </div>
                    <nav className="space-y-2 lg:space-y-4 flex-1">
                        <button
                            onClick={() => handleNavClick('dashboard')}
                            className={`flex items-center p-3 w-full text-left rounded-lg transition ${activeSection === 'dashboard' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800'}`}
                        >
                            <i className="fas fa-home w-6 text-center mr-2"></i> Dashboard
                        </button>
                        <button
                            onClick={() => handleNavClick('courses')}
                            className={`flex items-center p-3 w-full text-left rounded-lg transition ${activeSection === 'courses' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800'}`}
                        >
                            <i className="fas fa-book w-6 text-center mr-2"></i> Manage Courses
                        </button>
                        <button
                            onClick={() => handleNavClick('users')}
                            className={`flex items-center p-3 w-full text-left rounded-lg transition ${activeSection === 'users' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800'}`}
                        >
                            <i className="fas fa-users w-6 text-center mr-2"></i> Manage Users
                        </button>
                        <button
                            onClick={() => handleNavClick('categories')}
                            className={`flex items-center p-3 w-full text-left rounded-lg transition ${activeSection === 'categories' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800'}`}
                        >
                            <i className="fas fa-tags w-6 text-center mr-2"></i> Categories
                        </button>
                        <button
                            onClick={() => handleNavClick('enrollments')}
                            className={`flex items-center p-3 w-full text-left rounded-lg transition ${activeSection === 'enrollments' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800'}`}
                        >
                            <i className="fas fa-list-alt w-6 text-center mr-2"></i> Enrollments
                        </button>
                        <button
                            onClick={() => handleNavClick('messages')}
                            className={`flex items-center p-3 w-full text-left rounded-lg transition ${activeSection === 'messages' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800'}`}
                        >
                            <i className="fas fa-envelope w-6 text-center mr-2"></i> Messages
                        </button>
                        <button
                            onClick={() => handleNavClick('instructors')}
                            className={`flex items-center p-3 w-full text-left rounded-lg transition ${activeSection === 'instructors' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800'}`}
                        >
                            <i className="fas fa-chalkboard-teacher w-6 text-center mr-2"></i> Instructor Requests
                        </button>
                    </nav>

                    <div className="mt-auto pt-6 border-t border-gray-700">
                        <div className="flex items-center gap-3 mb-6 px-2">
                            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold shrink-0">
                                AD
                            </div>
                            <div className="overflow-hidden">
                                <h4 className="text-sm font-bold truncate">Admin User</h4>
                                <p className="text-xs text-gray-400 truncate">Administrator</p>
                            </div>
                        </div>
                        <button
                            onClick={logout}
                            className="flex items-center p-3 hover:bg-red-600 bg-gray-800 rounded-lg transition w-full text-left text-gray-300 hover:text-white"
                        >
                            <i className="fas fa-sign-out-alt w-6 text-center mr-2"></i> Logout
                        </button>
                    </div>
                </div>
            </aside>
        </>
    )
}

export default AdminSidebar
