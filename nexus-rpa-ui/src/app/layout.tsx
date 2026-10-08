import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nexus RPA Studio",
  description: "Enterprise Automation Platform by Zouhir",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* 7YEDNA BG-SLATE-900 BACH TAURI YKOUN TRANSPARENT 100% */}
      <body className="antialiased text-slate-50 bg-transparent">
        {children}
      </body>
    </html>
  );
}