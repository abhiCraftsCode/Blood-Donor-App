const STYLES = {
  pending: "bg-plasma-100 text-amber-800",
  fulfilled: "bg-vital-100 text-emerald-800",
  cancelled: "bg-ink/[0.06] text-ink-500",
  critical: "bg-pulse-100 text-pulse-600",
};

const DOT = {
  pending: "bg-plasma",
  fulfilled: "bg-vital",
  cancelled: "bg-ink-300",
  critical: "bg-pulse",
};

export default function Badge({ status = "pending", children, pulse = false }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide uppercase ${STYLES[status]}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${DOT[status]} ${pulse ? "animate-pulse" : ""}`} />
      {children}
    </span>
  );
}
