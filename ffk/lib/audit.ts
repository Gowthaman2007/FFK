import { SupabaseClient } from "@supabase/supabase-js";

// Writes an audit_logs row. Called from the client after any score/team/
// tournament change made in the admin panel, so disputes can be resolved.
export async function logAudit(
  supabase: SupabaseClient,
  adminId: string | null,
  action: string,
  opts: { teamId?: string; matchId?: string; oldValue?: unknown; newValue?: unknown } = {}
) {
  await supabase.from("audit_logs").insert({
    admin_id: adminId,
    action,
    team_id: opts.teamId ?? null,
    match_id: opts.matchId ?? null,
    old_value: opts.oldValue ?? null,
    new_value: opts.newValue ?? null
  });
}
