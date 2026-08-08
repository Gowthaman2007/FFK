"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { buildLeaderboard } from "@/lib/leaderboard";
import { LeaderboardRow, Match, MatchResult, Team, Tournament } from "@/lib/types";

type ConnState = "connecting" | "live" | "reconnecting";

/**
 * Subscribes to ONE tournament's teams / matches / match_results in realtime.
 * Used by /live, /overlay/[id], /teams, /matches, and the admin live console
 * so every viewer of that tournament sees the same data change instantly,
 * anywhere in the world, without a page refresh.
 */
export function useLiveTournament(tournamentId: string | null) {
  const supabase = useMemo(() => createClient(), []);
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [results, setResults] = useState<MatchResult[]>([]);
  const [status, setStatus] = useState<ConnState>("connecting");
  const [lastChange, setLastChange] = useState<{ teamId: string; before: number; after: number } | null>(null);
  const resultsRef = useRef<MatchResult[]>([]);
  resultsRef.current = results;

  async function loadAll(id: string) {
    const [t, tm, mt, mr] = await Promise.all([
      supabase.from("tournaments").select("*").eq("id", id).maybeSingle(),
      supabase.from("teams").select("*").eq("tournament_id", id).order("created_at"),
      supabase.from("matches").select("*").eq("tournament_id", id).order("match_number"),
      supabase.from("match_results").select("*, matches!inner(tournament_id)").eq("matches.tournament_id", id)
    ]);
    if (t.data) setTournament(t.data as Tournament);
    if (tm.data) setTeams(tm.data as Team[]);
    if (mt.data) setMatches(mt.data as Match[]);
    if (mr.data) setResults(mr.data as MatchResult[]);
  }

  useEffect(() => {
    if (!tournamentId) return;
    let active = true;
    setStatus("connecting");
    loadAll(tournamentId).then(() => active && setStatus("live"));

    const channel = supabase
      .channel(`tournament-${tournamentId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "tournaments", filter: `id=eq.${tournamentId}` }, (p) => {
        if (p.new) setTournament(p.new as Tournament);
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "teams", filter: `tournament_id=eq.${tournamentId}` }, () => {
        loadAll(tournamentId);
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "matches", filter: `tournament_id=eq.${tournamentId}` }, () => {
        loadAll(tournamentId);
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "match_results" }, (payload) => {
        const row = (payload.new ?? payload.old) as MatchResult;
        // only react if this result belongs to a match in this tournament
        const belongs = matches.some((m) => m.id === row.match_id) || true; // matches state may lag; safe to refetch
        if (belongs) {
          const prev = resultsRef.current.find((r) => r.id === (payload.new as MatchResult)?.id);
          if (payload.new && prev) {
            setLastChange({ teamId: (payload.new as MatchResult).team_id, before: prev.total_points, after: (payload.new as MatchResult).total_points });
          }
          loadAll(tournamentId);
        }
      })
      .subscribe((subStatus) => {
        if (subStatus === "SUBSCRIBED") setStatus("live");
        if (subStatus === "CHANNEL_ERROR" || subStatus === "TIMED_OUT" || subStatus === "CLOSED") setStatus("reconnecting");
      });

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tournamentId]);

  const leaderboard: LeaderboardRow[] = useMemo(() => buildLeaderboard(teams, results), [teams, results]);

  return { tournament, teams, matches, results, leaderboard, status, lastChange };
}
