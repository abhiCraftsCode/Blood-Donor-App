import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { donorService } from "../api/donorService";

export default function DonorProfile() {
  const { user, logout, syncLocation } = useAuth();
  const [isAvailable, setIsAvailable] = useState(user?.is_available || false);
  const [syncStatus, setSyncStatus] = useState("");
  const [syncing, setSyncing] = useState(false);

  // 1. Atomic Status Flip Pipeline
  const handleAvailabilityToggle = async () => {
    try {
      await donorService.toggleAvailability(user.user_id);
      setIsAvailable((prev) => !prev);
    } catch (err) {
      console.error("Failed to shift profile availability metrics:", err);
    }
  };

  // 2. Manual Geolocation Re-Sync Handler
  const handleManualSync = async () => {
    setSyncing(true);
    setSyncStatus("Querying hardware telemetry...");

    try {
      await syncLocation();
      setSyncStatus("PostGIS spatial node updated successfully!");
      setTimeout(() => setSyncStatus(""), 4000);
    } catch (err) {
      setSyncStatus("Telemetry sync failed. Check device GPS permissions.");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Navigation Header */}
      <nav className="border-b border-slate-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <h1 className="text-xl font-black tracking-tight text-slate-950">
            Red<span className="text-red-600">Line</span> Profile
          </h1>
          <button
            onClick={logout}
            className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-200"
          >
            Sign Out
          </button>
        </div>
      </nav>

      {/* Main Container */}
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        {/* Profile Card Summary Header */}
        <div className="relative overflow-hidden rounded-3xl bg-slate-950 p-6 text-white shadow-xl mb-6">
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                Verified Life-Saver
              </p>
              <h2 className="text-2xl font-black tracking-tight mt-1">
                {user?.name}
              </h2>
              <p className="text-sm text-slate-400 mt-0.5">{user?.email}</p>
              <p className="text-sm text-slate-400">
                {user?.phone || "No phone link registered"}
              </p>
            </div>
            {/* Massive high-contrast Blood Group indicator */}
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-red-600 text-3xl font-black tracking-tighter text-white shadow-md shadow-red-900/30">
              {user?.blood_group || "O+"}
            </div>
          </div>
          {/* Subtle graphic accent background ring */}
          <div className="absolute -right-10 -bottom-10 h-40 w-40 rounded-full bg-slate-900/40 border border-slate-800 pointer-events-none" />
        </div>

        {/* Operational Availability Management Panel */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm mb-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="font-bold text-slate-950 text-base">
                Broadcast Network Stream
              </h3>
              <p className="text-xs text-slate-500 max-w-md">
                When active, your profile telemetry metrics are parsed inside
                surrounding hospital lookups. Turn off to take a temporary break
                from notifications.
              </p>
            </div>
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
        </div>

        {/* Spatial Device Configuration Layer */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm mb-6">
          <h3 className="font-bold text-slate-950 text-base mb-1">
            Hardware Coordinate Synchronization
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            The application automatically triggers coordinate sweeps upon
            authorization events. Use this action to manually push an updated
            spatial anchor down into the PostGIS map index.
          </p>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <button
              onClick={handleManualSync}
              disabled={syncing}
              className="rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-slate-900 disabled:opacity-50 text-center"
            >
              {syncing ? "Querying Sensors..." : "Force Spatial GPS Update"}
            </button>
            {syncStatus && (
              <span className="text-xs font-bold text-red-600 animate-fade-in">
                ⚙️ {syncStatus}
              </span>
            )}
          </div>
        </div>

        {/* Analytics & Milestone Tracker Rows */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm text-center sm:text-left">
            <span className="text-2xl">📦</span>
            <h4 className="text-2xl font-black text-slate-950 mt-2">0 Units</h4>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mt-0.5">
              Total Volumes Fulfilled
            </p>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm text-center sm:text-left">
            <span className="text-2xl">🛡️</span>
            <h4 className="text-2xl font-black text-emerald-600 mt-2">
              Active
            </h4>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mt-0.5">
              Account Standing Matrix
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
