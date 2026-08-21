"use client";

import React, { useState } from "react";
import { SteamAccount, SteamGame } from "@/types";
import {
  Play,
  Copy,
  Check,
  Eye,
  EyeOff,
  Edit2,
  Trash2,
  KeyRound,
  Shield,
  Layers,
  Info,
  Gamepad2,
  Plus,
  Users,
} from "lucide-react";
import { getSteamHeroUrl, getSteamPosterUrl } from "@/lib/utils";

interface SteamHeroStageProps {
  game: SteamGame | null;
  accounts: SteamAccount[];
  onEditGame: (game: SteamGame) => void;
  onDeleteGame: (gameId: string) => void;
  onOpenAddGame: () => void;
  onOpenAccounts: () => void;
}

export function SteamHeroStage({
  game,
  accounts,
  onEditGame,
  onDeleteGame,
  onOpenAddGame,
  onOpenAccounts,
}: SteamHeroStageProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!game) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#171a21] text-[#8f98a0]">
        <div className="w-20 h-20 rounded-2xl bg-[#1b2838] border border-[#2a475e] flex items-center justify-center text-[#66c0f4] mb-5 shadow-xl shadow-black/40">
          <Gamepad2 className="w-10 h-10" />
        </div>
        <h2 className="text-xl font-bold text-[#c6d4df] mb-2">
          Your Steam Library is Ready
        </h2>
        <p className="text-xs max-w-md text-center text-[#8f98a0] mb-6 leading-relaxed">
          {accounts.length === 0
            ? "Start by adding your Steam accounts first, then add games to link which accounts own each game."
            : "Select a game from the sidebar or click 'Add Game' to catalog your Steam collection."}
        </p>

        <div className="flex items-center gap-3">
          {accounts.length === 0 && (
            <button
              onClick={onOpenAccounts}
              className="flex items-center gap-2 px-4 py-2.5 rounded bg-[#212f42] hover:bg-[#2c3e57] text-[#c6d4df] hover:text-white border border-[#2a475e] text-xs font-semibold transition-all cursor-pointer"
            >
              <Users className="w-4 h-4 text-[#66c0f4]" />
              <span>Configure Accounts</span>
            </button>
          )}

          <button
            onClick={onOpenAddGame}
            className="flex items-center gap-2 px-5 py-2.5 rounded bg-[#66c0f4]/20 hover:bg-[#66c0f4]/30 text-[#66c0f4] hover:text-white border border-[#66c0f4]/50 text-xs font-bold transition-all shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add First Game</span>
          </button>
        </div>
      </div>
    );
  }

  const ownerAccounts = accounts.filter((acc) =>
    game.accountIds.includes(acc.id)
  );

  const heroUrl =
    game.bannerUrl ||
    (game.steamAppId ? getSteamHeroUrl(game.steamAppId) : null) ||
    game.coverUrl;

  const posterUrl =
    game.coverUrl ||
    (game.steamAppId ? getSteamPosterUrl(game.steamAppId) : null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const togglePasswordVisibility = (accId: string) => {
    setVisiblePasswords((prev) => ({
      ...prev,
      [accId]: !prev[accId],
    }));
  };

  return (
    <div className="flex-1 bg-[#171a21] overflow-y-auto h-[calc(100vh-45px)] flex flex-col">
      {/* Hero Header Stage */}
      <div className="relative w-full h-72 md:h-84 bg-[#101822] overflow-hidden shrink-0">
        {heroUrl ? (
          <img
            src={heroUrl}
            alt={game.title}
            className="w-full h-full object-cover opacity-75 select-none"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-[#142334] to-[#101822]" />
        )}

        {/* Realistic Steam hero gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#171a21] via-[#171a21]/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#171a21]/90 via-[#171a21]/30 to-transparent" />

        {/* Hero Content Area */}
        <div className="absolute bottom-6 left-6 right-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex items-end gap-5">
            {/* Small poster capsule thumbnail */}
            {posterUrl && (
              <div className="hidden sm:block w-24 h-36 rounded shadow-2xl overflow-hidden border border-[#2a475e] shrink-0 bg-[#0e141c]">
                <img src={posterUrl} alt="" className="w-full h-full object-cover" />
              </div>
            )}

            {/* Game Title & Metadata */}
            <div className="space-y-1.5">
              {game.steamAppId && (
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-[#101822]/80 text-[#66c0f4] border border-[#2a475e]/80">
                    AppID: {game.steamAppId}
                  </span>
                  {ownerAccounts.length > 1 && (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                      <Layers className="w-3 h-3" />
                      <span>Owned on {ownerAccounts.length} Accounts</span>
                    </span>
                  )}
                </div>
              )}

              <h1 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight drop-shadow-md">
                {game.title}
              </h1>

              {/* Genre Pills */}
              {game.genres && game.genres.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {game.genres.map((g) => (
                    <span
                      key={g}
                      className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded bg-[#101822]/80 text-[#8f98a0] border border-[#2a475e]/60"
                    >
                      {g}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Action Row: Steam Play Button & Edit */}
          <div className="flex items-center gap-2.5">
            {game.steamAppId && (
              <a
                href={`steam://rungameid/${game.steamAppId}`}
                className="flex items-center justify-center gap-3 px-8 py-3 rounded bg-gradient-to-r from-[#5c7e10] to-[#759c16] hover:from-[#6b9413] hover:to-[#8ab71a] text-white font-extrabold text-sm tracking-wider uppercase shadow-lg shadow-black/60 transition-all hover:scale-[1.02] active:scale-98 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Play / Launch</span>
              </a>
            )}

            <button
              onClick={() => onEditGame(game)}
              className="p-2.5 rounded bg-[#212f42] hover:bg-[#2c3e57] text-[#c6d4df] hover:text-white border border-[#2a475e] transition-colors cursor-pointer"
              title="Edit game details"
            >
              <Edit2 className="w-4 h-4" />
            </button>

            {confirmDelete ? (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onDeleteGame(game.id)}
                  className="px-3 py-2 rounded bg-red-600 hover:bg-red-500 text-white text-xs font-bold cursor-pointer"
                >
                  Delete
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="px-2 py-2 rounded bg-[#212f42] text-[#c6d4df] text-xs cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDelete(true)}
                className="p-2.5 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition-colors cursor-pointer"
                title="Delete game from library"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Details & Credentials Section */}
      <div className="p-6 space-y-6 flex-1 max-w-5xl">
        {/* Steam Account Credentials Card Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-[#212f42] pb-2">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#8f98a0] flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#66c0f4]" />
              <span>Steam Account Credentials ({ownerAccounts.length})</span>
            </h2>
            <span className="text-xs text-[#8f98a0]">
              Click copy button to copy login credentials
            </span>
          </div>

          {ownerAccounts.length === 0 ? (
            <div className="p-6 rounded bg-[#1b2838] border border-[#2a475e] text-center text-sm text-[#8f98a0]">
              No Steam account is currently linked to this game. Click &quot;Edit Game&quot; above to select accounts.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ownerAccounts.map((acc) => {
                const isPassVisible = Boolean(visiblePasswords[acc.id]);
                return (
                  <div
                    key={acc.id}
                    className="p-4 rounded-lg bg-[#1b2838] border border-[#2a475e] shadow-md space-y-3 hover:border-[#385b7a] transition-all"
                  >
                    {/* Account Header */}
                    <div className="flex items-center justify-between border-b border-[#212f42] pb-2">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: acc.colorTag || "#38bdf8" }}
                        />
                        <span className="font-bold text-sm text-white">
                          {acc.label}
                        </span>
                      </div>
                      {acc.notes && (
                        <span
                          className="text-[11px] text-[#8f98a0] italic truncate max-w-[160px]"
                          title={acc.notes}
                        >
                          {acc.notes}
                        </span>
                      )}
                    </div>

                    {/* Username row */}
                    <div className="flex items-center justify-between bg-[#121c27] px-3 py-2 rounded border border-[#212f42]">
                      <div className="flex flex-col min-w-0 pr-2">
                        <span className="text-[10px] uppercase font-bold text-[#8f98a0]">
                          Username
                        </span>
                        <span className="text-xs font-mono font-semibold text-[#c6d4df] truncate select-all">
                          {acc.username}
                        </span>
                      </div>

                      <button
                        onClick={() => handleCopy(acc.username, `user-${acc.id}`)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#212f42] hover:bg-[#2c3e57] text-[#66c0f4] hover:text-white text-xs font-semibold border border-[#2a475e] transition-all shrink-0 cursor-pointer"
                      >
                        {copiedKey === `user-${acc.id}` ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Password row */}
                    <div className="flex items-center justify-between bg-[#121c27] px-3 py-2 rounded border border-[#212f42]">
                      <div className="flex flex-col min-w-0 pr-2">
                        <span className="text-[10px] uppercase font-bold text-[#8f98a0]">
                          Password
                        </span>
                        <span className="text-xs font-mono font-semibold text-[#c6d4df] truncate select-all">
                          {isPassVisible ? acc.password : "••••••••••••"}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => togglePasswordVisibility(acc.id)}
                          title={isPassVisible ? "Hide password" : "Show password"}
                          className="p-1.5 rounded bg-[#1b2838] hover:bg-[#2c3e57] text-[#8f98a0] hover:text-white border border-[#2a475e] transition-colors cursor-pointer"
                        >
                          {isPassVisible ? (
                            <EyeOff className="w-3.5 h-3.5" />
                          ) : (
                            <Eye className="w-3.5 h-3.5" />
                          )}
                        </button>

                        <button
                          onClick={() => handleCopy(acc.password, `pass-${acc.id}`)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#212f42] hover:bg-[#2c3e57] text-[#66c0f4] hover:text-white text-xs font-semibold border border-[#2a475e] transition-all cursor-pointer"
                        >
                          {copiedKey === `pass-${acc.id}` ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-emerald-400">Copied</span>
                            </>
                          ) : (
                            <>
                              <KeyRound className="w-3.5 h-3.5" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Custom Game Notes / Extras */}
        {game.notes && (
          <div className="p-4 rounded-lg bg-[#1b2838] border border-[#2a475e] space-y-1.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#8f98a0] flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-[#66c0f4]" />
              <span>Notes & Vault Details</span>
            </h3>
            <p className="text-xs text-[#c6d4df] whitespace-pre-line leading-relaxed">
              {game.notes}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
