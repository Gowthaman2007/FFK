export function LiveBadge({ status }: { status: "connecting" | "live" | "reconnecting" }) {
  if (status === "live") {
    return (
      <span className="ffk-live-glow inline-flex items-center gap-2 rounded-full bg-live/10 border border-live/35 px-3.5 py-1.5 text-xs font-display font-bold tracking-[0.12em] text-live">
        <span className="h-2 w-2 rounded-full bg-live animate-pulseLive shadow-[0_0_12px_rgba(255,45,45,.8)]" />
        LIVE
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-accent2/10 border border-accent2/35 px-3.5 py-1.5 text-xs font-display font-bold tracking-[0.12em] text-accent2">
      <span className="h-2 w-2 rounded-full bg-accent2 animate-pulseLive" />
      RECONNECTING...
    </span>
  );
}
