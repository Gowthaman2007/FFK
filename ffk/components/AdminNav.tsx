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
    <header className="glass border-b border-line sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between flex-wrap gap-2">
        <span className="font-display font-bold">FFK <span className="text-gradient">WARS</span> Admin</span>
        <nav className="flex items-center gap-3 text-sm overflow-x-auto">
          {links.map(([href, label]) => (
            <Link key={href} href={href} className={`whitespace-nowrap px-2 py-1 rounded-md transition-colors ${pathname === href ? "text-white bg-white/10" : "text-white/60 hover:text-white"}`}>
              {label}
            </Link>
          ))}
          <button onClick={logout} className="text-white/50 hover:text-live text-xs ml-2">Logout</button>
        </nav>
      </div>
    </header>
  );
}
