import { NavLink, Outlet } from "react-router-dom";
import { Radio, ClipboardList, UserCircle } from "lucide-react";
import Navbar from "./Navbar";

const MOBILE_LINKS = [
  { to: "/feed", label: "Feed", icon: Radio },
  { to: "/dashboard", label: "Requests", icon: ClipboardList },
  { to: "/profile", label: "Profile", icon: UserCircle },
];

export default function AppShell() {
  return (
    <div className="min-h-screen flex flex-col bg-paper">
      <Navbar />
      <main className="flex-1 pb-20 sm:pb-0">
        <Outlet />
      </main>

      {/* Mobile bottom nav */}
      <nav className="sm:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-ink/[0.06] flex">
        {MOBILE_LINKS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center gap-1 py-2.5 text-xs font-medium ${
                isActive ? "text-pulse" : "text-ink-500"
              }`
            }
          >
            <Icon className="w-5 h-5" strokeWidth={2.25} />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
