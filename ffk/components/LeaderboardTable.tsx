"use client";
import { AnimatePresence, motion } from "framer-motion";
import { LeaderboardRow } from "@/lib/types";

const medal = (rank: number) => (rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : null);

export function LeaderboardTable({ rows, compact = false }: { rows: LeaderboardRow[]; compact?: boolean }) {
  if (rows.length === 0) {
    return (
      <div className="glass rounded-2xl border border-white/[0.07] px-6 py-12 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-white/[0.05] text-xl">🏆</div>
        <p className="font-display font-semibold text-white/75">No teams yet</p>
        <p className="mt-1 text-sm text-white/40">Teams will appear here once they are added.</p>
      </div>
    );
  }

  return (
    <>
      <div className="hidden sm:block overflow-x-auto rounded-2xl border border-white/[0.08] bg-black/20 shadow-[0_20px_60px_rgba(0,0,0,.2)]">
        <table className="w-full text-left">
          <thead className="bg-white/[0.035] text-[11px] uppercase tracking-[0.14em] text-white/45">
            <tr>
              <th className="px-4 py-4">Rank</th>
              <th className="px-4 py-4">Team</th>
              <th className="px-4 py-4 text-center">Matches</th>
              <th className="px-4 py-4 text-center">Kills</th>
              <th className="px-4 py-4 text-center">Placement Pts</th>
              <th className="px-4 py-4 text-center">Kill Pts</th>
              <th className="px-4 py-4 text-center">Total</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence initial={false}>
              {rows.map((r, i) => (
                <motion.tr
                  key={r.team_id}
                  layout
                  layoutId={r.team_id}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className={`border-t border-white/[0.06] ${i === 0 ? "bg-gradient-to-r from-accent/10 via-transparent to-transparent" : i < 3 ? "bg-white/[0.018]" : ""}`}
                >
                  <td className="px-4 py-4 font-display font-bold text-lg">
                    <span className={i === 0 ? "drop-shadow-[0_0_10px_rgba(255,209,102,.25)]" : ""}>
                      {medal(i + 1) ?? `#${i + 1}`}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="font-display font-bold tracking-wide">{r.team_name}</div>
                    <div className="text-xs text-white/35 mt-0.5">{r.team_code}</div>
                  </td>
                  <td className="px-4 py-4 text-center text-white/65">{r.matches_played}</td>
                  <td className="px-4 py-4 text-center text-white/65">{r.kills}</td>
                  <td className="px-4 py-4 text-center text-white/65">{r.placement_points}</td>
                  <td className="px-4 py-4 text-center text-white/65">{r.kill_points}</td>
                  <td className="px-4 py-4 text-center">
                    <span className="font-display text-2xl font-bold text-gradient">{r.total_points}</span>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      <div className="sm:hidden space-y-2.5">
        <AnimatePresence initial={false}>
          {rows.map((r, i) => (
            <motion.div
              key={r.team_id}
              layout
              layoutId={`m-${r.team_id}`}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className={`glass rounded-2xl p-4 flex items-center justify-between gap-3 ${
                i === 0 ? "border-accent/25 bg-accent/[0.055]" : ""
              }`}
            >
              <div className="min-w-0">
                <div className="font-display font-bold text-lg truncate">
                  {medal(i + 1) ?? `#${i + 1}`} {r.team_name}
                </div>
                <div className="text-xs text-white/45 mt-1">
                  Kills: {r.kills} · Placement: {r.placement_points} · Matches: {r.matches_played}
                </div>
              </div>
              <div className="shrink-0 text-right">
                <div className="text-[10px] uppercase tracking-wider text-white/35">Points</div>
                <div className="text-2xl font-display font-bold text-gradient">{r.total_points}</div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </>
  );
}
