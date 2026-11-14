import { Link, Navigate } from "react-router-dom";
import AuthContainer from "../../components/Auth/AuthContainer";
import { useAuth } from "../../context/AuthContext";
import { homeForRole } from "../../utils/format";

function Loginsignup() {
  const { isAuthenticated, user } = useAuth();

  // Already signed in: don't show the login form again
  if (isAuthenticated) return <Navigate to={homeForRole(user.role)} replace />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 flex flex-col items-center justify-center px-4 py-8">
      <Link
        to="/"
        className="self-start sm:absolute sm:top-6 sm:left-6 mb-4 sm:mb-0 inline-flex items-center gap-2 text-blue-100 hover:text-white font-medium transition"
      >
        <i className="fas fa-arrow-left" aria-hidden="true"></i> Back to home
      </Link>
      <AuthContainer />
    </div>
  );
}

export default Loginsignup;
