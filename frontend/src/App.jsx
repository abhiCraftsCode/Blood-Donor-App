import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import AuthPortal from "./pages/AuthPortal";
import ProtectedRoute from "./components/ProtectedRoute";

// Temporary testing component placeholders to represent our next core screens
const MockEmergencyFeed = () => {
  const { logout, user } = useAuth();
  return (
    <div className="p-8 space-y-4">
      <h1 className="text-2xl font-black">🔴 Live Donor Emergency Feed</h1>
      <p>
        Welcome, <span className="font-bold">{user?.name}</span>. Your spatial
        PostGIS tracking is active.
      </p>
      <button
        onClick={logout}
        className="px-4 py-2 bg-slate-900 text-white font-bold rounded-xl text-sm"
      >
        Terminate Protocol Session
      </button>
    </div>
  );
};

export default function App() {
  const { user } = useAuth();

  return (
    <Router>
      <Routes>
        {/* Auth Gateway: If already logged in, skip the form and bounce directly to dashboard */}
        <Route
          path="/auth"
          element={user ? <Navigate to="/dashboard" replace /> : <AuthPortal />}
        />

        {/* 🔐 PRIVATE DASHBOARD MATRIX BOUNDARY */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <MockEmergencyFeed />
            </ProtectedRoute>
          }
        />

        {/* Global Fallback Redirect Catch Route */}
        <Route
          path="*"
          element={<Navigate to={user ? "/dashboard" : "/auth"} replace />}
        />
      </Routes>
    </Router>
  );
}
