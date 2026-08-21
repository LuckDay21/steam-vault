"use client";

import React from "react";
import { Plus, Users, LayoutGrid, SplitSquareVertical, ShieldCheck } from "lucide-react";
import { isFirebaseConfigured } from "@/lib/firebase";

interface SteamHeaderProps {
  accountsCount: number;
  gamesCount: number;
  viewMode: "desktop" | "grid";
  onViewModeChange: (mode: "desktop" | "grid") => void;
  onOpenAddGame: () => void;
  onOpenAccounts: () => void;
}

export function SteamHeader({
  accountsCount,
  gamesCount,
  viewMode,
  onViewModeChange,
  onOpenAddGame,
  onOpenAccounts,
}: SteamHeaderProps) {
  return (
    <header className="border-b border-[#2a475e]/60 bg-[#171a21] select-none sticky top-0 z-40">
      {/* Top Client Bar */}
      <div className="px-4 py-2 flex items-center justify-between gap-4 border-b border-[#212b38]/80 text-xs">
        {/* Steam Window Brand */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <svg
              className="w-5 h-5 text-[#66c0f4]"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 2C6.477 2 2 6.477 2 12c0 4.237 2.636 7.855 6.356 9.312l2.42-3.535a3.992 3.992 0 0 1-.776-2.277c0-.282.029-.557.086-.821L6.72 12.836A5.992 5.992 0 0 1 6 10c0-3.314 2.686-6 6-6s6 2.686 6 6c0 1.258-.387 2.425-1.05 3.393l-3.364-1.378a2.5 2.5 0 1 0-2.316 2.915l2.483 3.627A9.957 9.957 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2z" />
            </svg>
            <span className="font-extrabold tracking-widest text-slate-200 text-[13px]">
              STEAM<span className="text-[#66c0f4] ml-1">VAULT</span>
            </span>
          </div>

          {/* Steam Client Navigation Tabs */}
          <nav className="hidden sm:flex items-center gap-5 font-bold tracking-wider text-[11px] uppercase">
            <span className="text-[#8f98a0] hover:text-white cursor-not-allowed transition-colors">
              Store
            </span>
            <span className="text-[#66c0f4] border-b-2 border-[#66c0f4] pb-0.5 cursor-pointer">
              Library
            </span>
            <span className="text-[#8f98a0] hover:text-white cursor-not-allowed transition-colors">
              Community
            </span>
            <span className="text-[#8f98a0] hover:text-white cursor-pointer" onClick={onOpenAccounts}>
              Accounts Hub
            </span>
          </nav>
        </div>

        {/* Right Tools & Profile Info */}
        <div className="flex items-center gap-3">
          {/* View Mode Switcher (Desktop Client vs Deck Grid) */}
          <div className="flex items-center bg-[#101822] rounded-md p-0.5 border border-[#2a475e]/40">
            <button
              onClick={() => onViewModeChange("desktop")}
              title="Steam Desktop Client View"
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
                viewMode === "desktop"
                  ? "bg-[#2a475e] text-white shadow-xs"
                  : "text-[#8f98a0] hover:text-white"
              }`}
            >
              <SplitSquareVertical className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Client View</span>
            </button>
            <button
              onClick={() => onViewModeChange("grid")}
              title="Steam Deck Grid View"
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
                viewMode === "grid"
                  ? "bg-[#2a475e] text-white shadow-xs"
                  : "text-[#8f98a0] hover:text-white"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Grid View</span>
            </button>
          </div>

          {/* Sync status */}
          <div className="hidden lg:flex items-center gap-1.5 text-[11px] text-[#8f98a0] bg-[#121c27] px-2.5 py-1 rounded border border-[#2a475e]/30">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>{isFirebaseConfigured ? "Firebase Realtime DB" : "Local Vault"}</span>
          </div>

          {/* Manage Accounts Button */}
          <button
            onClick={onOpenAccounts}
            className="flex items-center gap-1.5 px-3 py-1 rounded bg-[#212f42] hover:bg-[#2c3e57] text-[#c6d4df] hover:text-white border border-[#2a475e] text-xs font-semibold transition-all cursor-pointer"
          >
            <Users className="w-3.5 h-3.5 text-[#66c0f4]" />
            <span>Accounts ({accountsCount})</span>
          </button>

          {/* Add Game Button */}
          <button
            onClick={onOpenAddGame}
            className="flex items-center gap-1.5 px-3.5 py-1 rounded bg-[#66c0f4]/20 hover:bg-[#66c0f4]/30 text-[#66c0f4] hover:text-white border border-[#66c0f4]/50 text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Game</span>
          </button>
        </div>
      </div>
    </header>
  );
}
