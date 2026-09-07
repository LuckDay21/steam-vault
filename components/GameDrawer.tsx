"use client";

import React, { useState, useEffect } from "react";
import { SteamAccount, SteamGame } from "@/types";
import {
  X,
  Copy,
  Check,
  Eye,
  EyeOff,
  Play,
  Edit2,
  Trash2,
  KeyRound,
  UserCheck,
  Info,
  DollarSign,
  Package,
} from "lucide-react";
import { getSteamHeroUrl } from "@/lib/utils";
import { formatCurrency, getGameTotalPrice } from "@/lib/currency";

interface GameDrawerProps {
  game: SteamGame | null;
  accounts: SteamAccount[];
  onClose: () => void;
  onEdit: (game: SteamGame) => void;
  onDelete: (gameId: string) => void;
}

export function GameDrawer({
  game,
  accounts,
  onClose,
  onEdit,
  onDelete,
}: GameDrawerProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!game) return null;

  const ownerAccounts = accounts.filter((acc) =>
    (game.accountIds || []).includes(acc.id)
  );

  const { total, base, dlc, currency, isFree } = getGameTotalPrice(game);
  const selectedDlcs = (game.dlcItems || []).filter((d) => d.selected);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => {
      setCopiedKey(null);
    }, 2000);
  };

  const togglePasswordVisibility = (accountId: string) => {
    setVisiblePasswords((prev) => ({
      ...prev,
      [accountId]: !prev[accountId],
    }));
  };

  const bannerSrc =
    game.bannerUrl ||
    (game.steamAppId ? getSteamHeroUrl(game.steamAppId) : null) ||
    game.coverUrl;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity animate-in fade-in"
      />

      {/* Sliding Drawer Container */}
      <div className="relative w-full max-w-xl h-full bg-[#0e1622] border-l border-slate-800 shadow-2xl flex flex-col z-10 overflow-y-auto animate-in slide-in-from-right duration-300">
        {/* Hero Header */}
        <div className="relative w-full h-56 bg-gradient-to-b from-[#1a293d] to-[#0e1622] overflow-hidden shrink-0">
          {bannerSrc ? (
            <img
              src={bannerSrc}
              alt={game.title}
              className="w-full h-full object-cover opacity-60"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#142334] to-[#0c141d]" />
          )}

          {/* Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0e1622] via-[#0e1622]/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0e1622]/80 via-transparent to-transparent" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/60 hover:bg-black/80 text-slate-300 hover:text-white backdrop-blur-md transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Title and Meta in Hero */}
          <div className="absolute bottom-4 left-6 right-6">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {game.steamAppId && (
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  AppID: {game.steamAppId}
                </span>
              )}

              {/* Price & DLC badges */}
              {(game.price !== undefined || game.isFree) && (
                <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                  <DollarSign className="w-3 h-3" />
                  <span>{isFree ? "Free" : formatCurrency(base, currency)}</span>
                </span>
              )}

              {game.includesDlc && (
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/40 flex items-center gap-1">
                  <Package className="w-3 h-3 text-sky-400" />
                  <span>
                    {selectedDlcs.length > 0 ? `+ ${selectedDlcs.length} DLCs` : "+ DLC"} ({formatCurrency(total, currency)})
                  </span>
                </span>
              )}
            </div>

            <h2 className="text-2xl font-extrabold text-white tracking-tight drop-shadow-md">
              {game.title}
            </h2>

            {game.genres && game.genres.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {game.genres.map((g) => (
                  <span
                    key={g}
                    className="text-[11px] px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-300 border border-slate-700/60"
                  >
                    {g}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 flex-1">
          {/* Quick Actions (Launch via Steam) */}
          {game.steamAppId && (
            <a
              href={`steam://rungameid/${game.steamAppId}`}
              className="flex items-center justify-center gap-2.5 w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#5c7e10] to-[#759c16] hover:from-[#6b9413] hover:to-[#8ab71a] text-white font-bold text-sm shadow-lg shadow-black/40 transition-all hover:scale-[1.01] active:scale-98 cursor-pointer uppercase tracking-wider"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Launch in Steam</span>
            </a>
          )}

          {/* Accounts Ownership Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-sky-400" />
                <span>Available On ({ownerAccounts.length} Accounts)</span>
              </h3>
              {ownerAccounts.length > 1 && (
                <span className="text-[11px] font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  Duplicate Game
                </span>
              )}
            </div>

            {ownerAccounts.length === 0 ? (
              <div className="p-4 rounded-xl bg-[#141f2d] border border-slate-800 text-center text-slate-400 text-sm">
                No accounts currently linked to this game. Click &quot;Edit Game&quot; to assign accounts.
              </div>
            ) : (
              <div className="space-y-3">
                {ownerAccounts.map((acc) => {
                  const isPassVisible = Boolean(visiblePasswords[acc.id]);
                  return (
                    <div
                      key={acc.id}
                      className="p-4 rounded-xl bg-[#131e2b] border border-slate-700/60 hover:border-slate-600 transition-all shadow-md space-y-3"
                    >
                      {/* Account Header */}
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3 h-3 rounded-full shrink-0"
                            style={{ backgroundColor: acc.colorTag || "#38bdf8" }}
                          />
                          <span className="font-bold text-sm text-slate-100">
                            {acc.label}
                          </span>
                        </div>
                        {acc.notes && (
                          <span className="text-xs text-slate-400 italic max-w-[200px] truncate" title={acc.notes}>
                            {acc.notes}
                          </span>
                        )}
                      </div>

                      {/* Credentials Grid */}
                      <div className="space-y-2">
                        {/* Username Row */}
                        <div className="flex items-center justify-between bg-[#0b1119] px-3 py-2 rounded-lg border border-slate-800/80">
                          <div className="flex flex-col">
                            <span className="text-[10px] uppercase font-bold text-slate-500">
                              Username
                            </span>
                            <span className="text-sm font-mono text-slate-200 select-all">
                              {acc.username}
                            </span>
                          </div>

                          <button
                            onClick={() => handleCopy(acc.username, `user-${acc.id}`)}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold bg-[#1a2738] hover:bg-sky-600/30 text-sky-300 hover:text-sky-200 transition-all cursor-pointer"
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

                        {/* Password Row */}
                        <div className="flex items-center justify-between bg-[#0b1119] px-3 py-2 rounded-lg border border-slate-800/80">
                          <div className="flex flex-col">
                            <span className="text-[10px] uppercase font-bold text-slate-500">
                              Password
                            </span>
                            <span className="text-sm font-mono text-slate-200 select-all">
                              {isPassVisible ? acc.password : "••••••••••••"}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => togglePasswordVisibility(acc.id)}
                              title={isPassVisible ? "Hide password" : "Show password"}
                              className="p-1.5 rounded-md text-slate-400 hover:text-slate-200 bg-[#16202c] hover:bg-[#203042] transition-colors cursor-pointer"
                            >
                              {isPassVisible ? (
                                <EyeOff className="w-3.5 h-3.5" />
                              ) : (
                                <Eye className="w-3.5 h-3.5" />
                              )}
                            </button>

                            <button
                              onClick={() => handleCopy(acc.password, `pass-${acc.id}`)}
                              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold bg-[#1a2738] hover:bg-sky-600/30 text-sky-300 hover:text-sky-200 transition-all cursor-pointer"
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
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Owned DLCs List if user owns any DLC */}
          {selectedDlcs.length > 0 && (
            <div className="p-4 rounded-lg bg-[#131e2b] border border-slate-700/60 space-y-2.5 shadow-md">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-sky-400" />
                  <span>Owned DLCs & Expansions ({selectedDlcs.length})</span>
                </h3>
                <span className="text-xs font-mono font-bold text-emerald-400">
                  Total DLC: {formatCurrency(dlc, currency)}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {selectedDlcs.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-2 rounded bg-[#0b1119] border border-slate-800 text-xs"
                  >
                    <span className="text-slate-200 truncate font-medium mr-2">
                      {item.name}
                    </span>
                    <span className="font-mono text-[11px] font-bold text-emerald-400 shrink-0">
                      {item.price > 0 ? formatCurrency(item.price, currency) : "Free"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Game Notes */}
          {game.notes && (
            <div className="p-3.5 rounded-xl bg-[#131b26] border border-slate-800 text-xs text-slate-300 space-y-1">
              <div className="font-semibold text-slate-400 flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-sky-400" />
                <span>Notes</span>
              </div>
              <p className="whitespace-pre-line text-slate-300">{game.notes}</p>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between gap-3">
            <button
              onClick={() => onEdit(game)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#1a2738] hover:bg-[#23354d] text-slate-200 font-semibold text-sm border border-slate-700/60 transition-all cursor-pointer"
            >
              <Edit2 className="w-4 h-4 text-sky-400" />
              <span>Edit Game</span>
            </button>

            {confirmDelete ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    onDelete(game.id);
                    onClose();
                  }}
                  className="px-3 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs cursor-pointer"
                >
                  Yes, Delete
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDelete(true)}
                className="p-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-all cursor-pointer"
                title="Delete game from library"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
