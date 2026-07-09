import { NavLink, useNavigate } from "react-router-dom";
import { Activity, Bell, LogOut, User } from "lucide-react";
import PulseLine from "../PulseLine";
import { useAuth } from "../../context/AuthContext";

const LINK_BASE =
  "text-sm font-medium px-3 py-2 rounded-lg transition-colors duration-150";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 bg-ink text-paper">
      <div className="max-w-6xl mx-auto px-5 flex items-center justify-between h-16">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-pulse" strokeWidth={2.5} />
          <span className="font-display text-lg tracking-tight">RedLine</span>
        </div>

        <nav className="hidden sm:flex items-center gap-1">
          <NavLink
            to="/feed"
            className={({ isActive }) =>
              `${LINK_BASE} ${isActive ? "bg-white/10 text-white" : "text-white/60 hover:text-white"}`
            }
          >
            Live Feed
          </NavLink>
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `${LINK_BASE} ${isActive ? "bg-white/10 text-white" : "text-white/60 hover:text-white"}`
            }
          >
            My Requests
          </NavLink>
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `${LINK_BASE} ${isActive ? "bg-white/10 text-white" : "text-white/60 hover:text-white"}`
            }
          >
            Donor Profile
          </NavLink>
        </nav>

        <div className="flex items-center gap-3">
          <button className="text-white/60 hover:text-white p-2 -m-2 rounded-lg relative">
            <Bell className="w-[18px] h-[18px]" />
          </button>
          <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-white/10">
            <div className="w-7 h-7 rounded-full bg-pulse/20 text-pulse flex items-center justify-center text-xs font-semibold">
              {user?.name?.[0] ?? <User className="w-3.5 h-3.5" />}
            </div>
            <span className="text-sm text-white/80">{user?.name ?? "Guest"}</span>
          </div>
          <button
            onClick={() => {
              logout();
              navigate("/login");
            }}
            className="text-white/50 hover:text-white p-2 -m-1 rounded-lg"
            title="Sign out"
          >
            <LogOut className="w-[18px] h-[18px]" />
          </button>
        </div>
      </div>
      <PulseLine mode="ambient" color="#E11D3C" className="opacity-40" />
    </header>
  );
}
