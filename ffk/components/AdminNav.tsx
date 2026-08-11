"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const links = [
  ["/admin/dashboard", "Dashboard"],
  ["/admin/tournaments", "Tournaments"],
  ["/admin/teams", "Teams"],
  ["/admin/matches", "Matches"],
  ["/admin/points", "Point Settings"],
  ["/admin/live", "Live Score Control"]
];

export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.07] bg-black/55 backdrop-blur-2xl">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
        <Link href="/admin/dashboard" className="shrink-0 font-display font-bold tracking-wide">
          FFK <span className="text-gradient">WARS</span>
          <span className="ml-2 hidden sm:inline text-xs text-white/35 font-medium">ADMIN</span>
        </Link>

        <nav className="flex items-center gap-1 text-sm overflow-x-auto">
          {links.map(([href, label]) => (
            <Link
              key={href}
              href={href}
              className={`whitespace-nowrap rounded-lg px-3 py-2 transition-all ${
                pathname === href
                  ? "text-white bg-white/[0.09] border border-white/[0.08] shadow-[0_0_22px_rgba(255,59,48,.08)]"
                  : "text-white/55 hover:text-white hover:bg-white/[0.05]"
              }`}
            >
              {label}
            </Link>
          ))}
          <button
            onClick={logout}
            className="whitespace-nowrap rounded-lg px-3 py-2 text-white/45 hover:text-live hover:bg-live/10 text-xs"
          >
            Logout
          </button>
        </nav>
      </div>
    </header>
  );
}
