import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import API from "../api/client";
import { QRCodeSVG } from "qrcode.react";

export default function RequesterDashboard() {
  const { user, logout } = useAuth();
  const [activeRequest, setActiveRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Form initialization block
  const [formData, setFormData] = useState({
    patient_name: "",
    hospital_name: "",
    blood_group: "A+",
    required_component: "Whole Blood", // Default to whole blood for simplicity
    verification_slip_url: "www.example.com", // Placeholder for future file upload integration
    units_required: 1,
    latitude: 25.6112, // Default fallback coordinates to standard city center structures
    longitude: 85.1414,
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 1. Submit Request Lifecycle Pipeline
  const handleCreateRequest = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Automatically injects the currently logged-in user as the master requester anchor
      const payload = {
        user_id: user.user_id,
        ...formData,
        units_required: parseInt(formData.units_required, 10),
      };

      const response = await API.post("/request/create", payload);

      // Assumes your backend controller responds with the fresh request object containing the [secure_token]
      setActiveRequest(response.data.request);
      setShowModal(false); // Close request panel layout drawer
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Failed to submit emergency transmission protocol.",
      );
    } finally {
      setLoading(false);
    }
  };

  // 2. Immediate Incident Cancellation Request Hook
  const handleCancelRequest = async () => {
    if (!activeRequest) return;
    if (
      !window.confirm(
        "Are you absolutely certain you want to terminate this active emergency broadcast loop?",
      )
    )
      return;

    try {
      await API.patch(
        `/request/cancel/${activeRequest.request_id}`,
        { cancellation_reason: "none" },
        //{ params: { request_id: activeRequest.request_id } }, this is for req.query calls
      );
      setActiveRequest(null);
    } catch (err) {
      console.error("Failed to cancel request parameters:", err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Upper Brand Navigation Bar */}
      <nav className="border-b border-slate-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <h1 className="text-xl font-black tracking-tight text-slate-950">
            Red<span className="text-red-600">Line</span> Requester
          </h1>
          <button
            onClick={logout}
            className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-200"
          >
            Sign Out
          </button>
        </div>
      </nav>

      {/* Main Framework Dashboard Grid */}
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        {/* Upper Dashboard Action Section */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-slate-950">
              Welcome back, {user?.name}
            </h2>
            <p className="text-sm text-slate-500">
              Monitor active operations or dispatch emergency targets.
            </p>
          </div>

          {!activeRequest && (
            <button
              onClick={() => setShowModal(true)}
              className="rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-red-700 shadow-sm"
            >
              🚨 Raise New Blood Emergency
            </button>
          )}
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-5/60 p-4 text-sm font-semibold text-red-600">
            ⚠️ {error}
          </div>
        )}

        {/* ACTIVE REQUEST RUNTIME DISPLAY MODULE */}
        {activeRequest ? (
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="flex flex-col md:flex-row gap-8 items-center md:items-start justify-between">
              {/* Data Specifications Segment */}
              <div className="space-y-4 w-full md:w-2/3">
                <div className="flex items-center gap-3">
                  <span className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-black text-amber-700 uppercase tracking-wider">
                    Broadcast Status: PENDING
                  </span>
                  <span className="rounded-lg bg-red-600 px-3 py-1 text-xs font-black text-white uppercase">
                    {activeRequest.blood_group} Matrix
                  </span>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Target Medical Facility
                  </p>
                  <h3 className="text-xl font-black text-slate-950">
                    {activeRequest.hospital_name}
                  </h3>
                  <p className="text-sm text-slate-500 font-medium">
                    Patient Ledger: {activeRequest.patient_name}
                  </p>
                </div>

                {/* Progress Visualizer Matrix */}
                <div className="pt-2">
                  <div className="flex justify-between text-xs font-bold text-slate-600 mb-1.5">
                    <span>Fulfillment Metrics</span>
                    <span>
                      {activeRequest.units_fulfilled || 0} /{" "}
                      {activeRequest.units_required} Units Secured
                    </span>
                  </div>
                  <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-red-600 transition-all duration-500"
                      style={{
                        width: `${Math.min(100, ((activeRequest.units_fulfilled || 0) / activeRequest.units_required) * 100)}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex gap-4">
                  <button
                    onClick={handleCancelRequest}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-red-600 hover:bg-slate-50 transition-colors"
                  >
                    Cancel Broadcast Request
                  </button>
                </div>
              </div>

              {/* LIVE DYNAMIC VECTOR QR BLOCK */}
              <div className="flex flex-col items-center bg-slate-50 border border-slate-200/60 p-6 rounded-2xl w-full max-w-[260px] text-center shrink-0">
                <div className="bg-white p-3 rounded-xl shadow-inner border border-slate-100">
                  <QRCodeSVG
                    value={
                      activeRequest.secure_token || "redline_handshake_null"
                    }
                    size={160}
                    level="H" // High-density error correction parameters
                    includeMargin={false}
                  />
                </div>
                <h4 className="mt-4 text-xs font-black text-slate-950 uppercase tracking-widest">
                  LIVE SECURITY TOKEN
                </h4>
                <p className="mt-1 text-[10px] text-slate-400 font-mono tracking-tighter truncate max-w-[180px]">
                  ID: {activeRequest.secure_token}
                </p>
                <p className="mt-2 text-[11px] text-slate-500 font-medium leading-tight">
                  Present this layout card matrix directly to the donor upon
                  arrival to clear verification steps.
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Empty Dashboard Placeholder Layout */
          <div className="rounded-3xl border border-dashed border-slate-200 p-16 text-center text-slate-400 font-medium bg-white">
            <span className="text-4xl block mb-3">🩸</span>
            <p className="text-slate-950 font-bold mb-1">
              No Active Emergency Broadcasts
            </p>
            <p className="text-sm text-slate-500 max-w-sm mx-auto mb-6">
              If you or an associate requires localized urgent whole blood or
              plasma matching, open a critical pipeline stream below.
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-slate-900"
            >
              Initialize Emergency Pipeline
            </button>
          </div>
        )}

        {/* INPUT DRAWER MODAL OVERLAY WRAPPER */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-slate-100 animate-fade-in space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-lg font-black text-slate-950">
                  Dispatch Metrics Panel
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-sm font-bold text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateRequest} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Patient Full Name
                  </label>
                  <input
                    type="text"
                    name="patient_name"
                    required
                    value={formData.patient_name}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-900 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 text-sm"
                    placeholder="Enter patient name"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Hospital/Facility Destination
                  </label>
                  <input
                    type="text"
                    name="hospital_name"
                    required
                    value={formData.hospital_name}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-900 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 text-sm"
                    placeholder="e.g., PMCH Hospital, Ashok Rajpath"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      Required Type
                    </label>
                    <select
                      name="blood_group"
                      value={formData.blood_group}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 focus:border-red-500 focus:outline-none text-sm"
                    >
                      {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(
                        (g) => (
                          <option key={g} value={g}>
                            {g}
                          </option>
                        ),
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      Volume (Units)
                    </label>
                    <input
                      type="number"
                      name="units_required"
                      min="1"
                      max="10"
                      required
                      value={formData.units_required}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-900 focus:border-red-500 focus:outline-none text-sm"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-4 w-full rounded-xl bg-red-600 py-3 text-sm font-bold text-white hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {loading
                    ? "Transmitting Pipeline Data..."
                    : "Confirm & Broadcast Request"}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
