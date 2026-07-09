import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import AppShell from "./components/layout/AppShell";
import Login from "./pages/Login";
import Register from "./pages/Register";
import EmergencyFeed from "./pages/EmergencyFeed";
import RequesterDashboard from "./pages/RequesterDashboard";
import NewEmergencyRequest from "./pages/NewEmergencyRequest";
import DonorProfile from "./pages/DonorProfile";
import EmergencyDetail from "./pages/EmergencyDetail";

function RequireAuth({ children }) {
  const { status } = useAuth();
  if (status === "checking") {
    return <div className="min-h-screen flex items-center justify-center text-sm text-ink-500">Loading RedLine…</div>;
  }
  if (status === "guest") return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        element={
          <RequireAuth>
            <AppShell />
          </RequireAuth>
        }
      >
        <Route path="/feed" element={<EmergencyFeed />} />
        <Route path="/dashboard" element={<RequesterDashboard />} />
        <Route path="/dashboard/new" element={<NewEmergencyRequest />} />
        <Route path="/profile" element={<DonorProfile />} />
        <Route path="/emergency/:id" element={<EmergencyDetail />} />
      </Route>

      <Route path="*" element={<Navigate to="/feed" replace />} />
    </Routes>
  );
}
