import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { MapPin, Droplet, Navigation } from "lucide-react";
import { api } from "../lib/api";
import { useGeolocation } from "../hooks/useGeolocation";
import { useAuth } from "../context/AuthContext";
import { Card } from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import { FeedSkeleton } from "../components/ui/Skeleton";
import { useToast } from "../components/ui/Toast";

function urgencyStatus(pct) {
  if (pct >= 1) return "fulfilled";
  if (pct > 0) return "pending";
  return "critical";
}

function LocationPrompt({ onEnable, status }) {
  return (
    <Card className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-full bg-pulse-100 text-pulse flex items-center justify-center shrink-0">
          <Navigation className="w-4 h-4" />
        </div>
        <div>
          <p className="text-sm font-semibold text-ink">Enable location to see emergencies near you</p>
          <p className="text-sm text-ink-500 mt-0.5">
            We only use it to sort requests by distance — nothing runs in the background.
          </p>
        </div>
      </div>
      <Button onClick={onEnable} loading={status === "locating"} size="sm" className="shrink-0">
        {status === "denied" ? "Try again" : "Enable location"}
      </Button>
    </Card>
  );
}

function EmergencyCard({ item, index }) {
  const fulfilledPct = item.unitsFulfilled / item.unitsNeeded;
  const status = urgencyStatus(fulfilledPct);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.04, ease: [0.16, 1, 0.3, 1] }}
    >
      <Card hover className={`p-5 border-l-[3px] ${status === "critical" ? "border-l-pulse" : "border-l-transparent"}`}>
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="font-mono text-lg font-semibold text-ink">{item.bloodGroup}</span>
            <span className="text-sm text-ink-500 uppercase tracking-wide flex items-center gap-1">
              <Droplet className="w-3.5 h-3.5" /> {item.type}
            </span>
          </div>
          <Badge status={status} pulse={status === "critical"}>
            {status === "critical" ? "Urgent" : status === "pending" ? "In progress" : "Fulfilled"}
          </Badge>
        </div>

        <p className="text-sm font-medium text-ink mb-0.5">{item.hospitalName}</p>
        <p className="text-sm text-ink-500 flex items-center gap-1 mb-4">
          <MapPin className="w-3.5 h-3.5" /> {item.address}
          <span className="font-mono tabular ml-1">· {item.distanceKm.toFixed(1)} km away</span>
        </p>

        <div className="mb-4">
          <div className="h-2 rounded-full bg-ink/[0.06] overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(fulfilledPct, 1) * 100}%` }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className={`h-full rounded-full ${status === "fulfilled" ? "bg-vital" : "bg-pulse"}`}
            />
          </div>
          <p className="font-mono text-xs text-ink-500 mt-1.5 tabular">
            {item.unitsFulfilled}/{item.unitsNeeded} units fulfilled
          </p>
        </div>

        <Button as={Link} to={`/emergency/${item.id}`} variant="dark" size="sm" className="w-full">
          View emergency details
        </Button>
      </Card>
    </motion.div>
  );
}

export default function EmergencyFeed() {
  const { coords, status: geoStatus, request: requestLocation } = useGeolocation();
  const { user } = useAuth();
  const { push } = useToast();
  const [emergencies, setEmergencies] = useState(null);
  const [available, setAvailable] = useState(user?.isAvailable ?? true);

  useEffect(() => {
    if (!coords) return;
    api
      .syncLocation(coords)
      .catch(() => {}); // best-effort; feed still works if this fails
    api
      .getNearbyEmergencies(coords)
      .then((data) => setEmergencies(data.results))
      .catch(() => setEmergencies([]));
  }, [coords]);

  const toggleAvailability = async () => {
    const next = !available;
    setAvailable(next);
    try {
      await api.setAvailability(next);
      push(next ? "You're marked available to donate." : "You're marked unavailable for now.", "success");
    } catch {
      setAvailable(!next);
      push("Couldn't update availability. Please try again.", "error");
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-5 py-8">
      <div className="flex items-center justify-between mb-1">
        <h1 className="font-display text-2xl text-ink">Live emergencies nearby</h1>
        <label className="flex items-center gap-2 text-sm text-ink-500 cursor-pointer select-none">
          Available
          <button
            role="switch"
            aria-checked={available}
            onClick={toggleAvailability}
            className={`w-10 h-6 rounded-full transition-colors relative ${available ? "bg-vital" : "bg-ink/15"}`}
          >
            <span
              className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                available ? "translate-x-4" : "translate-x-0.5"
              }`}
            />
          </button>
        </label>
      </div>
      <p className="text-sm text-ink-500 mb-6">Sorted by distance from your location.</p>

      {geoStatus !== "granted" && <LocationPrompt onEnable={requestLocation} status={geoStatus} />}

      {geoStatus === "granted" && emergencies === null && <FeedSkeleton />}

      {emergencies?.length === 0 && (
        <Card className="p-10 text-center">
          <Droplet className="w-8 h-8 text-ink-300 mx-auto mb-3" />
          <p className="font-medium text-ink mb-1">No active emergencies nearby</p>
          <p className="text-sm text-ink-500">We'll notify you the moment a request comes in near you.</p>
        </Card>
      )}

      {emergencies && emergencies.length > 0 && (
        <div className="space-y-4">
          {emergencies.map((item, i) => (
            <EmergencyCard key={item.id} item={item} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
