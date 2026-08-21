"use client";

import React from "react";
import { Gamepad2, Plus, Users, Database, Sparkles, ShieldCheck } from "lucide-react";
import { isFirebaseConfigured } from "@/lib/firebase";

interface NavbarProps {
  accountsCount: number;
  gamesCount: number;
  onOpenAddGame: () => void;
  onOpenAccounts: () => void;
}

export function Navbar({
  accountsCount,
  gamesCount,
  onOpenAddGame,
  onOpenAccounts,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-[#0d141e]/90 backdrop-blur-md px-4 sm:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Brand & Logo */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1a9fff] via-[#105590] to-[#0d2a4a] p-0.5 shadow-lg shadow-sky-500/20 flex items-center justify-center">
            <Gamepad2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-sky-200 bg-clip-text text-transparent">
                STEAM VAULT
              </h1>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
                Multi-Account
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {gamesCount} games indexed across {accountsCount} Steam accounts
            </p>
          </div>
        </div>

        {/* Status & Actions */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          {/* Storage Badge */}
          <div
            title={
              isFirebaseConfigured
                ? "Connected to Firebase Firestore"
                : "Using Local Vault Storage (Config .env.local to sync with Firebase)"
            }
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900/80 border border-slate-800 text-slate-300"
          >
            {isFirebaseConfigured ? (
              <>
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-400">Cloud Sync</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
                <span>Vault Active</span>
              </>
            )}
          </div>

          {/* Manage Accounts Button */}
          <button
            onClick={onOpenAccounts}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium text-slate-200 bg-[#162436] hover:bg-[#1f334d] border border-slate-700/60 transition-all hover:border-sky-500/50 hover:shadow-md hover:shadow-sky-500/10 active:scale-95 cursor-pointer"
          >
            <Users className="w-4 h-4 text-sky-400" />
            <span>Accounts</span>
            <span className="px-1.5 py-0.2 text-[11px] rounded bg-sky-950 text-sky-300 font-mono border border-sky-800/40">
              {accountsCount}
            </span>
          </button>

          {/* Add Game Button */}
          <button
            onClick={onOpenAddGame}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 shadow-md shadow-sky-600/25 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Game</span>
          </button>
        </div>
      </div>
    </header>
  );
}
