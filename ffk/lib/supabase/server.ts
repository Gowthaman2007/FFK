import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Server-side client used in Server Components / Route Handlers.
// Reads the user's session from cookies — never uses the service role key,
// so RLS (is_admin()) is enforced exactly as it would be for the browser.
export function createServerSupabase() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          try { cookieStore.set({ name, value, ...options }); } catch {}
        },
        remove(name: string, options: any) {
          try { cookieStore.set({ name, value: "", ...options }); } catch {}
        }
      }
    }
  );
}
