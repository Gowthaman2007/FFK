"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { NavBar } from "@/components/NavBar";
import { createClient } from "@/lib/supabase/client";
import { Tournament } from "@/lib/types";

export default function HistoryPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("tournaments")
      .select("*")
      .eq("status", "completed")
      .order("date", { ascending: false })
      .then(({ data }) => setTournaments((data as Tournament[]) ?? []));
  }, []);

  return (
    <div className="min-h-screen">
      <NavBar />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="font-display text-2xl font-bold mb-6">Tournament History</h1>
        {tournaments.length === 0 ? (
          <p className="text-white/50 py-10 text-center">No completed tournaments yet.</p>
        ) : (
          <div className="space-y-3">
            {tournaments.map((t) => (
              <Link key={t.id} href={`/live?t=${t.id}`} className="glass rounded-xl px-5 py-4 flex items-center justify-between hover:bg-white/5 transition-colors block">
                <div>
                  <div className="font-display font-semibold">{t.name}</div>
                  <div className="text-xs text-white/40">{new Date(t.date).toLocaleDateString(undefined, { day: "2-digit", month: "long", year: "numeric" })}</div>
                </div>
                <span className="text-white/40 text-sm">View final table →</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
