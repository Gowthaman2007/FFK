"use client";
import { useState } from "react";
import { NavBar } from "@/components/NavBar";
import { useCurrentTournamentId } from "@/lib/hooks/useCurrentTournamentId";
import { useLiveTournament } from "@/lib/hooks/useLiveTournament";

const statusColor: Record<string, string> = {
  upcoming: "text-white/40 border-line",
  live: "text-live border-live/50",
  completed: "text-white/60 border-line"
};

export default function MatchesPage() {
  const { id } = useCurrentTournamentId();
  const { tournament, matches, results, teams } = useLiveTournament(id);
  const [openMatch, setOpenMatch] = useState<string | null>(null);

  const teamName = (teamId: string) => teams.find((t) => t.id === teamId)?.team_name ?? "—";

  return (
    <div className="min-h-screen">
      <NavBar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="font-display text-2xl font-bold mb-1">Matches</h1>
        {tournament && <p className="text-white/50 text-sm mb-6">{tournament.name}</p>}

        {matches.length === 0 ? (
          <p className="text-white/50 py-10 text-center">No matches have been created yet.</p>
        ) : (
          <div className="space-y-3">
            {matches.map((m) => {
              const mResults = results
                .filter((r) => r.match_id === m.id)
                .sort((a, b) => (a.placement ?? 99) - (b.placement ?? 99));
              const isOpen = openMatch === m.id;
              return (
                <div key={m.id} className="glass rounded-xl overflow-hidden">
                  <button
                    onClick={() => setOpenMatch(isOpen ? null : m.id)}
                    className="w-full flex items-center justify-between px-5 py-4 text-left"
                  >
                    <div>
                      <div className="font-display font-semibold">MATCH {m.match_number}</div>
                      <div className="text-xs text-white/40">{m.map ?? "Map TBD"}</div>
                    </div>
                    <span className={`text-xs font-display font-semibold uppercase px-3 py-1 rounded-full border ${statusColor[m.status]}`}>
                      {m.status}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="border-t border-line px-5 py-4 overflow-x-auto">
                      {mResults.length === 0 ? (
                        <p className="text-white/40 text-sm">No results entered yet.</p>
                      ) : (
                        <table className="w-full text-sm text-left">
                          <thead className="text-white/40 text-xs uppercase">
                            <tr><th className="py-1">Rank</th><th>Team</th><th className="text-center">Placement</th><th className="text-center">Kills</th><th className="text-center">Points</th></tr>
                          </thead>
                          <tbody>
                            {mResults.map((r, i) => (
                              <tr key={r.id} className="border-t border-line/60">
                                <td className="py-1.5">#{i + 1}</td>
                                <td>{teamName(r.team_id)}</td>
                                <td className="text-center">{r.placement ?? "—"}</td>
                                <td className="text-center">{r.kills}</td>
                                <td className="text-center font-semibold">{r.total_points}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
