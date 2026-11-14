import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("Caught by ErrorBoundary:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 max-w-md w-full text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-red-50 text-red-500 flex items-center justify-center text-2xl mb-4">
              <i className="fas fa-exclamation-triangle" aria-hidden="true"></i>
            </div>
            <h1 className="text-2xl font-bold text-navy-900">Something went wrong</h1>
            <p className="text-gray-500 mt-2">An unexpected error occurred. Please reload the page and try again.</p>
            <div className="mt-6 flex gap-3 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="px-5 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition"
              >
                Reload Page
              </button>
              <a href="/" className="px-5 py-2.5 border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition">
                Go Home
              </a>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
