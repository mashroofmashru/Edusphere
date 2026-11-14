import { Link, Navigate } from "react-router-dom";
import AuthContainer from "../../components/Auth/AuthContainer";
import { useAuth } from "../../context/AuthContext";
import { homeForRole } from "../../utils/format";

function Loginsignup() {
  const { isAuthenticated, user } = useAuth();

  // Already signed in: don't show the login form again
  if (isAuthenticated) return <Navigate to={homeForRole(user.role)} replace />;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="border-b border-gray-200">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center text-gray-900" aria-label="EduSphere home">
            <i className="fas fa-graduation-cap text-xl text-blue-600 mr-2" aria-hidden="true"></i>
            <span className="text-lg font-bold">EduSphere</span>
          </Link>
          <Link to="/viewCourses" className="text-sm font-medium text-gray-600 hover:text-gray-900">
            Browse courses
          </Link>
        </div>
      </header>

      <main className="flex flex-1 justify-center px-4 py-12 sm:py-20">
        <AuthContainer />
      </main>

      <footer className="py-6 text-center text-xs text-gray-500">
        Need help?{" "}
        <Link to="/about#contact" className="font-medium text-gray-700 hover:text-gray-900 hover:underline">
          Contact support
        </Link>
      </footer>
    </div>
  );
}

export default Loginsignup;
