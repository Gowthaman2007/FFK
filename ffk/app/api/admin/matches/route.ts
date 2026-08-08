import { NextResponse } from "next/server";
import { adminClient, requireAdminSession } from "@/lib/admin-server";

export async function POST(req: Request) {
  if (!(await requireAdminSession())) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    const tournamentId = String(body.tournament_id ?? "");
    const matchNumber = Number(body.match_number);
    const map = String(body.map ?? "").trim();

    if (!tournamentId) return NextResponse.json({ ok: false, error: "Select a tournament first." }, { status: 400 });
    if (!Number.isInteger(matchNumber) || matchNumber < 1) {
      return NextResponse.json({ ok: false, error: "Match number must be a positive whole number." }, { status: 400 });
    }

    const { data, error } = await adminClient()
      .from("matches")
      .insert({ tournament_id: tournamentId, match_number: matchNumber, map: map || null, status: "upcoming" })
      .select()
      .single();

    if (error) {
      const message = error.code === "23505"
        ? `Match ${matchNumber} already exists for this tournament.`
        : error.message;
      return NextResponse.json({ ok: false, error: message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, match: data });
  } catch (error) {
    console.error("Create match error:", error);
    return NextResponse.json({ ok: false, error: "Unable to create match." }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  if (!(await requireAdminSession())) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    const id = String(body.id ?? "");
    const status = String(body.status ?? "");
    const tournamentId = String(body.tournament_id ?? "");
    const matchNumber = Number(body.match_number);

    if (!id || !["upcoming", "live", "completed"].includes(status)) {
      return NextResponse.json({ ok: false, error: "Invalid match update." }, { status: 400 });
    }

    const patch: Record<string, unknown> = { status };
    if (status === "live") patch.start_time = new Date().toISOString();
    if (status === "completed") patch.end_time = new Date().toISOString();

    const supabase = adminClient();
    const { error } = await supabase.from("matches").update(patch).eq("id", id);
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 });

    if (status === "live" && tournamentId && Number.isInteger(matchNumber)) {
      const { error: tournamentError } = await supabase
        .from("tournaments")
        .update({ current_match: matchNumber, status: "live" })
        .eq("id", tournamentId);
      if (tournamentError) return NextResponse.json({ ok: false, error: tournamentError.message }, { status: 400 });
    }

    if (status === "completed" && tournamentId) {
      await supabase.from("tournaments").update({ status: "completed" }).eq("id", tournamentId);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Update match error:", error);
    return NextResponse.json({ ok: false, error: "Unable to update match." }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  if (!(await requireAdminSession())) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    const id = String(body.id ?? "");
    if (!id) return NextResponse.json({ ok: false, error: "Match ID is required." }, { status: 400 });

    const { error } = await adminClient().from("matches").delete().eq("id", id);
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Delete match error:", error);
    return NextResponse.json({ ok: false, error: "Unable to delete match." }, { status: 500 });
  }
}
