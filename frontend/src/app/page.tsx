"use client";
import { useState } from "react";
import { ChatSidebar } from "@/components/chat-sidebar";
import { ChatArea } from "@/components/chat-area";
import { AboutModal } from "@/components/about-modal";
import { Menu } from "lucide-react";

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);

  return (
    <main className="flex h-screen w-full overflow-hidden bg-zinc-950">
      {/* Mobile overlay backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed inset-y-0 left-0 z-30 transform transition-transform duration-300 ease-in-out
          md:static md:translate-x-0 md:z-auto
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <ChatSidebar
          onClose={() => setSidebarOpen(false)}
          onOpenAbout={() => {
            setAboutOpen(true);
            setSidebarOpen(false);
          }}
        />
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile top bar */}
        <div className="md:hidden flex items-center justify-between h-12 px-4 bg-zinc-950 border-b border-zinc-800 shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-zinc-400 hover:text-primary transition-colors p-1"
            aria-label="Open sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-primary flex items-center justify-center font-bold text-primary-foreground text-[10px] shadow-[0_0_12px_rgba(255,0,255,0.4)]">
              SA
            </div>
            <span className="text-sm font-semibold text-zinc-200 tracking-tight">
              Studio Assistant
            </span>
          </div>
          <div className="w-7" />
        </div>

        <ChatArea />
      </div>

      {/* About modal — rendered at root level so it overlays everything */}
      <AboutModal isOpen={aboutOpen} onClose={() => setAboutOpen(false)} />
    </main>
  );
}
