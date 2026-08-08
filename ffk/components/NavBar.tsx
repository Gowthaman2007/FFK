import Link from "next/link";

export function NavBar() {
  return (
    <header className="sticky top-0 z-40 glass border-b border-line">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="font-display font-bold text-xl tracking-wide">
          FFK <span className="text-gradient">WARS</span>
        </Link>
        <nav className="flex items-center gap-4 text-sm font-medium text-white/70">
          <Link href="/live" className="hover:text-white transition-colors">Live</Link>
          <Link href="/teams" className="hover:text-white transition-colors">Teams</Link>
          <Link href="/matches" className="hover:text-white transition-colors">Matches</Link>
          <Link href="/history" className="hover:text-white transition-colors">History</Link>
        </nav>
      </div>
    </header>
  );
}
