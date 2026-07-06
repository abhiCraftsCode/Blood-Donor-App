import { useLocation, useNavigate } from "react-router-dom";

export default function GlobalNav() {
  const location = useLocation();
  const navigate = useNavigate();

  // Define the core operational pathways across our stack
  const navItems = [
    { label: "📡 Live Feed", path: "/dashboard" },
    { label: "🚨 Raise Request", path: "/requester" },
    { label: "📷 Bedside Scan", path: "/verify-scan" },
    { label: "👤 Profile Matrix", path: "/profile" },
  ];

  // Don't render the navigation bar if the user is locked on the Auth login screen
  if (location.pathname === "/auth") return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white/90 backdrop-blur-md px-4 py-2 shadow-lg sm:bottom-auto sm:top-0 sm:border-b sm:border-t-0">
      <div className="mx-auto flex max-w-5xl items-center justify-between sm:h-14">
        {/* Desktop Brand Logo Indicator */}
        <div className="hidden sm:block font-black text-slate-950 tracking-tight text-lg">
          Red<span className="text-red-600">Line</span> Matrix
        </div>

        {/* Dynamic Action Control Anchors */}
        <nav className="flex w-full justify-around gap-2 sm:w-auto sm:justify-end sm:gap-6">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`rounded-xl px-3 py-2 text-xs font-bold tracking-tight transition-all sm:text-sm ${
                  isActive
                    ? "bg-red-600 text-white shadow-sm shadow-red-600/10"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
