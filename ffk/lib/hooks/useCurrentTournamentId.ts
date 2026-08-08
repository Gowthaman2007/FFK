"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

// Picks the tournament public pages should show by default:
// prefer a LIVE one, otherwise the most recently created.
export function useCurrentTournamentId() {
  const [id, setId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const live = await supabase.from("tournaments").select("id").eq("status", "live").order("created_at", { ascending: false }).limit(1).maybeSingle();
      if (live.data) {
        setId(live.data.id);
      } else {
        const latest = await supabase.from("tournaments").select("id").order("created_at", { ascending: false }).limit(1).maybeSingle();
        setId(latest.data?.id ?? null);
      }
      setLoading(false);
    })();
  }, []);

  return { id, loading };
}
