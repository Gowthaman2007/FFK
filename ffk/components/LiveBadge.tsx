export function LiveBadge({ status }: { status: "connecting" | "live" | "reconnecting" }) {
  if (status === "live") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-live/10 border border-live/40 px-3 py-1 text-xs font-display font-semibold tracking-wide text-live">
        <span className="h-2 w-2 rounded-full bg-live animate-pulseLive" /> LIVE
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-accent2/10 border border-accent2/40 px-3 py-1 text-xs font-display font-semibold tracking-wide text-accent2">
      <span className="h-2 w-2 rounded-full bg-accent2 animate-pulseLive" /> RECONNECTING...
    </span>
  );
}
