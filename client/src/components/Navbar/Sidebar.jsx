import React from 'react'
import { useAuth } from '../../context/AuthContext'
import { Link } from 'react-router-dom'

const Sidebar = () => {
  const { logout } = useAuth()

  return (
    <aside className="w-64 bg-navy-900 text-white hidden lg:flex lg:flex-col min-h-screen">
      <div className="p-6 flex flex-col h-full">
        <div className="flex items-center mb-8">
          <i className="fas fa-graduation-cap text-2xl text-blue-400 mr-2"></i>
          <span className="text-xl font-bold">EduVerse</span>
        </div>
        <nav className="space-y-4 flex-1">
          <Link to="/instructor" className="flex items-center p-3 bg-blue-600 rounded-lg text-white hover:bg-blue-700 transition">
            <i className="fas fa-home mr-3"></i> Dashboard
          </Link>
          <Link to="/instructor/courses" className="flex items-center p-3 hover:bg-gray-800 rounded-lg transition text-gray-300 hover:text-white">
            <i className="fas fa-play-circle mr-3"></i> My Courses
          </Link>
          <Link to="/instructor/students" className="flex items-center p-3 hover:bg-gray-800 rounded-lg transition text-gray-300 hover:text-white">
            <i className="fas fa-users mr-3"></i> Students
          </Link>
          <Link to="/instructor/reviews" className="flex items-center p-3 hover:bg-gray-800 rounded-lg transition text-gray-300 hover:text-white">
            <i className="fas fa-star mr-3"></i> Reviews
          </Link>
          <Link to="/profile" className="flex items-center p-3 hover:bg-gray-800 rounded-lg transition text-gray-300 hover:text-white">
            <i className="fas fa-user mr-3"></i> Profile
          </Link>
        </nav>

        <button
          onClick={logout}
          className="flex items-center p-3 hover:bg-red-600 bg-gray-800 rounded-lg transition w-full mt-auto text-left text-gray-300 hover:text-white"
        >
          <i className="fas fa-sign-out-alt mr-3"></i> Logout
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
