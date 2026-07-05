import { createContext, useContext, useState, useEffect } from "react";
import API from "../api/client";
import { donorService } from "../api/donorService";

const AuthContext = createContext(null);
//a wrapper for global states to be accessed across all level of components.
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [geoError, setGeoError] = useState(null);

  // Check for an existing session on app mount
  useEffect(() => {
    const initializeAuth = async () => {
      const storedUser = localStorage.getItem("redline_user");
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);

          // Trigger the automatic background location handshake for persistent sessions
          syncUserLocation(parsedUser.user_id);
        } catch (err) {
          console.error("Failed to parse stored authentication session:", err);
          localStorage.removeItem("redline_user");
        }
      }
      setLoading(false);
    };
    initializeAuth();
  }, []);

  /**
   * THE GEOLOCATION HANDSHAKE (Blueprint Section 2-A)
   * Captures the physical device coordinates and ships them silently to the PostGIS backend.
   */
  const syncUserLocation = (userId) => {
    if (!navigator.geolocation) {
      setGeoError("Geolocation is not supported by this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          console.log(
            `📡 Syncing live coordinates to PostGIS: Lat ${latitude}, Lng ${longitude}`,
          );
          await donorService.syncLocation(userId, latitude, longitude);
          setGeoError(null);
        } catch (error) {
          console.error(
            "Failed to synchronize coordinates with database spatial index:",
            error,
          );
        }
      },
      (error) => {
        console.warn("Geolocation sensor lookup rejected:", error.message);
        setGeoError(error.message);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  };

  /**
   * Session Login Pipeline
   */
  const login = async (email, password) => {
    try {
      const response = await API.post("/auth/login", { email, password });
      const userData = response.data.user; // Adjust based on your explicit login controller structure

      setUser(userData);
      localStorage.setItem("redline_user", JSON.stringify(userData));

      // Kick off the automatic location handshake immediately upon successful authentication
      syncUserLocation(userData.user_id);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.error || "Authentication handshake failed.",
      };
    }
  };

  /**
   * Session Registration Pipeline
   */
  const register = async (signUpData) => {
    try {
      // Expects payload fields: { name, email, password, phone, blood_group }
      const response = await API.post("/auth/register", { ...signUpData });
      const userData = response.data.user;

      setUser(userData);
      localStorage.setItem("redline_user", JSON.stringify(userData));

      // Sync fresh profile location instantly on sign-up complete
      syncUserLocation(userData.user_id);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.error || "Registration processing failed.",
      };
    }
  };

  /**
   * Session Terminate Pipeline
   */
  const logout = () => {
    localStorage.removeItem("redline_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        geoError,
        login,
        register,
        logout,
        syncLocation: () => syncUserLocation(user?.user_id),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Reusable custom hook for clean functional bindings inside custom components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error(
      "useAuth must be executed exclusively within an explicit AuthProvider boundary wrapper.",
    );
  }
  return context;
};
