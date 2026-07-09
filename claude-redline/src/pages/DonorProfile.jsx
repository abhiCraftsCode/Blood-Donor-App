import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Droplet, Award, Calendar } from "lucide-react";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { Card } from "../components/ui/Card";
import { useToast } from "../components/ui/Toast";

function Stat({ label, value, icon: Icon }) {
  return (
    <Card className="p-5 flex items-center gap-3">
      <div className="w-9 h-9 rounded-full bg-pulse-100 text-pulse flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <p className="font-mono text-xl font-semibold text-ink tabular">
          {value}
        </p>
        <p className="text-xs text-ink-500">{label}</p>
      </div>
    </Card>
  );
}

export default function DonorProfile() {
  const { user, setUser } = useAuth();
  const { push } = useToast();
  const [profile, setProfile] = useState(null);
  const [history, setHistory] = useState(null);
  const [available, setAvailable] = useState(true);

  useEffect(() => {
    api
      .getDonorProfile(user.user_id)
      .then((data) => {
        setProfile(data);
        setAvailable(data.is_available);
      })
      .catch(() => setProfile(null));
  }, []);

  const toggleAvailability = async () => {
    const next = !available;
    setAvailable(next);
    try {
      await api.toggleAvailability(user.user_id);
      push(
        next
          ? "You're now visible to nearby requesters."
          : "You're hidden from the live feed.",
        "success",
      );
    } catch {
      setAvailable(!next);
      push("Couldn't update this. Please try again.", "error");
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-5 py-8">
      <h1 className="font-display text-2xl text-ink mb-1.5">Donor profile</h1>
      <p className="text-sm text-ink-500 mb-7">
        Manage your availability and see your donation history.
      </p>

      <Card className="p-6 flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-pulse-100 text-pulse flex items-center justify-center font-mono font-semibold">
            {user?.blood_group}
          </div>
          <div>
            <p className="font-medium text-ink">{user?.name}</p>
            <p className="text-sm text-ink-500">{user?.city}</p>
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm text-ink-500 cursor-pointer">
          <span className="hidden sm:inline">
            {available ? "Available" : "Unavailable"}
          </span>
          <button
            role="switch"
            aria-checked={available}
            onClick={toggleAvailability}
            className={`w-10 h-6 rounded-full transition-colors relative ${available ? "bg-vital" : "bg-ink/15"}`}
          >
            <span
              className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${available ? "translate-x-4" : "translate-x-0.5"}`}
            />
          </button>
        </label>
      </Card>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <Stat
          label="Total donations"
          value={history?.totalDonations ?? "0"}
          icon={Droplet}
        />
        <Stat
          label="Lives impacted"
          value={history?.livesImpacted ?? "—"}
          icon={Award}
        />
        <Stat
          label="Last donation"
          value={profile?.last_donation_date ?? "—"}
          icon={Calendar}
        />
      </div>

      <Card className="p-6">
        <h3 className="font-medium text-ink mb-4">Donation history</h3>
        {profile?.history?.length ? (
          <div className="space-y-3">
            {profile.history.map((h, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-center justify-between py-2.5 border-b border-ink/[0.04] last:border-0"
              >
                <div>
                  <p className="text-sm font-medium text-ink">
                    {h.hospitalName}
                  </p>
                  <p className="text-xs text-ink-500">{h.date}</p>
                </div>
                <span className="font-mono text-xs text-vital bg-vital-100 rounded-full px-2.5 py-1">
                  {h.bloodGroup}
                </span>
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-ink-500">
            No donations recorded yet — your first one will show up here.
          </p>
        )}
      </Card>
    </div>
  );
}
