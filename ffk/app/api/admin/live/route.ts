import { NextResponse } from "next/server";
import { adminClient, requireAdminSession } from "@/lib/admin-server";

export async function POST(req: Request) {
  if (!(await requireAdminSession())) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    const matchId = String(body.match_id ?? "");
    const rows = Array.isArray(body.rows) ? body.rows : [];

    if (!matchId) return NextResponse.json({ ok: false, error: "Match ID is required." }, { status: 400 });

    const payload = rows.map((r: any) => ({
      match_id: matchId,
      team_id: String(r.team_id),
      placement: Number(r.placement) > 0 ? Number(r.placement) : null,
      kills: Math.max(0, Number(r.kills) || 0)
    }));

    const supabase = adminClient();
    if (payload.length > 0) {
      const { error } = await supabase.from("match_results").upsert(payload, { onConflict: "match_id,team_id" });
      if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    }

    await supabase.from("audit_logs").insert({
      admin_id: null,
      action: "save_match_results",
      match_id: matchId,
      new_value: payload
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Save live results error:", error);
    return NextResponse.json({ ok: false, error: "Unable to save results." }, { status: 500 });
  }
}
