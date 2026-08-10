import { NextResponse } from "next/server";
import { adminClient, requireAdminSession } from "@/lib/admin-server";

export async function POST(req: Request) {
  if (!(await requireAdminSession())) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const matchId = String(body.match_id ?? "");
    const rows = Array.isArray(body.rows) ? body.rows : [];

    if (!matchId) {
      return NextResponse.json(
        { ok: false, error: "Match ID is required." },
        { status: 400 }
      );
    }

    const supabase = adminClient();

    // Get the tournament for this match
    const { data: match, error: matchError } = await supabase
      .from("matches")
      .select("tournament_id")
      .eq("id", matchId)
      .single();

    if (matchError || !match) {
      return NextResponse.json(
        { ok: false, error: "Match not found." },
        { status: 400 }
      );
    }

    // Get placement scoring rules
    const { data: scoringRules, error: rulesError } = await supabase
      .from("scoring_rules")
      .select("placement, points")
      .eq("tournament_id", match.tournament_id);

    if (rulesError) {
      return NextResponse.json(
        { ok: false, error: rulesError.message },
        { status: 400 }
      );
    }

    // Get kill point value
    const { data: settings, error: settingsError } = await supabase
      .from("tournament_settings")
      .select("kill_point_value")
      .eq("tournament_id", match.tournament_id)
      .maybeSingle();

    if (settingsError) {
      return NextResponse.json(
        { ok: false, error: settingsError.message },
        { status: 400 }
      );
    }

    const killPointValue = Number(settings?.kill_point_value ?? 1);

    const payload = rows.map((r: any) => {
      const placement =
        Number(r.placement) > 0 ? Number(r.placement) : null;

      const kills = Math.max(0, Number(r.kills) || 0);

      const placementPoints =
        placement === null
          ? 0
          : Number(
              scoringRules?.find(
                (rule) => Number(rule.placement) === placement
              )?.points ?? 0
            );

      const killPoints = kills * killPointValue;

      const totalPoints = placementPoints + killPoints;

      return {
        match_id: matchId,
        team_id: String(r.team_id),
        placement,
        kills,
        placement_points: placementPoints,
        kill_points: killPoints,
        total_points: totalPoints
      };
    });

    if (payload.length > 0) {
      const { error } = await supabase
        .from("match_results")
        .upsert(payload, {
          onConflict: "match_id,team_id"
        });

      if (error) {
        return NextResponse.json(
          { ok: false, error: error.message },
          { status: 400 }
        );
      }
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

    return NextResponse.json(
      { ok: false, error: "Unable to save results." },
      { status: 500 }
    );
  }
}
