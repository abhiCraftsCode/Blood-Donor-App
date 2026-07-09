// The signature element of RedLine's visual identity: a live ECG-style
// waveform. It appears in three modes:
//  - "ambient": thin, slow, sits under the nav to signal "the system is live"
//  - "loading": used as the skeleton/loading treatment instead of shimmer
//  - "spike": one-shot beat animation fired on a successful fulfillment scan

const PATH =
  "M0,20 L40,20 L48,20 L54,6 L62,34 L70,20 L80,20 L86,12 L92,28 L98,20 L400,20";

export default function PulseLine({ mode = "ambient", color = "#E11D3C", className = "" }) {
  if (mode === "spike") {
    return (
      <svg viewBox="0 0 400 40" className={`w-full h-10 ${className}`} preserveAspectRatio="none">
        <path
          d={PATH}
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="animate-spike origin-center"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 400 40" className={`w-full h-6 ${className}`} preserveAspectRatio="none">
      <path
        d={PATH}
        fill="none"
        stroke={color}
        strokeWidth={mode === "loading" ? 3 : 1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="6 6"
        opacity={mode === "loading" ? 0.9 : 0.35}
        className="animate-pulseLine"
      />
    </svg>
  );
}
