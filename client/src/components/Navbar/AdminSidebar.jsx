import React from 'react'
import { useAuth } from '../../context/AuthContext'
import { Link } from 'react-router-dom'

const AdminSidebar = ({ activeSection, setActiveSection }) => {
    const { logout } = useAuth()

    return (
        <aside className="w-64 bg-navy-900 text-white hidden lg:flex lg:flex-col min-h-screen">
            <div className="p-6 flex flex-col h-full">
                <div className="flex items-center mb-8">
                    <i className="fas fa-user-shield text-2xl text-blue-400 mr-2"></i>
                    <span className="text-xl font-bold">Admin Panel</span>
                </div>
                <nav className="space-y-4 flex-1">
                    <button
                        onClick={() => setActiveSection('dashboard')}
                        className={`flex items-center p-3 w-full text-left rounded-lg transition ${activeSection === 'dashboard' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800'}`}
                    >
                        <i className="fas fa-home mr-3"></i> Dashboard
                    </button>
                    <button
                        onClick={() => setActiveSection('courses')}
                        className={`flex items-center p-3 w-full text-left rounded-lg transition ${activeSection === 'courses' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800'}`}
                    >
                        <i className="fas fa-book mr-3"></i> Manage Courses
                    </button>
                    <button
                        onClick={() => setActiveSection('users')}
                        className={`flex items-center p-3 w-full text-left rounded-lg transition ${activeSection === 'users' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800'}`}
                    >
                        <i className="fas fa-users mr-3"></i> Manage Users
                    </button>
                    <button
                        onClick={() => setActiveSection('categories')}
                        className={`flex items-center p-3 w-full text-left rounded-lg transition ${activeSection === 'categories' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800'}`}
                    >
                        <i className="fas fa-tags mr-3"></i> Categories
                    </button>
                    <button
                        onClick={() => setActiveSection('enrollments')}
                        className={`flex items-center p-3 w-full text-left rounded-lg transition ${activeSection === 'enrollments' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800'}`}
                    >
                        <i className="fas fa-list-alt mr-3"></i> Enrollments
                    </button>
                </nav>

                <div className="mt-auto pt-6 border-t border-gray-700">
                    <div className="flex items-center gap-3 mb-6 px-2">
                        <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                            AD
                        </div>
                        <div>
                            <h4 className="text-sm font-bold">Admin User</h4>
                            <p className="text-xs text-gray-400">Administrator</p>
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="flex items-center p-3 hover:bg-red-600 bg-gray-800 rounded-lg transition w-full text-left text-gray-300 hover:text-white"
                    >
                        <i className="fas fa-sign-out-alt mr-3"></i> Logout
                    </button>
                </div>
            </div>
        </aside>
    )
}

export default AdminSidebar
