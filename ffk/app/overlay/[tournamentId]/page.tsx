"use client";
import { useLiveTournament } from "@/lib/hooks/useLiveTournament";

// Minimal, high-contrast overlay for OBS / stream capture.
// No nav, no admin controls — pure read-only broadcast graphic.
export default function OverlayPage({ params }: { params: { tournamentId: string } }) {
  const { tournament, leaderboard, status } = useLiveTournament(params.tournamentId);

  return (
    <div className="min-h-screen bg-transparent p-6 font-body">
      <style jsx global>{`html, body { background: transparent !important; background-image: none !important; }`}</style>
      <div className="max-w-md">
        <div className="flex items-center gap-2 mb-3">
          <span className="font-display text-2xl font-bold tracking-wide text-white drop-shadow">FFK WARS</span>
          {status === "live" ? (
            <span className="text-live text-xs font-display font-bold flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-live animate-pulseLive" /> LIVE
            </span>
          ) : (
            <span className="text-accent2 text-xs font-display font-bold">RECONNECTING</span>
          )}
        </div>
        <div className="text-white/70 text-xs uppercase tracking-widest mb-2">Top Teams</div>
        <div className="space-y-1">
          {leaderboard.slice(0, 5).map((r, i) => (
            <div key={r.team_id} className="flex items-center justify-between bg-black/60 rounded-md px-3 py-1.5 border-l-4" style={{ borderColor: i === 0 ? "#ffd23f" : i === 1 ? "#c9d2de" : i === 2 ? "#d98a4a" : "#3a3a46" }}>
              <span className="font-display font-semibold text-white text-sm">{i + 1}. {r.team_name}</span>
              <span className="font-display font-bold text-white">{r.total_points}</span>
            </div>
          ))}
        </div>
        {tournament && (
          <div className="mt-2 text-[11px] text-white/50">{tournament.name} · Match {tournament.current_match}/{tournament.total_matches}</div>
        )}
      </div>
    </div>
  );
}
