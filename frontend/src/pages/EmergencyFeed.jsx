import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { donorService } from "../api/donorService";

export default function EmergencyFeed() {
  const { user, logout } = useAuth();
  const [requests, setRequests] = useState([]);
  const [radius, setRadius] = useState(10); // Default search radius set to 10 km
  const [isAvailable, setIsAvailable] = useState(user?.is_available || false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 1. Fetch Surrounding Emergencies from PostGIS Controller
  const fetchNearbyEmergencies = useCallback(async () => {
    if (!navigator.geolocation) {
      setError("Geolocation sensor is unavailable on this browser framework.");
      return;
    }

    setLoading(true);
    setError("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // Packs search parameters inside the body object payload for req.body compliance
          const data = await donorService.searchRequests({
            blood_group: user?.blood_group || "O+",
            latitude: latitude,
            longitude: longitude,
            radius_km: parseFloat(radius),
          });
          setRequests(data || []);
        } catch (err) {
          setError("Failed to pull localized emergency streams.");
        } finally {
          setLoading(false);
        }
      },
      (geoErr) => {
        setError(
          `Location check denied: ${geoErr.message}. Enable GPS access to scan nearby emergencies.`,
        );
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }, [user?.blood_group, radius]);

  // Trigger search execution when the distance filter slider values settle
  useEffect(() => {
    fetchNearbyEmergencies();
  }, [fetchNearbyEmergencies]);

  // 2. Atomic Status Flip Pipeline
  const handleAvailabilityToggle = async () => {
    try {
      await donorService.toggleAvailability(user.user_id);
      setIsAvailable((prev) => !prev);
    } catch (err) {
      console.error("Failed to change profile status parameters:", err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Upper Navigation Component */}
      <nav className="border-b border-slate-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <h1 className="text-xl font-black tracking-tight text-slate-950">
            Red<span className="text-red-600">Line</span> Live Feed
          </h1>
          <div className="flex items-center gap-6">
            <span className="text-sm font-medium text-slate-600 hidden sm:inline">
              Profile:{" "}
              <span className="font-bold text-slate-900">
                {user?.name} ({user?.blood_group})
              </span>
            </span>
            <button
              onClick={logout}
              className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-200"
            >
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      {/* Main Framework Dashboard Section */}
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        {/* Profile Controls Card Base */}
        <div className="mb-8 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div>
            <h2 className="text-lg font-bold text-slate-950">
              Active Duty Status
            </h2>
            <p className="text-sm text-slate-500">
              {isAvailable
                ? "Your location is broadcasting. Nearby hospitals can request your match metrics."
                : "Your profile is currently offline. Toggle to stand by for emergency requests."}
            </p>
          </div>

          {/* Dynamic Availability Slider Toggle Switch */}
          <button
            onClick={handleAvailabilityToggle}
            className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              isAvailable ? "bg-red-600" : "bg-slate-200"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                isAvailable ? "translate-x-7" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {/* PostGIS Geofencing Slider Configuration Panel */}
        <div className="mb-8 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-950">Search Radius Matrix</h3>
            <span className="rounded-lg bg-red-50 px-3 py-1 text-sm font-bold text-red-600">
              {radius} Kilometers
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="50"
            value={radius}
            onChange={(e) => setRadius(e.target.value)}
            className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-red-600"
          />
        </div>

        {/* Live Active Incident Streams Deck Layout */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-lg tracking-tight text-slate-950 uppercase">
              🚨 Live Broadcast Feeds
            </h3>
            <button
              onClick={fetchNearbyEmergencies}
              className="text-xs font-bold text-red-600 hover:text-red-700 transition-colors"
            >
              Force Feed Refresh
            </button>
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-5/60 p-4 text-sm font-semibold text-red-600">
              {error}
            </div>
          )}

          {loading ? (
            <div className="py-12 text-center text-sm font-bold uppercase tracking-widest text-slate-400">
              Recalculating Proximity Maps...
            </div>
          ) : requests.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 p-12 text-center text-slate-400 font-medium">
              No matching active {user?.blood_group} emergencies located within
              a {radius}km search boundary.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {requests.map((req) => {
                // Determine completion metric ratios safely
                const progressPct = Math.min(
                  100,
                  ((req.units_fulfilled || 0) / req.units_required) * 100,
                );

                return (
                  <div
                    key={req.request_id}
                    className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm hover:border-slate-200 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between mb-3">
                        <span className="rounded-lg bg-red-600 px-2.5 py-1 text-xs font-black text-white uppercase tracking-wider">
                          {req.blood_group} Required
                        </span>
                        <span className="text-xs font-bold text-slate-400">
                          📍{" "}
                          {req.distance_km
                            ? `${parseFloat(req.distance_km).toFixed(1)} km away`
                            : "Nearby"}
                        </span>
                      </div>

                      <h4 className="font-black text-slate-950 text-base">
                        {req.hospital_name}
                      </h4>
                      <p className="text-xs font-medium text-slate-500 mt-0.5">
                        Patient: {req.patient_name}
                      </p>

                      {/* Interactive Progress Tracking Matrix */}
                      <div className="mt-4">
                        <div className="flex justify-between text-xs font-bold text-slate-600 mb-1">
                          <span>Fulfillment Status</span>
                          <span>
                            {req.units_fulfilled || 0} / {req.units_required}{" "}
                            Units
                          </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full bg-red-600 transition-all duration-500"
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <button className="mt-5 w-full rounded-xl bg-slate-950 py-2.5 text-xs font-bold text-white transition-colors hover:bg-slate-900">
                      View Emergency Details
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
