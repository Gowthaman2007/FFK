"use client";
import Image from "next/image";
import { NavBar } from "@/components/NavBar";
import { useCurrentTournamentId } from "@/lib/hooks/useCurrentTournamentId";
import { useLiveTournament } from "@/lib/hooks/useLiveTournament";

export default function TeamsPage() {
  const { id } = useCurrentTournamentId();
  const { tournament, leaderboard } = useLiveTournament(id);

  return (
    <div className="min-h-screen">
      <NavBar />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="font-display text-2xl font-bold mb-1">Teams</h1>
        {tournament && <p className="text-white/50 text-sm mb-6">{tournament.name}</p>}

        {leaderboard.length === 0 ? (
          <p className="text-white/50 py-10 text-center">No teams have been added to this tournament yet.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {leaderboard.map((t, i) => (
              <div key={t.team_id} className="glass rounded-xl p-4 flex items-center gap-4">
                <div className="h-14 w-14 rounded-lg bg-panel2 flex items-center justify-center overflow-hidden shrink-0">
                  {t.logo_url ? (
                    <Image src={t.logo_url} alt={t.team_name} width={56} height={56} className="object-cover h-full w-full" />
                  ) : (
                    <span className="font-display font-bold text-lg text-white/60">{t.team_code.slice(0, 3).toUpperCase()}</span>
                  )}
                </div>
                <div>
                  <div className="font-display font-semibold">{t.team_name}</div>
                  <div className="text-xs text-white/40">{t.team_code}</div>
                  <div className="text-xs text-white/50 mt-1">Rank #{i + 1} · {t.total_points} pts</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
