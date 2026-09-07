"use client";

import React from "react";
import { Search, Layers, X, Filter, Gamepad2, Wallet } from "lucide-react";
import { CurrencyCode, SteamAccount, SteamGame, FilterState } from "@/types";
import { getSteamPosterUrl } from "@/lib/utils";
import { formatCurrency, getGameTotalPrice } from "@/lib/currency";

interface SteamSidebarProps {
  games: SteamGame[];
  allGamesCount: number;
  accounts: SteamAccount[];
  genres: string[];
  filter: FilterState;
  selectedGameId: string | null;
  totalFilteredValuation: number;
  preferredCurrency: CurrencyCode;
  onSelectGame: (game: SteamGame) => void;
  onFilterChange: (newFilter: Partial<FilterState>) => void;
}

export function SteamSidebar({
  games,
  allGamesCount,
  accounts,
  genres,
  filter,
  selectedGameId,
  totalFilteredValuation,
  preferredCurrency,
  onSelectGame,
  onFilterChange,
}: SteamSidebarProps) {
  return (
    <aside className="w-full md:w-80 lg:w-88 shrink-0 bg-[#121a24] border-r border-[#212f42] flex flex-col h-[calc(100vh-45px)] select-none">
      {/* Search & Quick Filter Controls */}
      <div className="p-3 border-b border-[#212f42] space-y-2.5 bg-[#141e2b]">
        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8f98a0]" />
          <input
            type="text"
            value={filter.search}
            onChange={(e) => onFilterChange({ search: e.target.value })}
            placeholder="Search by game title or AppID..."
            className="w-full pl-8 pr-8 py-1.5 bg-[#0e141c] border border-[#2a475e]/70 rounded text-xs text-[#c6d4df] placeholder:text-[#536577] focus:outline-none focus:border-[#66c0f4] transition-colors font-sans"
          />
          {filter.search && (
            <button
              onClick={() => onFilterChange({ search: "" })}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[#8f98a0] hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Row: Account Dropdown & Duplicates Toggle */}
        <div className="flex items-center gap-2">
          {/* Account Dropdown */}
          <div className="relative flex-1">
            <select
              value={filter.selectedAccountId || ""}
              onChange={(e) =>
                onFilterChange({ selectedAccountId: e.target.value || null })
              }
              className="w-full bg-[#0e141c] border border-[#2a475e]/70 rounded px-2.5 py-1 text-[11px] font-semibold text-[#c6d4df] focus:outline-none focus:border-[#66c0f4] cursor-pointer"
            >
              <option value="">All Accounts ({accounts.length})</option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.label} ({acc.username})
                </option>
              ))}
            </select>
          </div>

          {/* Duplicates Toggle */}
          <button
            onClick={() =>
              onFilterChange({ onlyDuplicates: !filter.onlyDuplicates })
            }
            title="Filter games owned on 2+ Steam accounts"
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-semibold border transition-all cursor-pointer ${
              filter.onlyDuplicates
                ? "bg-amber-500/20 border-amber-500 text-amber-300"
                : "bg-[#0e141c] border-[#2a475e]/70 text-[#8f98a0] hover:text-[#c6d4df]"
            }`}
          >
            <Layers className="w-3 h-3 text-amber-400" />
            <span>Overlap</span>
          </button>
        </div>

        {/* Genre filter if available */}
        {genres.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none text-[10px]">
            <button
              onClick={() => onFilterChange({ selectedGenre: null })}
              className={`px-2 py-0.5 rounded whitespace-nowrap font-semibold cursor-pointer ${
                filter.selectedGenre === null
                  ? "bg-[#2a475e] text-white"
                  : "bg-[#182332] text-[#8f98a0] hover:text-white"
              }`}
            >
              All Genres
            </button>
            {genres.map((g) => (
              <button
                key={g}
                onClick={() =>
                  onFilterChange({
                    selectedGenre: filter.selectedGenre === g ? null : g,
                  })
                }
                className={`px-2 py-0.5 rounded whitespace-nowrap font-medium cursor-pointer ${
                  filter.selectedGenre === g
                    ? "bg-[#2a475e] text-white font-bold"
                    : "bg-[#182332] text-[#8f98a0] hover:text-white"
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Games List Header */}
      <div className="px-3 py-1.5 bg-[#172230] text-[10px] uppercase font-bold tracking-wider text-[#8f98a0] flex items-center justify-between border-b border-[#212f42]">
        <span>Games ({games.length})</span>
        <span className="text-[9px] text-[#626366]">A-Z Sorted</span>
      </div>

      {/* Games List Items */}
      <div className="flex-1 overflow-y-auto divide-y divide-[#1a2533]/50">
        {games.length === 0 ? (
          <div className="p-6 text-center text-xs text-[#8f98a0] italic">
            No games match your filters
          </div>
        ) : (
          games.map((game) => {
            const isSelected = selectedGameId === game.id;
            const ownerAccounts = accounts.filter((a) =>
              (game.accountIds || []).includes(a.id)
            );
            const isDuplicate = ownerAccounts.length > 1;
            const thumbUrl =
              game.coverUrl ||
              (game.steamAppId ? getSteamPosterUrl(game.steamAppId) : null);

            const { total, currency: gameCurr, isFree } = getGameTotalPrice(game);

            return (
              <div
                key={game.id}
                onClick={() => onSelectGame(game)}
                role="button"
                tabIndex={0}
                className={`flex items-center gap-2.5 px-3 py-2 transition-all cursor-pointer group ${
                  isSelected
                    ? "bg-[#2a475e] text-white shadow-inner font-semibold"
                    : "hover:bg-[#1a2636] text-[#c6d4df]"
                }`}
              >
                {/* Square thumbnail */}
                <div className="w-8 h-10 rounded-xs bg-[#0e141c] overflow-hidden shrink-0 border border-[#2a475e]/40 flex items-center justify-center">
                  {thumbUrl ? (
                    <img
                      src={thumbUrl}
                      alt=""
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <Gamepad2 className="w-4 h-4 text-[#8f98a0]" />
                  )}
                </div>

                {/* Game Title & Metadata */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-semibold truncate">
                      {game.title}
                    </span>
                    {isDuplicate && (
                      <span className="shrink-0 text-[9px] font-bold px-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {ownerAccounts.length}x
                      </span>
                    )}
                  </div>

                  {/* Account ownership tags & Price */}
                  <div className="flex items-center justify-between gap-1 mt-0.5">
                    <div className="flex items-center gap-1 overflow-hidden">
                      {ownerAccounts.map((acc) => (
                        <span
                          key={acc.id}
                          title={acc.label}
                          className="inline-block w-1.5 h-1.5 rounded-full shrink-0"
                          style={{ backgroundColor: acc.colorTag || "#38bdf8" }}
                        />
                      ))}
                      <span className="text-[10px] text-[#8f98a0] truncate ml-0.5">
                        {ownerAccounts.map((a) => a.label).join(", ") || "No accounts"}
                      </span>
                    </div>

                    {/* Price Tag */}
                    {(game.price !== undefined || game.isFree) && (
                      <span className="text-[10px] font-mono text-emerald-400 shrink-0 font-medium">
                        {isFree ? "Free" : formatCurrency(total, gameCurr)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer info: Count & Valuation */}
      <div className="px-3 py-2 bg-[#0e141c] border-t border-[#212f42] text-[10px] text-[#8f98a0] flex items-center justify-between">
        <span>Library: {allGamesCount}</span>
        <div className="flex items-center gap-1 font-semibold text-emerald-400">
          <Wallet className="w-3 h-3 text-[#a4d007]" />
          <span>{formatCurrency(totalFilteredValuation, preferredCurrency)}</span>
        </div>
      </div>
    </aside>
  );
}
