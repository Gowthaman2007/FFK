"use client";
import { useEffect, useState } from "react";
import { AdminNav } from "@/components/AdminNav";
import { createClient } from "@/lib/supabase/client";
import { ScoringRule, Tournament } from "@/lib/types";

export default function PointsAdmin() {
  const supabase = createClient();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [tournamentId, setTournamentId] = useState("");
  const [rules, setRules] = useState<Record<number, number>>({});
  const [killValue, setKillValue] = useState(1);
  const [maxPlacement, setMaxPlacement] = useState(10);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    supabase.from("tournaments").select("*").order("created_at", { ascending: false }).then(({ data }) => {
      setTournaments((data as Tournament[]) ?? []);
      if (data && data.length > 0) setTournamentId(data[0].id);
    });
  }, []);

  useEffect(() => {
    if (!tournamentId) return;
    (async () => {
      const { data: rs } = await supabase.from("scoring_rules").select("*").eq("tournament_id", tournamentId).order("placement");
      const map: Record<number, number> = {};
      (rs as ScoringRule[] ?? []).forEach((r) => { map[r.placement] = r.points; });
      setRules(map);
      setMaxPlacement(Math.max(10, ...(rs ?? []).map((r) => r.placement)));

      const { data: settings } = await supabase.from("tournament_settings").select("*").eq("tournament_id", tournamentId).maybeSingle();
      setKillValue(settings?.kill_point_value ?? 1);
    })();
  }, [tournamentId]);

  async function saveAll() {
    const rows = Object.entries(rules).map(([placement, points]) => ({
      placement: Number(placement),
      points: Number(points)
    }));
    try {
      const res = await fetch("/api/admin/points", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tournament_id: tournamentId,
          rules,
          kill_point_value: killValue
        })
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        alert(data.error ?? "Could not save point settings.");
        return;
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      alert("Network error while saving point settings.");
    }
  }


  const placements = Array.from({ length: maxPlacement }, (_, i) => i + 1);

  return (
    <div className="min-h-screen">
      <AdminNav />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="font-display text-2xl font-bold mb-4">Point Settings</h1>
        <select value={tournamentId} onChange={(e) => setTournamentId(e.target.value)} className="mb-6 rounded-lg bg-panel2 border border-line px-3 py-2">
          {tournaments.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>

        <div className="glass rounded-xl p-5 mb-4">
          <h2 className="font-display font-semibold mb-3">Placement Points</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {placements.map((p) => (
              <div key={p} className="flex items-center gap-2">
                <label className="text-sm text-white/50 w-14">{p}{p===1?"st":p===2?"nd":p===3?"rd":"th"}</label>
                <input type="number" value={rules[p] ?? ""} onChange={(e) => setRules({ ...rules, [p]: +e.target.value })}
                  className="w-full rounded-lg bg-panel2 border border-line px-2 py-1.5 text-sm" />
              </div>
            ))}
          </div>
          <button onClick={() => setMaxPlacement(maxPlacement + 1)} className="text-xs text-white/50 mt-3 underline">+ Add another position</button>
        </div>

        <div className="glass rounded-xl p-5 mb-4">
          <h2 className="font-display font-semibold mb-3">Kill Points</h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-white/50">1 Kill =</span>
            <input type="number" value={killValue} onChange={(e) => setKillValue(+e.target.value)} className="w-24 rounded-lg bg-panel2 border border-line px-2 py-1.5" />
            <span className="text-sm text-white/50">Points</span>
          </div>
        </div>

        <button onClick={saveAll} className="rounded-lg bg-accent px-5 py-2.5 font-display font-semibold">SAVE POINT SETTINGS</button>
        {saved && <span className="ml-3 text-sm text-live">Saved.</span>}
      </div>
    </div>
  );
}
