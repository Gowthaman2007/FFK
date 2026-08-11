import Link from "next/link";

export function NavBar() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.07] bg-black/45 backdrop-blur-2xl">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
        <Link
          href="/"
          className="group flex items-center gap-2 font-display font-bold text-xl sm:text-2xl tracking-wide"
        >
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-accent2 text-sm shadow-[0_0_24px_rgba(255,59,48,.18)]">
            F
          </span>
          <span>
            FFK <span className="text-gradient">WARS</span>
          </span>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2 text-sm font-medium text-white/65 overflow-x-auto">
          <Link href="/live" className="whitespace-nowrap rounded-lg px-3 py-2 hover:bg-white/[0.06] hover:text-white">
            <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-live animate-pulseLive align-middle" />
            Live
          </Link>
          <Link href="/teams" className="whitespace-nowrap rounded-lg px-3 py-2 hover:bg-white/[0.06] hover:text-white">Teams</Link>
          <Link href="/matches" className="whitespace-nowrap rounded-lg px-3 py-2 hover:bg-white/[0.06] hover:text-white">Matches</Link>
          <Link href="/history" className="whitespace-nowrap rounded-lg px-3 py-2 hover:bg-white/[0.06] hover:text-white">History</Link>
        </nav>
      </div>
    </header>
  );
}
