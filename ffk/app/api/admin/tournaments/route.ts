import { NextResponse } from "next/server";
import { adminClient, requireAdminSession } from "@/lib/admin-server";

export async function POST(req: Request) {
  if (!(await requireAdminSession())) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    const name = String(body.name ?? "").trim();
    const number = Number(body.number);
    const date = String(body.date ?? "");
    const total_matches = Number(body.total_matches);

    if (!name || !date || !Number.isInteger(number) || number < 1 || !Number.isInteger(total_matches) || total_matches < 1) {
      return NextResponse.json({ ok: false, error: "Please enter valid tournament details." }, { status: 400 });
    }

    const supabase = adminClient();
    const { data: tournament, error } = await supabase
      .from("tournaments")
      .insert({ name, number, date, total_matches, status: "upcoming", current_match: 0 })
      .select()
      .single();

    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 });

    const { error: settingsError } = await supabase
      .from("tournament_settings")
      .insert({ tournament_id: tournament.id, kill_point_value: 1 });

    if (settingsError) {
      await supabase.from("tournaments").delete().eq("id", tournament.id);
      return NextResponse.json({ ok: false, error: settingsError.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, tournament });
  } catch (error) {
    console.error("Create tournament error:", error);
    return NextResponse.json({ ok: false, error: "Unable to create tournament." }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  if (!(await requireAdminSession())) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    const id = String(body.id ?? "");
    const patch: Record<string, unknown> = {};
    if (body.name !== undefined) patch.name = String(body.name).trim();
    if (body.number !== undefined) patch.number = Number(body.number);
    if (body.date !== undefined) patch.date = String(body.date);
    if (body.total_matches !== undefined) patch.total_matches = Number(body.total_matches);
    if (body.status !== undefined && ["upcoming", "live", "completed"].includes(String(body.status))) patch.status = body.status;

    if (!id || Object.keys(patch).length === 0) return NextResponse.json({ ok: false, error: "Invalid tournament update." }, { status: 400 });

    const { error } = await adminClient().from("tournaments").update(patch).eq("id", id);
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Update tournament error:", error);
    return NextResponse.json({ ok: false, error: "Unable to update tournament." }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  if (!(await requireAdminSession())) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ ok: false, error: "Tournament ID is required." }, { status: 400 });
    const { error } = await adminClient().from("tournaments").delete().eq("id", String(id));
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Delete tournament error:", error);
    return NextResponse.json({ ok: false, error: "Unable to delete tournament." }, { status: 500 });
  }
}
