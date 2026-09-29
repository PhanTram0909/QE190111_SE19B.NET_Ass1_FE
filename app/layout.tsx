import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: { default: "TaskTrack", template: "%s | TaskTrack" },
  description: "Task & Team Management — Modern iOS Glassmorphic Design",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#07080d] text-slate-100 antialiased selection:bg-blue-500/30 selection:text-white relative">
        {/* Ambient iOS Glow Orbs */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-[140px]" />
          <div className="absolute top-1/4 -right-32 w-[450px] h-[450px] bg-purple-600/12 rounded-full blur-[140px]" />
          <div className="absolute -bottom-32 left-1/3 w-[550px] h-[550px] bg-indigo-600/10 rounded-full blur-[160px]" />
        </div>

        {/* Floating iOS Dynamic Island / Capsule Navbar */}
        <Navbar />

        {/* Main Content Area */}
        <main className="relative z-10 pt-28 pb-16 min-h-screen">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>

        <Toaster
          position="top-right"
          theme="dark"
          richColors
          toastOptions={{
            style: {
              background: "rgba(22, 24, 36, 0.85)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              borderRadius: "18px",
              color: "#f8fafc",
            },
          }}
        />
      </body>
    </html>
  );
}
