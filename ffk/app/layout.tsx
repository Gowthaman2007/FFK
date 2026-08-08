import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FFK WARS — Live Tournament",
  description: "FFK WARS weekly Free Fire tournament — live points table, teams, matches and results."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body min-h-screen">{children}</body>
    </html>
  );
}
