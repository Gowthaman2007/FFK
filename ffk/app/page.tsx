"use client";
import Link from "next/link";
import { NavBar } from "@/components/NavBar";
import { LiveBadge } from "@/components/LiveBadge";
import { useCurrentTournamentId } from "@/lib/hooks/useCurrentTournamentId";
import { useLiveTournament } from "@/lib/hooks/useLiveTournament";

export default function HomePage() {
  const { id } = useCurrentTournamentId();
  const { tournament, teams, matches, leaderboard, status } = useLiveTournament(id);
  const leader = leaderboard[0];
  const totalKills = leaderboard.reduce((s, r) => s + r.kills, 0);
  const totalPoints = leaderboard.reduce((s, r) => s + r.total_points, 0);

  return (
    <div className="min-h-screen">
      <NavBar />
      <section className="max-w-5xl mx-auto px-4 pt-20 pb-16 text-center">
        <h1 className="font-display text-5xl sm:text-7xl font-bold tracking-tight">
          FFK <span className="text-gradient">WARS</span>
        </h1>
        <p className="mt-3 text-white/60 text-lg">Weekly Free Fire Tournament</p>

        {tournament && (
          <div className="mt-8 inline-flex flex-col items-center gap-3 glass rounded-2xl px-8 py-6">
            {tournament.status === "live" && <LiveBadge status={status} />}
            <div className="font-display text-2xl font-bold">{tournament.name}</div>
            {tournament.status === "live" && (
              <div className="text-white/60 text-sm">MATCH {tournament.current_match} / {tournament.total_matches}</div>
            )}
            <div className="flex gap-3 mt-2">
              <Link href="/live" className="rounded-lg bg-accent px-5 py-2.5 font-display font-semibold hover:bg-accent/80 transition-colors">WATCH LIVE</Link>
              <Link href="/live" className="rounded-lg border border-line px-5 py-2.5 font-display font-semibold hover:bg-white/5 transition-colors">VIEW POINTS TABLE</Link>
            </div>
          </div>
        )}

        {!tournament && (
          <p className="mt-10 text-white/50">No tournament has been created yet. Check back soon.</p>
        )}

        {tournament && (
          <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              ["Current Leader", leader?.team_name ?? "—"],
              ["Teams", String(teams.length)],
              ["Matches", `${matches.filter(m => m.status === "completed").length}/${matches.length}`],
              ["Total Kills", String(totalKills)]
            ].map(([label, val]) => (
              <div key={label} className="glass rounded-xl py-4">
                <div className="text-xs uppercase tracking-wider text-white/40">{label}</div>
                <div className="font-display text-xl font-bold mt-1">{val}</div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
