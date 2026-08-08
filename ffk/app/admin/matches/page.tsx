"use client";
import { useEffect, useState } from "react";
import { AdminNav } from "@/components/AdminNav";
import { createClient } from "@/lib/supabase/client";
import { Match, Tournament } from "@/lib/types";

export default function MatchesAdmin() {
  const supabase = createClient();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [tournamentId, setTournamentId] = useState("");
  const [matches, setMatches] = useState<Match[]>([]);
  const [matchNumber, setMatchNumber] = useState(1);
  const [map, setMap] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.from("tournaments").select("*").order("created_at", { ascending: false }).then(({ data, error }) => {
      if (error) { alert("Could not load tournaments: " + error.message); return; }
      setTournaments((data as Tournament[]) ?? []);
      if (data && data.length > 0) setTournamentId(data[0].id);
    });
  }, []);

  async function load(tid: string) {
    const { data, error } = await supabase.from("matches").select("*").eq("tournament_id", tid).order("match_number");
    if (error) { alert("Could not load matches: " + error.message); return; }
    setMatches((data as Match[]) ?? []);
  }
  useEffect(() => { if (tournamentId) load(tournamentId); }, [tournamentId]);

  async function addMatch() {
    if (!tournamentId) { alert("Please create/select a tournament first."); return; }
    if (!Number.isInteger(matchNumber) || matchNumber < 1) { alert("Match number must be 1 or higher."); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/matches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tournament_id: tournamentId, match_number: matchNumber, map })
      });
      const data = await res.json();
      if (!res.ok || !data.ok) { alert(data.error ?? "Could not create match."); return; }
      setMatchNumber(matchNumber + 1);
      setMap("");
      await load(tournamentId);
    } catch (error) {
      alert("Network error while creating the match.");
    } finally {
      setLoading(false);
    }
  }

  async function setStatus(id: string, status: string) {
    const m = matches.find((x) => x.id === id);
    if (!m) return;
    const res = await fetch("/api/admin/matches", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status, tournament_id: tournamentId, match_number: m.match_number })
    });
    const data = await res.json();
    if (!res.ok || !data.ok) { alert(data.error ?? "Could not update match."); return; }
    load(tournamentId);
  }

  async function remove(id: string) {
    if (!confirm("Delete this match and its results?")) return;
    const res = await fetch("/api/admin/matches", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id })
    });
    const data = await res.json();
    if (!res.ok || !data.ok) { alert(data.error ?? "Could not delete match."); return; }
    load(tournamentId);
  }

  return (
    <div className="min-h-screen">
      <AdminNav />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="font-display text-2xl font-bold mb-4">Matches</h1>
        <select value={tournamentId} onChange={(e) => setTournamentId(e.target.value)} className="mb-6 rounded-lg bg-panel2 border border-line px-3 py-2">
          {tournaments.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>

        <div className="glass rounded-xl p-5 mb-6 flex flex-wrap gap-3 items-end">
          <div>
            <label className="text-xs text-white/50">Match Number</label>
            <input type="number" min="1" value={matchNumber} onChange={(e) => setMatchNumber(Number(e.target.value))} className="w-28 mt-1 block rounded-lg bg-panel2 border border-line px-3 py-2" />
          </div>
          <div>
            <label className="text-xs text-white/50">Map</label>
            <input value={map} onChange={(e) => setMap(e.target.value)} placeholder="Bermuda" className="mt-1 block rounded-lg bg-panel2 border border-line px-3 py-2" />
          </div>
          <button disabled={loading || !tournamentId} onClick={addMatch} className="rounded-lg bg-accent px-4 py-2.5 font-display font-semibold text-sm disabled:opacity-50">
            {loading ? "CREATING..." : "+ CREATE MATCH"}
          </button>
        </div>

        <div className="space-y-2">
          {matches.map((m) => (
            <div key={m.id} className="glass rounded-xl p-4 flex items-center justify-between flex-wrap gap-2">
              <div>
                <div className="font-display font-semibold">MATCH {m.match_number}</div>
                <div className="text-xs text-white/40">{m.map || "Map TBD"}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-display font-bold uppercase px-3 py-1 rounded-full ${m.status === "live" ? "bg-live/20 text-live" : m.status === "completed" ? "bg-white/10 text-white/60" : "bg-accent2/20 text-accent2"}`}>{m.status}</span>
                {m.status === "upcoming" && <button onClick={() => setStatus(m.id, "live")} className="text-xs px-3 py-1.5 rounded-md bg-live/20 text-live font-semibold">START</button>}
                {m.status === "live" && <button onClick={() => setStatus(m.id, "completed")} className="text-xs px-3 py-1.5 rounded-md bg-white/10 font-semibold">END</button>}
                <button onClick={() => remove(m.id)} className="text-xs px-3 py-1.5 rounded-md border border-live/40 text-live">DELETE</button>
              </div>
            </div>
          ))}
          {matches.length === 0 && <p className="text-white/50 text-center py-10">No matches yet.</p>}
        </div>
      </div>
    </div>
  );
}
