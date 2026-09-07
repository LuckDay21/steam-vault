"use client";

import React from "react";
import { Plus, Users, LayoutGrid, SplitSquareVertical, LogOut, DollarSign, Wallet } from "lucide-react";
import { isFirebaseConfigured } from "@/lib/firebase";
import { User } from "firebase/auth";
import { CurrencyCode } from "@/types";
import { formatCurrency } from "@/lib/currency";

interface SteamHeaderProps {
  user: User | null;
  isGuestMode: boolean;
  accountsCount: number;
  gamesCount: number;
  totalValuation: number;
  preferredCurrency: CurrencyCode;
  onToggleCurrency: () => void;
  viewMode: "desktop" | "grid";
  onViewModeChange: (mode: "desktop" | "grid") => void;
  onOpenAddGame: () => void;
  onOpenAccounts: () => void;
  onSignInWithGoogle: () => void;
  onSignOut: () => void;
}

export function SteamHeader({
  user,
  isGuestMode,
  accountsCount,
  gamesCount,
  totalValuation,
  preferredCurrency,
  onToggleCurrency,
  viewMode,
  onViewModeChange,
  onOpenAddGame,
  onOpenAccounts,
  onSignInWithGoogle,
  onSignOut,
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
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Total Library Valuation Badge & Currency Switcher */}
          {gamesCount > 0 && (
            <button
              onClick={onToggleCurrency}
              title={`Total value of your game collection. Click to switch currency (${preferredCurrency === "IDR" ? "Switch to USD" : "Switch to IDR"})`}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#101b2b] hover:bg-[#16273e] text-[#a4d007] border border-[#2a475e]/70 transition-all cursor-pointer group"
            >
              <Wallet className="w-3.5 h-3.5 text-[#a4d007] group-hover:scale-110 transition-transform" />
              <div className="flex items-center gap-1 text-[11px] font-bold">
                <span className="text-slate-400 font-normal hidden lg:inline">Valuation:</span>
                <span>{formatCurrency(totalValuation, preferredCurrency)}</span>
                <span className="text-[10px] text-sky-400 font-mono underline ml-0.5">
                  {preferredCurrency}
                </span>
              </div>
            </button>
          )}

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

          {/* Google Auth Status / Button */}
          {user ? (
            <div className="flex items-center gap-2 pl-1 border-l border-[#2a475e]/60">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || "User"}
                  className="w-6 h-6 rounded-full border border-[#66c0f4]/50"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-sky-600 text-white flex items-center justify-center font-bold text-[10px]">
                  {user.displayName ? user.displayName[0].toUpperCase() : "U"}
                </div>
              )}
              <span className="hidden xl:inline text-xs font-semibold text-slate-200 max-w-[100px] truncate">
                {user.displayName || user.email}
              </span>
              <button
                onClick={onSignOut}
                title="Sign Out"
                className="p-1 rounded bg-[#101822] hover:bg-red-500/20 text-[#8f98a0] hover:text-red-300 border border-[#2a475e]/40 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onSignInWithGoogle}
              className="flex items-center gap-1.5 px-3 py-1 rounded bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs shadow-xs transition-all cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
