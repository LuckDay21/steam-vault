"use client";

import React from "react";
import { SteamAccount, SteamGame, FilterState } from "@/types";
import { GameCard } from "./GameCard";
import { LibraryFilters } from "./LibraryFilters";
import { Search, FilterX, Plus } from "lucide-react";

interface SteamDeckGridProps {
  games: SteamGame[];
  allGamesCount: number;
  accounts: SteamAccount[];
  genres: string[];
  filter: FilterState;
  onFilterChange: (newFilter: Partial<FilterState>) => void;
  onSelectGame: (game: SteamGame) => void;
  onOpenAddGame: () => void;
  onResetFilters: () => void;
}

export function SteamDeckGrid({
  games,
  allGamesCount,
  accounts,
  genres,
  filter,
  onFilterChange,
  onSelectGame,
  onOpenAddGame,
  onResetFilters,
}: SteamDeckGridProps) {
  return (
    <div className="flex-1 overflow-y-auto max-w-7xl w-full mx-auto px-4 sm:px-8 py-6 space-y-6">
      {/* Filters & Search */}
      <LibraryFilters
        accounts={accounts}
        genres={genres}
        filter={filter}
        onFilterChange={onFilterChange}
        totalFilteredCount={games.length}
      />

      {/* Grid Content */}
      {games.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 pt-2">
          {games.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              accounts={accounts}
              onClick={() => onSelectGame(game)}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center rounded-xl bg-[#121a24] border border-[#212f42] mt-4">
          <div className="w-14 h-14 rounded-xl bg-[#1b2838] flex items-center justify-center text-[#8f98a0] mb-3">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-[#c6d4df] mb-1">
            No games found
          </h3>
          <p className="text-xs text-[#8f98a0] max-w-sm mb-5">
            {allGamesCount === 0
              ? "Your library is empty. Click 'Add Game' to start adding your Steam games."
              : "No games match your current filter or search criteria."}
          </p>

          {allGamesCount > 0 ? (
            <button
              onClick={onResetFilters}
              className="flex items-center gap-2 px-4 py-2 rounded bg-[#1b2838] hover:bg-[#2c3e57] text-[#66c0f4] font-semibold text-xs border border-[#2a475e] transition-all cursor-pointer"
            >
              <FilterX className="w-4 h-4" />
              <span>Reset All Filters</span>
            </button>
          ) : (
            <button
              onClick={onOpenAddGame}
              className="flex items-center gap-2 px-5 py-2.5 rounded bg-[#66c0f4]/20 hover:bg-[#66c0f4]/30 text-[#66c0f4] hover:text-white font-bold text-xs border border-[#66c0f4]/50 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Your First Game</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
