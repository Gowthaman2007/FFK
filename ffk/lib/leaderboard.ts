import { LeaderboardRow, MatchResult, Team } from "./types";

// Sort order per spec: total points -> kill points -> total kills -> placement points
export function rankLeaderboard(rows: LeaderboardRow[]): LeaderboardRow[] {
  return [...rows].sort((a, b) => {
    if (b.total_points !== a.total_points) return b.total_points - a.total_points;
    if (b.kill_points !== a.kill_points) return b.kill_points - a.kill_points;
    if (b.kills !== a.kills) return b.kills - a.kills;
    return b.placement_points - a.placement_points;
  });
}

export function buildLeaderboard(teams: Team[], results: MatchResult[]): LeaderboardRow[] {
  const byTeam = new Map<string, LeaderboardRow>();
  for (const t of teams) {
    byTeam.set(t.id, {
      team_id: t.id,
      team_name: t.team_name,
      team_code: t.team_code,
      logo_url: t.logo_url,
      matches_played: 0,
      kills: 0,
      placement_points: 0,
      kill_points: 0,
      total_points: 0
    });
  }
  for (const r of results) {
    const row = byTeam.get(r.team_id);
    if (!row) continue;
    row.matches_played += 1;
    row.kills += r.kills || 0;
    row.placement_points += r.placement_points || 0;
    row.kill_points += r.kill_points || 0;
    row.total_points += r.total_points || 0;
  }
  return rankLeaderboard(Array.from(byTeam.values()));
}
