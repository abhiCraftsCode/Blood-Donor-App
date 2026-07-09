import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Activity, ArrowRight } from "lucide-react";
import { Field, Input } from "../components/ui/Input";
import Button from "../components/ui/Button";
import PulseLine from "../components/PulseLine";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/ui/Toast";

export default function Login() {
  const { login } = useAuth();
  const { push } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ phone: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form);
      navigate("/feed");
    } catch (err) {
      setError(
        err.message ||
          "Couldn't sign you in. Check your details and try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left: brand panel */}
      <div className="hidden lg:flex flex-col justify-between bg-ink text-paper p-12 relative overflow-hidden">
        <div className="flex items-center gap-2 relative z-10">
          <Activity className="w-6 h-6 text-pulse" strokeWidth={2.5} />
          <span className="font-display text-xl">RedLine</span>
        </div>

        <div className="relative z-10 max-w-md">
          <p className="font-display text-3xl leading-snug mb-4">
            Every second between a request and a match is measured here.
          </p>
          <p className="text-white/50 text-sm leading-relaxed">
            RedLine connects patients in urgent need of blood or plasma with
            verified donors nearby — sorted by distance, updated in real time.
          </p>
        </div>

        <div className="relative z-10">
          <PulseLine mode="ambient" color="#E11D3C" />
          <p className="text-white/30 text-xs mt-3 font-mono">
            SYSTEM STATUS — LIVE
          </p>
        </div>
      </div>

      {/* Right: form */}
      <div className="flex items-center justify-center p-6 sm:p-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-sm"
        >
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <Activity className="w-6 h-6 text-pulse" strokeWidth={2.5} />
            <span className="font-display text-xl text-ink">RedLine</span>
          </div>

          <h1 className="font-display text-2xl text-ink mb-1.5">
            Welcome back
          </h1>
          <p className="text-sm text-ink-500 mb-8">
            Sign in to see emergencies near you.
          </p>

          <form onSubmit={submit} className="space-y-4">
            <Field label="Phone">
              <Input
                type="tel"
                required
                placeholder="9876543210"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </Field>
            <Field label="Password">
              <Input
                type="password"
                required
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
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
              Sign in
            </Button>
          </form>

          <p className="text-sm text-ink-500 mt-6 text-center">
            New to RedLine?{" "}
            <Link
              to="/register"
              className="text-pulse font-medium hover:underline"
            >
              Create an account
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
