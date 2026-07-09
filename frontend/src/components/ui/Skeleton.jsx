import PulseLine from "../PulseLine";

export function EmergencyCardSkeleton() {
  return (
    <div className="rounded-2xl border border-ink/[0.06] bg-white p-5 animate-fadeUp">
      <div className="flex items-center justify-between mb-3">
        <div className="h-4 w-32 rounded bg-ink/[0.06]" />
        <div className="h-4 w-14 rounded bg-ink/[0.06]" />
      </div>
      <div className="h-3 w-48 rounded bg-ink/[0.06] mb-4" />
      <PulseLine mode="loading" color="#8E97A8" />
      <div className="h-9 w-full rounded-xl bg-ink/[0.04] mt-4" />
    </div>
  );
}

export function FeedSkeleton({ count = 3 }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <EmergencyCardSkeleton key={i} />
      ))}
    </div>
  );
}
