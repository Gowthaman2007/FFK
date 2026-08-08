"use client";
import { useEffect, useState } from "react";
import { AdminNav } from "@/components/AdminNav";
import { createClient } from "@/lib/supabase/client";
import { Team, Tournament } from "@/lib/types";

export default function TeamsAdmin() {
  const supabase = createClient();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [tournamentId, setTournamentId] = useState<string>("");
  const [teams, setTeams] = useState<Team[]>([]);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    supabase.from("tournaments").select("*").order("created_at", { ascending: false }).then(({ data }) => {
      setTournaments((data as Tournament[]) ?? []);
      if (data && data.length > 0) setTournamentId(data[0].id);
    });
  }, []);

  async function loadTeams(tid: string) {
    const { data } = await supabase.from("teams").select("*").eq("tournament_id", tid).order("created_at");
    setTeams((data as Team[]) ?? []);
  }
  useEffect(() => { if (tournamentId) loadTeams(tournamentId); }, [tournamentId]);

  async function addTeam() {
    if (!name || !code || !tournamentId) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append("tournament_id", tournamentId);
      form.append("team_name", name);
      form.append("team_code", code);
      if (file) form.append("file", file);

      const res = await fetch(editingId ? "/api/admin/teams" : "/api/admin/teams", {
        method: editingId ? "PATCH" : "POST",
        body: editingId ? (() => {
          form.append("id", editingId);
          return form;
        })() : form
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        alert(data.error ?? "Could not save team.");
        return;
      }

      setName("");
      setCode("");
      setFile(null);
      setEditingId(null);
      loadTeams(tournamentId);
    } catch {
      alert("Network error while saving the team.");
    } finally {
      setUploading(false);
    }
  }

  function edit(t: Team) {
    setName(t.team_name); setCode(t.team_code); setEditingId(t.id);
  }

  async function remove(id: string) {
    if (!confirm("Delete this team? Its match results will be removed too.")) return;
    const res = await fetch("/api/admin/teams", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id })
    });
    const data = await res.json();
    if (!res.ok || !data.ok) {
      alert(data.error ?? "Could not delete team.");
      return;
    }
    loadTeams(tournamentId);
  }


  return (
    <div className="min-h-screen">
      <AdminNav />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="font-display text-2xl font-bold mb-4">Teams</h1>

        <select value={tournamentId} onChange={(e) => setTournamentId(e.target.value)} className="mb-6 rounded-lg bg-panel2 border border-line px-3 py-2">
          {tournaments.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>

        <div className="glass rounded-xl p-5 mb-6 space-y-3">
          <div className="grid sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-white/50">Team Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} className="w-full mt-1 rounded-lg bg-panel2 border border-line px-3 py-2 outline-none focus:border-accent" />
            </div>
            <div>
              <label className="text-xs text-white/50">Team Code / ID</label>
              <input value={code} onChange={(e) => setCode(e.target.value)} className="w-full mt-1 rounded-lg bg-panel2 border border-line px-3 py-2 outline-none focus:border-accent" />
            </div>
            <div>
              <label className="text-xs text-white/50">Team Logo (optional)</label>
              <input type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="w-full mt-1 text-xs" />
            </div>
          </div>
          <button disabled={uploading} onClick={addTeam} className="rounded-lg bg-accent px-4 py-2 font-display font-semibold text-sm disabled:opacity-50">
            {uploading ? "Uploading..." : editingId ? "SAVE CHANGES" : "ADD TEAM"}
          </button>
        </div>

        {teams.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-white/50 mb-3">No teams added yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {teams.map((t) => (
              <div key={t.id} className="glass rounded-xl p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-panel2 flex items-center justify-center overflow-hidden">
                    {t.logo_url ? <img src={t.logo_url} className="h-full w-full object-cover" /> : <span className="text-xs font-bold">{t.team_code.slice(0,3).toUpperCase()}</span>}
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{t.team_name}</div>
                    <div className="text-xs text-white/40">{t.team_code}</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => edit(t)} className="text-xs px-3 py-1.5 rounded-md border border-line">EDIT</button>
                  <button onClick={() => remove(t.id)} className="text-xs px-3 py-1.5 rounded-md border border-live/40 text-live">DELETE</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
