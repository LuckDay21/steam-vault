"use client";

import React from "react";
import { Search, Layers, X, ArrowUpDown, Filter, Sparkles } from "lucide-react";
import { FilterState, SteamAccount } from "@/types";

interface LibraryFiltersProps {
  accounts: SteamAccount[];
  genres: string[];
  filter: FilterState;
  onFilterChange: (newFilter: Partial<FilterState>) => void;
  totalFilteredCount: number;
}

export function LibraryFilters({
  accounts,
  genres,
  filter,
  onFilterChange,
  totalFilteredCount,
}: LibraryFiltersProps) {
  return (
    <div className="space-y-4">
      {/* Top row: Search Bar, Duplicates Toggle, Sort, Genre */}
      <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
        {/* Search input */}
        <div className="relative flex-1 max-w-xl">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={filter.search}
            onChange={(e) => onFilterChange({ search: e.target.value })}
            placeholder="Search by game title or Steam AppID..."
            className="w-full pl-10 pr-10 py-2.5 bg-[#121c29] border border-slate-700/80 rounded-xl text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all"
          />
          {filter.search && (
            <button
              onClick={() => onFilterChange({ search: "" })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Right controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Multi-Account Duplicates Toggle */}
          <button
            onClick={() => onFilterChange({ onlyDuplicates: !filter.onlyDuplicates })}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium border transition-all cursor-pointer ${
              filter.onlyDuplicates
                ? "bg-amber-500/15 border-amber-500/50 text-amber-300 shadow-sm shadow-amber-500/20 font-semibold"
                : "bg-[#121c29] border-slate-700/80 text-slate-300 hover:border-slate-600 hover:text-white"
            }`}
          >
            <Layers className="w-4 h-4 text-amber-400" />
            <span>Multi-Account Only</span>
            {filter.onlyDuplicates && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            )}
          </button>

          {/* Genre selector */}
          {genres.length > 0 && (
            <div className="relative">
              <select
                value={filter.selectedGenre || ""}
                onChange={(e) =>
                  onFilterChange({ selectedGenre: e.target.value || null })
                }
                className="appearance-none bg-[#121c29] border border-slate-700/80 rounded-xl pl-3.5 pr-8 py-2 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 cursor-pointer"
              >
                <option value="">All Genres</option>
                {genres.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
              <Filter className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            </div>
          )}

          {/* Sort selector */}
          <div className="relative">
            <select
              value={filter.sortBy}
              onChange={(e) =>
                onFilterChange({ sortBy: e.target.value as FilterState["sortBy"] })
              }
              className="appearance-none bg-[#121c29] border border-slate-700/80 rounded-xl pl-3.5 pr-8 py-2 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 cursor-pointer"
            >
              <option value="title-asc">Alphabetical (A-Z)</option>
              <option value="title-desc">Alphabetical (Z-A)</option>
              <option value="newest">Recently Added</option>
              <option value="accounts-desc">Most Accounts Owned</option>
            </select>
            <ArrowUpDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Account filter pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs sm:text-sm">
        <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider whitespace-nowrap mr-1">
          Filter by Account:
        </span>

        <button
          onClick={() => onFilterChange({ selectedAccountId: null })}
          className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all cursor-pointer ${
            filter.selectedAccountId === null
              ? "bg-sky-500 text-white shadow-md shadow-sky-500/30 font-semibold"
              : "bg-[#14202e] border border-slate-800 text-slate-300 hover:bg-[#1c2e42] hover:text-white"
          }`}
        >
          All Accounts
        </button>

        {accounts.map((acc) => {
          const isSelected = filter.selectedAccountId === acc.id;
          return (
            <button
              key={acc.id}
              onClick={() =>
                onFilterChange({
                  selectedAccountId: isSelected ? null : acc.id,
                })
              }
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium whitespace-nowrap border transition-all cursor-pointer ${
                isSelected
                  ? "bg-[#18314e] border-sky-500 text-white shadow-md shadow-sky-500/20 font-semibold"
                  : "bg-[#14202e] border-slate-800 text-slate-300 hover:bg-[#1c2e42] hover:text-white"
              }`}
            >
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: acc.colorTag || "#38bdf8" }}
              />
              <span>{acc.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
