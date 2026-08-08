"use client";
import { useEffect, useState } from "react";
import { AdminNav } from "@/components/AdminNav";
import { createClient } from "@/lib/supabase/client";
import { Tournament } from "@/lib/types";

const empty = { name: "", number: 1, date: "", total_matches: 6 };

export default function TournamentsAdmin() {
  const supabase = createClient();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  async function load() {
    const { data } = await supabase.from("tournaments").select("*").order("created_at", { ascending: false });
    setTournaments((data as Tournament[]) ?? []);
  }
  useEffect(() => { load(); }, []);

  async function save() {
    if (!form.name || !form.date) return;
    try {
      const res = await fetch("/api/admin/tournaments", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingId
          ? { id: editingId, name: form.name, number: form.number, date: form.date, total_matches: form.total_matches }
          : { name: form.name, number: form.number, date: form.date, total_matches: form.total_matches })
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        alert(data.error ?? "Could not save tournament.");
        return;
      }
      setForm(empty);
      setEditingId(null);
      setShowForm(false);
      load();
    } catch {
      alert("Network error while saving the tournament.");
    }
  }


  async function setStatus(id: string, status: string) {
    const res = await fetch("/api/admin/tournaments", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status })
    });
    const data = await res.json();
    if (!res.ok || !data.ok) {
      alert(data.error ?? "Could not update tournament.");
      return;
    }
    load();
  }


  async function remove(id: string) {
    if (!confirm("Delete this tournament and all its data? This cannot be undone.")) return;
    const res = await fetch("/api/admin/tournaments", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id })
    });
    const data = await res.json();
    if (!res.ok || !data.ok) {
      alert(data.error ?? "Could not delete tournament.");
      return;
    }
    load();
  }


  function edit(t: Tournament) {
    setForm({ name: t.name, number: t.number, date: t.date, total_matches: t.total_matches });
    setEditingId(t.id);
    setShowForm(true);
  }

  return (
    <div className="min-h-screen">
      <AdminNav />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display text-2xl font-bold">Tournaments</h1>
          <button onClick={() => { setForm(empty); setEditingId(null); setShowForm(true); }} className="rounded-lg bg-accent px-4 py-2 font-display font-semibold text-sm">+ CREATE TOURNAMENT</button>
        </div>

        {showForm && (
          <div className="glass rounded-xl p-5 mb-6 space-y-3">
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-white/50">Tournament Name</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="FFK WARS WEEKLY #28"
                  className="w-full mt-1 rounded-lg bg-panel2 border border-line px-3 py-2 outline-none focus:border-accent" />
              </div>
              <div>
                <label className="text-xs text-white/50">Tournament Number</label>
                <input type="number" value={form.number} onChange={(e) => setForm({ ...form, number: +e.target.value })}
                  className="w-full mt-1 rounded-lg bg-panel2 border border-line px-3 py-2 outline-none focus:border-accent" />
              </div>
              <div>
                <label className="text-xs text-white/50">Date</label>
                <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full mt-1 rounded-lg bg-panel2 border border-line px-3 py-2 outline-none focus:border-accent" />
              </div>
              <div>
                <label className="text-xs text-white/50">Number of Matches</label>
                <input type="number" value={form.total_matches} onChange={(e) => setForm({ ...form, total_matches: +e.target.value })}
                  className="w-full mt-1 rounded-lg bg-panel2 border border-line px-3 py-2 outline-none focus:border-accent" />
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={save} className="rounded-lg bg-accent px-4 py-2 font-display font-semibold text-sm">{editingId ? "SAVE CHANGES" : "CREATE"}</button>
              <button onClick={() => setShowForm(false)} className="rounded-lg border border-line px-4 py-2 font-display font-semibold text-sm">CANCEL</button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {tournaments.map((t) => (
            <div key={t.id} className="glass rounded-xl p-4 flex items-center justify-between flex-wrap gap-3">
              <div>
                <div className="font-display font-semibold">{t.name}</div>
                <div className="text-xs text-white/40">{new Date(t.date).toLocaleDateString()} · {t.total_matches} matches</div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-xs font-display font-bold uppercase px-3 py-1 rounded-full ${t.status === "live" ? "bg-live/20 text-live" : t.status === "completed" ? "bg-white/10 text-white/60" : "bg-accent2/20 text-accent2"}`}>{t.status}</span>
                {t.status === "upcoming" && <button onClick={() => setStatus(t.id, "live")} className="text-xs px-3 py-1.5 rounded-md bg-live/20 text-live font-semibold">START</button>}
                {t.status === "live" && <button onClick={() => setStatus(t.id, "completed")} className="text-xs px-3 py-1.5 rounded-md bg-white/10 font-semibold">END</button>}
                <button onClick={() => edit(t)} className="text-xs px-3 py-1.5 rounded-md border border-line">EDIT</button>
                <button onClick={() => remove(t.id)} className="text-xs px-3 py-1.5 rounded-md border border-live/40 text-live">DELETE</button>
              </div>
            </div>
          ))}
          {tournaments.length === 0 && <p className="text-white/50 text-center py-10">No tournaments yet.</p>}
        </div>
      </div>
    </div>
  );
}
