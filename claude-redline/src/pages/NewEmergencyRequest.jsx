import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Upload } from "lucide-react";
import { Field, Input, Select } from "../components/ui/Input";
import Button from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { api } from "../lib/api";
import { useGeolocation } from "../hooks/useGeolocation";
import { useToast } from "../components/ui/Toast";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const TYPES = ["Whole Blood", "Plasma", "Platelets"];

export default function NewEmergencyRequest() {
  const navigate = useNavigate();
  const { push } = useToast();
  const { coords, status: geoStatus, request: requestLocation } = useGeolocation();
  const [form, setForm] = useState({
    patientName: "",
    hospitalName: "",
    address: "",
    bloodGroup: "",
    type: "Whole Blood",
    unitsNeeded: 1,
  });
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const payload = { ...form, unitsNeeded: Number(form.unitsNeeded), lat: coords?.lat, lng: coords?.lng };
      const created = await api.createRequest(payload);
      if (file) {
        await api.uploadVerificationSlip(created.id, file);
      }
      push("Emergency request published — nearby donors are being notified.", "success");
      navigate(`/emergency/${created.id}`);
    } catch (err) {
      setError(err.message || "Couldn't publish this request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-5 py-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink mb-5"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <h1 className="font-display text-2xl text-ink mb-1.5">Raise a blood emergency</h1>
      <p className="text-sm text-ink-500 mb-7">
        This publishes instantly to donors nearby. Double-check the hospital and blood group before submitting.
      </p>

      <Card className="p-6 sm:p-7">
        <form onSubmit={submit} className="space-y-5">
          <Field label="Patient name">
            <Input required placeholder="Ramesh Kumar" value={form.patientName} onChange={update("patientName")} />
          </Field>

          <Field label="Hospital name">
            <Input required placeholder="PMCH Hospital" value={form.hospitalName} onChange={update("hospitalName")} />
          </Field>

          <Field label="Hospital location" hint="Used to sort this request by distance for nearby donors.">
            <div className="flex gap-2">
              <Input placeholder="Ashok Rajpath, Patna" value={form.address} onChange={update("address")} className="flex-1" />
              <Button type="button" variant="outline" size="md" icon={MapPin} loading={geoStatus === "locating"} onClick={requestLocation}>
                Use current
              </Button>
            </div>
            {geoStatus === "granted" && <p className="text-xs text-vital mt-1.5">Location captured.</p>}
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Blood group" required>
              <Select required value={form.bloodGroup} onChange={update("bloodGroup")}>
                <option value="">Select</option>
                {BLOOD_GROUPS.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </Select>
            </Field>
            <Field label="Type" required>
              <Select required value={form.type} onChange={update("type")}>
                {TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </Select>
            </Field>
          </div>

          <Field label="Units needed">
            <Input type="number" min={1} max={20} required value={form.unitsNeeded} onChange={update("unitsNeeded")} />
          </Field>

          <Field label="Verification slip" hint="A photo of the hospital's blood requirement slip, if you have one.">
            <label className="flex items-center gap-3 border border-dashed border-ink/15 rounded-xl px-4 py-3.5 cursor-pointer hover:border-pulse/40 transition-colors">
              <Upload className="w-4 h-4 text-ink-500" />
              <span className="text-sm text-ink-500">{file ? file.name : "Choose a file"}</span>
              <input type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
            </label>
          </Field>

          {error && <div className="text-sm text-pulse bg-pulse-100 rounded-lg px-3.5 py-2.5">{error}</div>}

          <Button type="submit" className="w-full" size="lg" loading={submitting}>
            Publish emergency request
          </Button>
        </form>
      </Card>
    </div>
  );
}
