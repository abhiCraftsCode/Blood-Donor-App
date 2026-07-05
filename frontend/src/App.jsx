//base line app ready test it and make amends.
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
import DonorProfile from "./pages/DonorProfile";
import RequesterDashboard from "./pages/RequesterDashboard";
import FulfillmentScanner from "./pages/FulfillmentScanner"; // Import the fresh verification engine

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

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <DonorProfile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/requester"
          element={
            <ProtectedRoute>
              <RequesterDashboard />
            </ProtectedRoute>
          }
        />

        {/* 🔐 PRIVATE DONOR SCAN ENGINE ENTRY */}
        <Route
          path="/verify-scan"
          element={
            <ProtectedRoute>
              <FulfillmentScanner />
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
