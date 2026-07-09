import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, MapPin, ScanLine, CheckCircle2 } from "lucide-react";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { Card } from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import PulseLine from "../components/PulseLine";
import { useToast } from "../components/ui/Toast";

function statusFor(req) {
  if (!req) return "pending";
  if (req.status === "CANCELLED") return "cancelled";
  if (req.unitsFulfilled >= req.unitsNeeded) return "fulfilled";
  return "pending";
}

function ScannerPanel({ request, onVerified }) {
  const { push } = useToast();
  const [tokenInput, setTokenInput] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [justVerified, setJustVerified] = useState(false);

  const submitToken = async (e) => {
    e.preventDefault();
    setVerifying(true);
    try {
      const result = await api.verifyFulfillment(tokenInput.trim());
      setJustVerified(true);
      push("Donation verified — thank you for saving a life.", "success");
      onVerified(result);
      setTimeout(() => setJustVerified(false), 1200);
    } catch (err) {
      push(err.message || "That code didn't match an active request.", "error");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-1">
        <ScanLine className="w-4 h-4 text-pulse" />
        <h3 className="font-medium text-ink">Verify at bedside</h3>
      </div>
      <p className="text-sm text-ink-500 mb-5">
        Ask the requester to show their QR code, then scan it or enter the code manually.
      </p>

      <div className="rounded-xl bg-ink/[0.03] border border-dashed border-ink/15 aspect-square max-w-[220px] mx-auto flex items-center justify-center mb-5">
        <ScanLine className="w-10 h-10 text-ink-300" />
      </div>

      <form onSubmit={submitToken} className="flex gap-2">
        <input
          value={tokenInput}
          onChange={(e) => setTokenInput(e.target.value)}
          placeholder="Enter secure token"
          className="flex-1 rounded-xl border border-ink/10 bg-white px-3.5 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-pulse/20 focus:border-pulse"
        />
        <Button type="submit" loading={verifying} disabled={!tokenInput.trim()}>
          Verify
        </Button>
      </form>

      <AnimatePresence>
        {justVerified && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-5 flex flex-col items-center overflow-hidden"
          >
            <CheckCircle2 className="w-8 h-8 text-vital mb-2" />
            <PulseLine mode="spike" color="#0FA968" className="max-w-[200px]" />
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

export default function EmergencyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [request, setRequest] = useState(null);

  const load = () => api.getRequestById(id).then(setRequest).catch(() => setRequest(null));

  useEffect(() => {
    load();
  }, [id]);

  if (request === null) {
    return (
      <div className="max-w-2xl mx-auto px-5 py-12 text-center text-ink-500 text-sm">Loading emergency…</div>
    );
  }

  const status = statusFor(request);
  const isOwner = user?.id === request.requesterId;
  const pct = Math.min(request.unitsFulfilled / request.unitsNeeded, 1);

  return (
    <div className="max-w-2xl mx-auto px-5 py-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink mb-5">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <Card className="p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xl font-semibold text-ink">{request.bloodGroup}</span>
              <span className="text-sm text-ink-500 uppercase tracking-wide">{request.type}</span>
            </div>
            <p className="text-sm text-ink-500">Requested for {request.patientName}</p>
          </div>
          <Badge status={status} pulse={status === "pending"}>{status}</Badge>
        </div>

        <p className="text-sm font-medium text-ink flex items-center gap-1.5 mb-1">
          <MapPin className="w-4 h-4 text-ink-500" /> {request.hospitalName}
        </p>
        <p className="text-sm text-ink-500 mb-5">{request.address}</p>

        <div className="h-2 rounded-full bg-ink/[0.06] overflow-hidden mb-1.5">
          <div className={`h-full rounded-full ${status === "fulfilled" ? "bg-vital" : "bg-pulse"}`} style={{ width: `${pct * 100}%` }} />
        </div>
        <p className="font-mono text-xs text-ink-500 tabular">
          {request.unitsFulfilled}/{request.unitsNeeded} units fulfilled
        </p>
      </Card>

      {isOwner ? (
        <Card className="p-6 text-center">
          <p className="text-sm font-medium text-ink mb-1">Show this code to your donor</p>
          <p className="text-sm text-ink-500 mb-5">They'll scan it at the bedside to confirm the donation.</p>
          <div className="inline-block p-4 bg-white rounded-2xl border border-ink/[0.06] shadow-card">
            <QRCodeSVG value={request.secureToken} size={176} fgColor="#0B1220" />
          </div>
          <p className="font-mono text-xs text-ink-500 mt-4 tabular">{request.secureToken}</p>
        </Card>
      ) : (
        status !== "fulfilled" &&
        status !== "cancelled" && <ScannerPanel request={request} onVerified={load} />
      )}
    </div>
  );
}
