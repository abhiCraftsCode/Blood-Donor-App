import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import AuthPortal from "./pages/AuthPortal";
import ProtectedRoute from "./components/ProtectedRoute";
import EmergencyFeed from "./pages/EmergencyFeed";
import DonorProfile from "./pages/DonorProfile"; // Import the fresh controller interface

export default function App() {
  const { user } = useAuth();

  return (
    <Router>
      <Routes>
        <Route
          path="/auth"
          element={user ? <Navigate to="/dashboard" replace /> : <AuthPortal />}
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <EmergencyFeed />
            </ProtectedRoute>
          }
        />

        {/* 🔐 PROFILE SECURITY ENTRY LINK */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <DonorProfile />
            </ProtectedRoute>
          }
        />

        <Route
          path="*"
          element={<Navigate to={user ? "/dashboard" : "/auth"} replace />}
        />
      </Routes>
    </Router>
  );
}
