"use client";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { NavBar } from "@/components/NavBar";
import { LiveBadge } from "@/components/LiveBadge";
import { LeaderboardTable } from "@/components/LeaderboardTable";
import { useCurrentTournamentId } from "@/lib/hooks/useCurrentTournamentId";
import { useLiveTournament } from "@/lib/hooks/useLiveTournament";
import { AnimatePresence, motion } from "framer-motion";

function LiveContent() {
  const searchParams = useSearchParams();
  const override = searchParams.get("t");
  const { id: currentId } = useCurrentTournamentId();
  const id = override || currentId;
  const { tournament, leaderboard, status, lastChange } = useLiveTournament(id);

  return (
    <div className="min-h-screen">
      <NavBar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-2 font-display text-2xl font-bold">
              🔴 FFK WARS LIVE
            </div>
            {tournament && <div className="text-white/60 text-sm mt-1">{tournament.name} · MATCH {tournament.current_match}/{tournament.total_matches}</div>}
          </div>
          <LiveBadge status={status} />
        </div>

        <div className="mt-6">
          <h2 className="font-display text-lg font-semibold text-white/70 mb-3">LIVE POINTS TABLE</h2>
          <LeaderboardTable rows={leaderboard} />
        </div>
      </div>

      <AnimatePresence>
        {lastChange && (
          <motion.div
            key={`${lastChange.teamId}-${lastChange.after}`}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 glass rounded-xl px-5 py-3 border border-accent2/40"
          >
            <div className="text-xs text-accent2 font-display font-semibold">⚡ SCORE UPDATED</div>
            <div className="font-display font-bold">
              {lastChange.before} → {lastChange.after} <span className="text-accent2">+{lastChange.after - lastChange.before}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function LivePage() {
  return (
    <Suspense fallback={null}>
      <LiveContent />
    </Suspense>
  );
}
