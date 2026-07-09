import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Activity, ArrowRight } from "lucide-react";
import { Field, Input, Select } from "../components/ui/Input";
import Button from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    password: "",
    blood_group: "",
    city: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(form);
      navigate("/feed");
    } catch (err) {
      setError(
        err.message || "Couldn't create your account. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 py-12 bg-paper">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md"
      >
        <div className="flex items-center gap-2 mb-8 justify-center">
          <Activity className="w-6 h-6 text-pulse" strokeWidth={2.5} />
          <span className="font-display text-xl text-ink">RedLine</span>
        </div>

        <div className="bg-white rounded-2xl border border-ink/[0.06] shadow-card p-7 sm:p-8">
          <h1 className="font-display text-2xl text-ink mb-1.5">
            Create your account
          </h1>
          <p className="text-sm text-ink-500 mb-7">
            One account. Ask for blood when you need it, offer it when you can.
          </p>

          <form onSubmit={submit} className="space-y-4">
            <Field label="Full name">
              <Input
                required
                placeholder="Your Name"
                value={form.name}
                onChange={update("name")}
              />
            </Field>
            <Field label="Phone Number">
              <Input
                type="tel"
                required
                placeholder="+91 9876543210"
                value={form.phone}
                onChange={update("phone")}
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Blood group">
                <Select
                  required
                  value={form.blood_group}
                  onChange={update("blood_group")}
                >
                  <option value="">Select</option>
                  {BLOOD_GROUPS.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="City">
                <Input
                  required
                  placeholder="Delhi"
                  value={form.city}
                  onChange={update("city")}
                />
              </Field>
            </div>
            <Field label="Password" hint="At least 8 characters.">
              <Input
                type="password"
                required
                minLength={8}
                placeholder="••••••••"
                value={form.password}
                onChange={update("password")}
              />
            </Field>

            {error && (
              <div className="text-sm text-pulse bg-pulse-100 rounded-lg px-3.5 py-2.5">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              size="lg"
              loading={loading}
              icon={ArrowRight}
            >
              Create account
            </Button>
          </form>
        </div>

        <p className="text-sm text-ink-500 mt-6 text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-pulse font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
