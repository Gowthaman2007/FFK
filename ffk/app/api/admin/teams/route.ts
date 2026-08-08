import { NextResponse } from "next/server";
import { adminClient, requireAdminSession } from "@/lib/admin-server";

function cleanName(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(req: Request) {
  if (!(await requireAdminSession())) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  try {
    const form = await req.formData();
    const tournamentId = cleanName(form.get("tournament_id"));
    const name = cleanName(form.get("team_name"));
    const code = cleanName(form.get("team_code"));
    const file = form.get("file");

    if (!tournamentId || !name || !code) {
      return NextResponse.json({ ok: false, error: "Team name, code and tournament are required." }, { status: 400 });
    }

    const supabase = adminClient();
    let logo_url: string | null = null;

    if (file instanceof File && file.size > 0) {
      if (file.size > 5 * 1024 * 1024) return NextResponse.json({ ok: false, error: "Logo must be 5MB or smaller." }, { status: 400 });
      const allowed = ["image/png", "image/jpeg", "image/webp"];
      if (!allowed.includes(file.type)) return NextResponse.json({ ok: false, error: "Logo must be PNG, JPG or WEBP." }, { status: 400 });

      const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
      const path = `${tournamentId}/${crypto.randomUUID()}.${ext}`;
      const buffer = new Uint8Array(await file.arrayBuffer());
      const { error: uploadError } = await supabase.storage.from("team-logos").upload(path, buffer, {
        contentType: file.type,
        upsert: false
      });
      if (uploadError) return NextResponse.json({ ok: false, error: uploadError.message }, { status: 400 });
      logo_url = supabase.storage.from("team-logos").getPublicUrl(path).data.publicUrl;
    }

    const { data, error } = await supabase
      .from("teams")
      .insert({ tournament_id: tournamentId, team_name: name, team_code: code, logo_url })
      .select()
      .single();

    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true, team: data });
  } catch (error) {
    console.error("Create team error:", error);
    return NextResponse.json({ ok: false, error: "Unable to create team." }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  if (!(await requireAdminSession())) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  try {
    const form = await req.formData();
    const id = cleanName(form.get("id"));
    const name = cleanName(form.get("team_name"));
    const code = cleanName(form.get("team_code"));
    const file = form.get("file");

    if (!id || !name || !code) return NextResponse.json({ ok: false, error: "Team ID, name and code are required." }, { status: 400 });

    const supabase = adminClient();
    const patch: Record<string, unknown> = { team_name: name, team_code: code };

    if (file instanceof File && file.size > 0) {
      const allowed = ["image/png", "image/jpeg", "image/webp"];
      if (file.size > 5 * 1024 * 1024 || !allowed.includes(file.type)) {
        return NextResponse.json({ ok: false, error: "Logo must be PNG, JPG or WEBP and 5MB or smaller." }, { status: 400 });
      }
      const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
      const tournamentId = cleanName(form.get("tournament_id"));
      const path = `${tournamentId || "teams"}/${crypto.randomUUID()}.${ext}`;
      const buffer = new Uint8Array(await file.arrayBuffer());
      const { error: uploadError } = await supabase.storage.from("team-logos").upload(path, buffer, { contentType: file.type, upsert: false });
      if (uploadError) return NextResponse.json({ ok: false, error: uploadError.message }, { status: 400 });
      patch.logo_url = supabase.storage.from("team-logos").getPublicUrl(path).data.publicUrl;
    }

    const { error } = await supabase.from("teams").update(patch).eq("id", id);
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Update team error:", error);
    return NextResponse.json({ ok: false, error: "Unable to update team." }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  if (!(await requireAdminSession())) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ ok: false, error: "Team ID is required." }, { status: 400 });
    const { error } = await adminClient().from("teams").delete().eq("id", String(id));
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Delete team error:", error);
    return NextResponse.json({ ok: false, error: "Unable to delete team." }, { status: 500 });
  }
}
