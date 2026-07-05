import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function AuthPortal() {
  const { login, register } = useAuth();

  // Toggle switch between 'login' and 'register' modes
  const [isLoginView, setIsLoginView] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Unified form state matching backend parameters
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    blood_group: "A+", // Default selection assignment
  });

  // Handle standard keystroke adjustments across all inputs dynamically
  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Wipe error messages clear when user restarts typing
    if (error) setError("");
  };

  // Submit handling interceptor routine
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (isLoginView) {
      // Execute login sequence using deconstructed context hook
      const result = await login(formData.email, formData.password);
      if (!result.success) {
        setError(result.message);
        setLoading(false);
      }
      // If success, AuthContext automatically updates global state and triggers redirects
    } else {
      // Execute registration sequence
      const result = await register(formData);
      if (!result.success) {
        setError(result.message);
        setLoading(false);
      }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        {/* Branding Header Area */}
        <div className="text-center">
          <h2 className="text-3xl font-black tracking-tight text-slate-950">
            Red<span className="text-red-600">Line</span>
          </h2>
          <p className="mt-2 text-sm text-slate-500 font-medium">
            {isLoginView
              ? "Emergency Blood & Plasma Network"
              : "Join the Emergency Life-Saving Matrix"}
          </p>
        </div>

        {/* Global Error Banner Box */}
        {error && (
          <div className="rounded-lg bg-red-5/80 border border-red-200 p-4 text-sm text-red-600 font-semibold animate-pulse">
            ⚠️ {error}
          </div>
        )}

        {/* Input Interactive Form Wrapper */}
        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          {/* REGISTRATION ONLY: Name Field */}
          {!isLoginView && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 text-sm"
                placeholder="Abhishek Ranjan"
              />
            </div>
          )}

          {/* SHARED FIELD: Email Address */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 text-sm"
              placeholder="name@domain.com"
            />
          </div>

          {/* REGISTRATION ONLY: Contact Number */}
          {!isLoginView && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                required
                value={formData.phone}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 text-sm"
                placeholder="e.g., +919999999999"
              />
            </div>
          )}

          {/* REGISTRATION ONLY: Blood Type Dropdown Selector */}
          {!isLoginView && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Blood Group Matrix
              </label>
              <select
                name="blood_group"
                value={formData.blood_group}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 text-sm"
              >
                {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(
                  (group) => (
                    <option key={group} value={group}>
                      {group}
                    </option>
                  ),
                )}
              </select>
            </div>
          )}

          {/* SHARED FIELD: Password Safety Matrix */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Password
            </label>
            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 text-sm"
              placeholder="••••••••"
            />
          </div>

          {/* Core Submit Call-to-Action Button Button */}
          <button
            type="submit"
            disabled={loading}
            className="mt-6 flex w-full justify-center rounded-xl bg-red-600 px-4 py-3.5 text-sm font-bold text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {loading
              ? "Processing Protocol..."
              : isLoginView
                ? "Authenticate Secure Access"
                : "Register Profile Engine"}
          </button>
        </form>

        {/* Dynamic View Swapper Switcher Anchor */}
        <div className="text-center mt-6">
          <button
            onClick={() => {
              setIsLoginView(!isLoginView);
              setError("");
            }}
            className="text-sm font-semibold text-red-600 hover:text-red-700 transition-colors focus:outline-none"
          >
            {isLoginView
              ? "Don't have an account? Create one here"
              : "Already verified? Switch to Login"}
          </button>
        </div>
      </div>
    </div>
  );
}
