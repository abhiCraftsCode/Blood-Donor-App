import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  // 1. Initial Loading State Shield
  // Prevents flash-redirection quirks while the browser re-hydrates local storage sessions
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center space-y-3">
          {/* Smooth custom CSS-less spinner block */}
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-red-600 mx-auto"></div>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
            Verifying Protocol...
          </p>
        </div>
      </div>
    );
  }

  // 2. Unauthenticated Traffic Guard
  // If no persistent session context exists, route them securely back to the auth portal
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // 3. Authorization Cleared
  // Pass through seamlessly to render the intended dashboard or map component views
  return children;
}
