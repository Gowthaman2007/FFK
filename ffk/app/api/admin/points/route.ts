import { NextResponse } from "next/server";
import { adminClient, requireAdminSession } from "@/lib/admin-server";

export async function POST(req: Request) {
  if (!(await requireAdminSession())) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    const tournamentId = String(body.tournament_id ?? "");
    const rules = Array.isArray(body.rules) ? body.rules : [];
    const killValue = Number(body.kill_point_value);

    if (!tournamentId || !Number.isFinite(killValue) || killValue < 0) {
      return NextResponse.json({ ok: false, error: "Invalid point settings." }, { status: 400 });
    }

    const supabase = adminClient();
    if (rules.length > 0) {
      const rows = rules
        .map((r: any) => ({ tournament_id: tournamentId, placement: Number(r.placement), points: Number(r.points) }))
        .filter((r: any) => Number.isInteger(r.placement) && r.placement > 0 && Number.isFinite(r.points) && r.points >= 0);

      if (rows.length > 0) {
        const { error } = await supabase.from("scoring_rules").upsert(rows, { onConflict: "tournament_id,placement" });
        if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
      }
    }

    const { error: settingsError } = await supabase
      .from("tournament_settings")
      .upsert({ tournament_id: tournamentId, kill_point_value: killValue }, { onConflict: "tournament_id" });

    if (settingsError) return NextResponse.json({ ok: false, error: settingsError.message }, { status: 400 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Save points error:", error);
    return NextResponse.json({ ok: false, error: "Unable to save point settings." }, { status: 500 });
  }
}
