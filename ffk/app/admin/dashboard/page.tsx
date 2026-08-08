"use client";
import { AdminNav } from "@/components/AdminNav";
import { useCurrentTournamentId } from "@/lib/hooks/useCurrentTournamentId";
import { useLiveTournament } from "@/lib/hooks/useLiveTournament";
import Link from "next/link";

export default function AdminDashboard() {
  const { id } = useCurrentTournamentId();
  const { tournament, teams, matches, leaderboard } = useLiveTournament(id);
  const leader = leaderboard[0];
  const totalPoints = leaderboard.reduce((s, r) => s + r.total_points, 0);
  const completedMatches = matches.filter((m) => m.status === "completed").length;

  return (
    <div className="min-h-screen">
      <AdminNav />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="font-display text-2xl font-bold mb-6">Dashboard</h1>

        {!tournament ? (
          <div className="glass rounded-xl p-8 text-center">
            <p className="text-white/60 mb-4">No tournament exists yet.</p>
            <Link href="/admin/tournaments" className="rounded-lg bg-accent px-5 py-2.5 font-display font-semibold inline-block">CREATE TOURNAMENT</Link>
          </div>
        ) : (
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
              <div className="font-display text-xl font-bold">{tournament.name}</div>
              <span className={`text-xs font-display font-bold uppercase px-3 py-1 rounded-full ${tournament.status === "live" ? "bg-live/20 text-live" : tournament.status === "completed" ? "bg-white/10 text-white/60" : "bg-accent2/20 text-accent2"}`}>
                {tournament.status === "live" ? "🔴 LIVE" : tournament.status}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                ["Teams", String(teams.length)],
                ["Matches", `${completedMatches} / ${matches.length}`],
                ["Total Points", String(totalPoints)],
                ["Current #1 Team", leader?.team_name ?? "—"]
              ].map(([label, val]) => (
                <div key={label} className="rounded-xl bg-panel2 p-4">
                  <div className="text-xs uppercase tracking-wider text-white/40">{label}</div>
                  <div className="font-display text-lg font-bold mt-1">{val}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid sm:grid-cols-3 gap-4 mt-6">
          <Link href="/admin/teams" className="glass rounded-xl p-5 hover:bg-white/5 transition-colors">
            <div className="font-display font-semibold mb-1">Manage Teams</div>
            <div className="text-xs text-white/50">Add, edit or remove teams</div>
          </Link>
          <Link href="/admin/matches" className="glass rounded-xl p-5 hover:bg-white/5 transition-colors">
            <div className="font-display font-semibold mb-1">Manage Matches</div>
            <div className="text-xs text-white/50">Create matches, set maps & status</div>
          </Link>
          <Link href="/admin/live" className="glass rounded-xl p-5 hover:bg-white/5 transition-colors">
            <div className="font-display font-semibold mb-1">Live Score Control</div>
            <div className="text-xs text-white/50">Enter placement & kills</div>
          </Link>
        </div>
      </div>
    </div>
  );
}
