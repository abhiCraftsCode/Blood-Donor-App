import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, QrCode, MapPin, X } from "lucide-react";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { Card } from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import { ConfirmDialog } from "../components/ui/Modal";
import { useToast } from "../components/ui/Toast";
import { FeedSkeleton } from "../components/ui/Skeleton";

function statusFor(req) {
  if (req.status === "CANCELLED") return "cancelled";
  if (req.unitsFulfilled >= req.unitsNeeded) return "fulfilled";
  return "pending";
}

function RequestRow({ req, onCancel }) {
  const status = statusFor(req);
  const pct = Math.min(req.unitsFulfilled / req.unitsNeeded, 1);

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <Card className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <p className="font-medium text-ink truncate">{req.patientName}</p>
              <Badge status={status}>{status}</Badge>
            </div>
            <p className="text-sm text-ink-500 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" /> {req.hospitalName}
            </p>
            <p className="font-mono text-xs text-ink-500 mt-1 tabular">
              {req.unitsNeeded} units {req.bloodGroup} · token {req.secureToken.slice(0, 6)}…
            </p>
            <div className="h-1.5 rounded-full bg-ink/[0.06] overflow-hidden mt-3 max-w-xs">
              <div className={`h-full rounded-full ${status === "fulfilled" ? "bg-vital" : "bg-pulse"}`} style={{ width: `${pct * 100}%` }} />
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button as={Link} to={`/emergency/${req.id}`} variant="outline" size="sm" icon={QrCode}>
              Show QR
            </Button>
            {status === "pending" && (
              <Button variant="ghost" size="sm" icon={X} onClick={() => onCancel(req)}>
                Cancel
              </Button>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

export default function RequesterDashboard() {
  const { push } = useToast();
  const [requests, setRequests] = useState(null);
  const [toCancel, setToCancel] = useState(null);

  const load = () => api.getMyRequests().then((d) => setRequests(d.results)).catch(() => setRequests([]));

  useEffect(() => {
    load();
  }, []);

  const confirmCancel = async () => {
    try {
      await api.cancelRequest(toCancel.id);
      push("Request cancelled.", "success");
      setToCancel(null);
      load();
    } catch {
      push("Couldn't cancel that request. Please try again.", "error");
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-5 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl text-ink">Your requests</h1>
          <p className="text-sm text-ink-500 mt-1">Track fulfillment and manage active emergencies.</p>
        </div>
        <Button as={Link} to="/dashboard/new" icon={Plus} className="hidden sm:inline-flex">
          Raise emergency
        </Button>
      </div>

      <Button as={Link} to="/dashboard/new" icon={Plus} className="w-full mb-6 sm:hidden">
        Raise new blood emergency
      </Button>

      {requests === null && <FeedSkeleton />}

      {requests?.length === 0 && (
        <Card className="p-10 text-center">
          <p className="font-medium text-ink mb-1">No requests yet</p>
          <p className="text-sm text-ink-500 mb-5">
            When you need blood or plasma urgently, raise a request and nearby donors will see it instantly.
          </p>
          <Button as={Link} to="/dashboard/new" icon={Plus} className="mx-auto">
            Raise your first emergency
          </Button>
        </Card>
      )}

      {requests && requests.length > 0 && (
        <div className="space-y-4">
          {requests.map((req) => (
            <RequestRow key={req.id} req={req} onCancel={setToCancel} />
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!toCancel}
        onClose={() => setToCancel(null)}
        onConfirm={confirmCancel}
        title="Cancel this request?"
        description={`Donors matched to ${toCancel?.patientName ?? "this patient"} will be notified this request is no longer active.`}
        confirmLabel="Cancel request"
        danger
      />
    </div>
  );
}
