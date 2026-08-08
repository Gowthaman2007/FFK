"use client";
import { useEffect, useMemo, useState } from "react";
import { AdminNav } from "@/components/AdminNav";
import { createClient } from "@/lib/supabase/client";
import { buildLeaderboard } from "@/lib/leaderboard";
import { Match, MatchResult, ScoringRule, Team, Tournament } from "@/lib/types";

type Row = { team_id: string; placement: number; kills: number };

export default function LiveScoreControl() {
  const supabase = createClient();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [tournamentId, setTournamentId] = useState("");
  const [matches, setMatches] = useState<Match[]>([]);
  const [matchId, setMatchId] = useState("");
  const [teams, setTeams] = useState<Team[]>([]);
  const [allResults, setAllResults] = useState<MatchResult[]>([]);
  const [rules, setRules] = useState<ScoringRule[]>([]);
  const [killValue, setKillValue] = useState(1);
  const [rows, setRows] = useState<Record<string, Row>>({});
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  useEffect(() => {
    supabase.from("tournaments").select("*").order("created_at", { ascending: false }).then(({ data }) => {
      setTournaments((data as Tournament[]) ?? []);
      if (data && data.length > 0) setTournamentId(data[0].id);
    });
  }, []);

  useEffect(() => {
    if (!tournamentId) return;
    supabase.from("teams").select("*").eq("tournament_id", tournamentId).order("created_at").then(({ data }) => setTeams((data as Team[]) ?? []));
    supabase.from("matches").select("*").eq("tournament_id", tournamentId).order("match_number").then(({ data }) => {
      const ms = (data as Match[]) ?? [];
      setMatches(ms);
      const live = ms.find((m) => m.status === "live") ?? ms[0];
      if (live) setMatchId(live.id);
    });
    supabase.from("scoring_rules").select("*").eq("tournament_id", tournamentId).then(({ data }) => setRules((data as ScoringRule[]) ?? []));
    supabase.from("tournament_settings").select("*").eq("tournament_id", tournamentId).maybeSingle().then(({ data }) => setKillValue(data?.kill_point_value ?? 1));
  }, [tournamentId]);

  async function loadAllResults() {
    if (!tournamentId) return;
    const { data } = await supabase.from("match_results").select("*, matches!inner(tournament_id)").eq("matches.tournament_id", tournamentId);
    setAllResults((data as MatchResult[]) ?? []);
  }
  useEffect(() => { loadAllResults(); }, [tournamentId]);

  useEffect(() => {
    if (!matchId) return;
    supabase.from("match_results").select("*").eq("match_id", matchId).then(({ data }) => {
      const map: Record<string, Row> = {};
      teams.forEach((t) => {
        const existing = (data as MatchResult[] ?? []).find((r) => r.team_id === t.id);
        map[t.id] = { team_id: t.id, placement: existing?.placement ?? 0, kills: existing?.kills ?? 0 };
      });
      setRows(map);
    });
  }, [matchId, teams]);

  function placementPoints(placement: number) {
    return rules.find((r) => r.placement === placement)?.points ?? 0;
  }

  function update(teamId: string, field: "placement" | "kills", value: number) {
    setRows((prev) => ({ ...prev, [teamId]: { ...prev[teamId], [field]: value } }));
  }

  async function saveAll() {
    setSaving(true);
    const payload = Object.values(rows).map((r) => ({
      team_id: r.team_id,
      placement: r.placement || null,
      kills: r.kills || 0
    }));

    try {
      const res = await fetch("/api/admin/live", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ match_id: matchId, rows: payload })
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        alert(data.error ?? "Save failed.");
        return;
      }
      setSavedAt(new Date().toLocaleTimeString());
      loadAllResults();
    } catch {
      alert("Network error while saving results.");
    } finally {
      setSaving(false);
    }
  }


  // Live preview leaderboard = saved results for OTHER matches + rows being edited for this match
  const previewLeaderboard = useMemo(() => {
    const others = allResults.filter((r) => r.match_id !== matchId);
    const draftAsResults: MatchResult[] = Object.values(rows).map((r) => {
      const pp = placementPoints(r.placement);
      const kp = r.kills * killValue;
      return {
        id: `draft-${r.team_id}`, match_id: matchId, team_id: r.team_id,
        placement: r.placement, kills: r.kills, placement_points: pp, kill_points: kp,
        total_points: pp + kp, updated_at: new Date().toISOString()
      };
    });
    return buildLeaderboard(teams, [...others, ...draftAsResults]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, allResults, teams, rules, killValue, matchId]);

  return (
    <div className="min-h-screen">
      <AdminNav />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="font-display text-2xl font-bold mb-4">Live Score Control</h1>

        <div className="flex flex-wrap gap-3 mb-6">
          <select value={tournamentId} onChange={(e) => setTournamentId(e.target.value)} className="rounded-lg bg-panel2 border border-line px-3 py-2">
            {tournaments.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <select value={matchId} onChange={(e) => setMatchId(e.target.value)} className="rounded-lg bg-panel2 border border-line px-3 py-2">
            {matches.map((m) => <option key={m.id} value={m.id}>MATCH {m.match_number} ({m.status})</option>)}
          </select>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 overflow-x-auto rounded-xl border border-line">
            <table className="w-full text-left text-sm">
              <thead className="bg-panel2 text-xs uppercase tracking-wider text-white/50">
                <tr>
                  <th className="px-3 py-2">Team</th>
                  <th className="px-3 py-2 text-center">Placement</th>
                  <th className="px-3 py-2 text-center">Kills</th>
                  <th className="px-3 py-2 text-center">Placement Pts</th>
                  <th className="px-3 py-2 text-center">Kill Pts</th>
                  <th className="px-3 py-2 text-center">Total</th>
                </tr>
              </thead>
              <tbody>
                {teams.map((t) => {
                  const r = rows[t.id] ?? { team_id: t.id, placement: 0, kills: 0 };
                  const pp = placementPoints(r.placement);
                  const kp = r.kills * killValue;
                  return (
                    <tr key={t.id} className="border-t border-line">
                      <td className="px-3 py-2 font-medium">{t.team_name}</td>
                      <td className="px-3 py-2 text-center">
                        <input type="number" min={0} value={r.placement || ""} onChange={(e) => update(t.id, "placement", +e.target.value)}
                          className="w-16 text-center rounded-md bg-panel2 border border-line px-1 py-1" />
                      </td>
                      <td className="px-3 py-2 text-center">
                        <input type="number" min={0} value={r.kills || ""} onChange={(e) => update(t.id, "kills", +e.target.value)}
                          className="w-16 text-center rounded-md bg-panel2 border border-line px-1 py-1" />
                      </td>
                      <td className="px-3 py-2 text-center text-white/60">{pp}</td>
                      <td className="px-3 py-2 text-center text-white/60">{kp}</td>
                      <td className="px-3 py-2 text-center font-display font-bold">{pp + kp}</td>
                    </tr>
                  );
                })}
                {teams.length === 0 && (
                  <tr><td colSpan={6} className="text-center py-8 text-white/40">No teams in this tournament yet.</td></tr>
                )}
              </tbody>
            </table>
            {teams.length > 0 && (
              <div className="p-3 border-t border-line flex items-center gap-3">
                <button disabled={saving} onClick={saveAll} className="rounded-lg bg-accent px-5 py-2.5 font-display font-semibold text-sm disabled:opacity-50">
                  {saving ? "SAVING..." : "SAVE ALL RESULTS"}
                </button>
                {savedAt && <span className="text-xs text-white/40">Saved at {savedAt}</span>}
              </div>
            )}
          </div>

          <div className="glass rounded-xl p-4 h-fit">
            <h2 className="font-display font-semibold text-sm text-white/70 mb-3">LIVE PREVIEW</h2>
            <div className="space-y-1.5">
              {previewLeaderboard.map((r, i) => (
                <div key={r.team_id} className="flex items-center justify-between text-sm">
                  <span>{i + 1}. {r.team_name}</span>
                  <span className="font-display font-bold">{r.total_points}</span>
                </div>
              ))}
              {previewLeaderboard.length === 0 && <p className="text-white/40 text-xs">No teams yet.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
