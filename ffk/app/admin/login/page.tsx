"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Login failed");
        return;
      }
      router.push("/admin/dashboard");
      router.refresh();
    } catch {
      setError("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <form onSubmit={submit} className="glass w-full max-w-sm rounded-2xl p-8 space-y-4">
        <h1 className="font-display text-2xl font-bold text-center">
          FFK <span className="text-gradient">WARS</span> Admin
        </h1>
        <div>
          <label className="text-xs text-white/50">Admin Username</label>
          <input value={username} onChange={(e) => setUsername(e.target.value)} required
            className="w-full mt-1 rounded-lg bg-panel2 border border-line px-3 py-2 outline-none focus:border-accent" />
        </div>
        <div>
          <label className="text-xs text-white/50">Password</label>
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required
            className="w-full mt-1 rounded-lg bg-panel2 border border-line px-3 py-2 outline-none focus:border-accent" />
        </div>
        {error && <p className="text-live text-sm">{error}</p>}
        <button disabled={loading} className="w-full rounded-lg bg-accent py-2.5 font-display font-semibold hover:bg-accent/80 transition-colors disabled:opacity-50">
          {loading ? "Signing in..." : "LOGIN"}
        </button>
      </form>
    </div>
  );
}
