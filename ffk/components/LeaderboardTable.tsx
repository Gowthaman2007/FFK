"use client";
import { AnimatePresence, motion } from "framer-motion";
import { LeaderboardRow } from "@/lib/types";

const medal = (rank: number) => (rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : null);

export function LeaderboardTable({ rows, compact = false }: { rows: LeaderboardRow[]; compact?: boolean }) {
  if (rows.length === 0) {
    return <p className="text-center text-white/50 py-10">No teams have been added to this tournament yet.</p>;
  }

  return (
    <>
      {/* Desktop / tablet table */}
      <div className="hidden sm:block overflow-x-auto rounded-xl border border-line">
        <table className="w-full text-left">
          <thead className="bg-panel2 text-xs uppercase tracking-wider text-white/50">
            <tr>
              <th className="px-4 py-3">Rank</th>
              <th className="px-4 py-3">Team</th>
              <th className="px-4 py-3 text-center">Matches</th>
              <th className="px-4 py-3 text-center">Kills</th>
              <th className="px-4 py-3 text-center">Placement Pts</th>
              <th className="px-4 py-3 text-center">Kill Pts</th>
              <th className="px-4 py-3 text-center">Total</th>
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
                  className={`border-t border-line ${i < 3 ? "bg-white/[0.03]" : ""}`}
                >
                  <td className="px-4 py-3 font-display font-bold text-lg">
                    {medal(i + 1) ?? `#${i + 1}`}
                  </td>
                  <td className="px-4 py-3 font-semibold">{r.team_name} <span className="text-white/40 font-normal">({r.team_code})</span></td>
                  <td className="px-4 py-3 text-center text-white/70">{r.matches_played}</td>
                  <td className="px-4 py-3 text-center text-white/70">{r.kills}</td>
                  <td className="px-4 py-3 text-center text-white/70">{r.placement_points}</td>
                  <td className="px-4 py-3 text-center text-white/70">{r.kill_points}</td>
                  <td className="px-4 py-3 text-center font-display text-xl font-bold text-gradient">{r.total_points}</td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="sm:hidden space-y-2">
        <AnimatePresence initial={false}>
          {rows.map((r, i) => (
            <motion.div
              key={r.team_id}
              layout
              layoutId={`m-${r.team_id}`}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="glass rounded-xl p-4 flex items-center justify-between"
            >
              <div>
                <div className="font-display font-bold text-lg">
                  {medal(i + 1) ?? `#${i + 1}`} {r.team_name}
                </div>
                <div className="text-xs text-white/50 mt-1">
                  Kills: {r.kills} · Placement: {r.placement_points} · Matches: {r.matches_played}
                </div>
              </div>
              <div className="text-2xl font-display font-bold text-gradient">{r.total_points}</div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </>
  );
}
