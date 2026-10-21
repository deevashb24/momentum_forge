import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MomentumForge AI — Autonomous Blender 5.2 MCP to Godot 4.7 CI/CD Pipeline & Boilerplate",
  description:
    "Skip 300+ hours of trial-and-error. Production Blender MCP harnesses, KDTree 3D spline corridor validators, JSON scene contracts, and Godot 4.7 streaming runtimes verified on the 54.89 km Cerberus City benchmark.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#07080c] text-slate-100 selection:bg-[#06b6d4]/30 selection:text-[#38bdf8]">
        {children}
      </body>
    </html>
  );
}
