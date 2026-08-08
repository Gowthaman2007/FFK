import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { COOKIE_NAME, isValidAdminSession } from "@/lib/admin-auth";

export async function requireAdminSession() {
  const token = cookies().get(COOKIE_NAME)?.value;
  return isValidAdminSession(token);
}

export function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase service role environment variables are not configured.");
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
}
