"use client";

import React, { useState, useEffect, useMemo } from "react";
import { SteamHeader } from "@/components/SteamHeader";
import { SteamSidebar } from "@/components/SteamSidebar";
import { SteamHeroStage } from "@/components/SteamHeroStage";
import { SteamDeckGrid } from "@/components/SteamDeckGrid";
import { GameDrawer } from "@/components/GameDrawer";
import { GameModal } from "@/components/GameModal";
import { AccountManagerModal } from "@/components/AccountManagerModal";
import {
  subscribeAccounts,
  subscribeGames,
  saveAccount,
  deleteAccount,
  saveGame,
  deleteGame,
} from "@/lib/store";
import { SteamAccount, SteamGame, FilterState } from "@/types";

export default function Home() {
  const [accounts, setAccounts] = useState<SteamAccount[]>([]);
  const [games, setGames] = useState<SteamGame[]>([]);
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"desktop" | "grid">("desktop");

  // Modals state
  const [isGameModalOpen, setIsGameModalOpen] = useState(false);
  const [editingGame, setEditingGame] = useState<SteamGame | null>(null);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [drawerGame, setDrawerGame] = useState<SteamGame | null>(null);

  // Filters state
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    selectedAccountId: null,
    onlyDuplicates: false,
    selectedGenre: null,
    sortBy: "title-asc",
  });

  // Subscribe to real-time accounts & games
  useEffect(() => {
    const unsubAccounts = subscribeAccounts((updatedAccounts) => {
      setAccounts(updatedAccounts);
    });

    const unsubGames = subscribeGames((updatedGames) => {
      setGames(updatedGames);
      // Auto select first game if none selected
      setSelectedGameId((prev) => {
        if (prev && updatedGames.some((g) => g.id === prev)) return prev;
        return updatedGames.length > 0 ? updatedGames[0].id : null;
      });
    });

    return () => {
      unsubAccounts();
      unsubGames();
    };
  }, []);

  // Compute distinct genres
  const allGenres = useMemo(() => {
    const set = new Set<string>();
    games.forEach((g) => {
      g.genres?.forEach((genre) => {
        if (genre.trim()) set.add(genre.trim());
      });
    });
    return Array.from(set).sort();
  }, [games]);

  // Filter & Sort games
  const filteredGames = useMemo(() => {
    return games
      .filter((game) => {
        // Search filter
        if (filters.search.trim()) {
          const q = filters.search.toLowerCase().trim();
          const matchTitle = game.title.toLowerCase().includes(q);
          const matchAppId = game.steamAppId?.includes(q);
          const matchGenre = game.genres?.some((g) =>
            g.toLowerCase().includes(q)
          );
          if (!matchTitle && !matchAppId && !matchGenre) return false;
        }

        // Account filter
        if (
          filters.selectedAccountId &&
          !(game.accountIds || []).includes(filters.selectedAccountId)
        ) {
          return false;
        }

        // Duplicates filter
        if (filters.onlyDuplicates && (game.accountIds || []).length < 2) {
          return false;
        }

        // Genre filter
        if (
          filters.selectedGenre &&
          !(game.genres || []).includes(filters.selectedGenre)
        ) {
          return false;
        }

        return true;
      })
      .sort((a, b) => a.title.localeCompare(b.title));
  }, [games, filters]);

  // Active game in hero stage
  const selectedGame = useMemo(() => {
    return (
      filteredGames.find((g) => g.id === selectedGameId) ||
      (filteredGames.length > 0 ? filteredGames[0] : null)
    );
  }, [filteredGames, selectedGameId]);

  const handleOpenAddGame = () => {
    setEditingGame(null);
    setIsGameModalOpen(true);
  };

  const handleEditGame = (game: SteamGame) => {
    setEditingGame(game);
    setIsGameModalOpen(true);
  };

  const handleSaveGame = async (
    gameData: Omit<SteamGame, "id" | "createdAt"> & { id?: string }
  ) => {
    const saved = await saveGame(gameData);
    if (saved?.id) {
      setSelectedGameId(saved.id);
    }
  };

  const handleDeleteGame = async (gameId: string) => {
    await deleteGame(gameId);
    if (selectedGameId === gameId) {
      const remaining = games.filter((g) => g.id !== gameId);
      setSelectedGameId(remaining.length > 0 ? remaining[0].id : null);
    }
    if (drawerGame?.id === gameId) {
      setDrawerGame(null);
    }
  };

  const handleSaveAccount = async (
    accountData: Omit<SteamAccount, "id" | "createdAt"> & { id?: string }
  ) => {
    await saveAccount(accountData);
  };

  const handleDeleteAccount = async (accountId: string) => {
    await deleteAccount(accountId);
  };

  const resetFilters = () => {
    setFilters({
      search: "",
      selectedAccountId: null,
      onlyDuplicates: false,
      selectedGenre: null,
      sortBy: "title-asc",
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#171a21] text-[#c6d4df] font-sans antialiased overflow-hidden">
      {/* Top Steam Native Header */}
      <SteamHeader
        accountsCount={accounts.length}
        gamesCount={games.length}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onOpenAddGame={handleOpenAddGame}
        onOpenAccounts={() => setIsAccountModalOpen(true)}
      />

      {/* Main Content Layout */}
      {viewMode === "desktop" ? (
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Left Steam Library Sidebar */}
          <SteamSidebar
            games={filteredGames}
            allGamesCount={games.length}
            accounts={accounts}
            genres={allGenres}
            filter={filters}
            selectedGameId={selectedGame?.id || null}
            onSelectGame={(g) => setSelectedGameId(g.id)}
            onFilterChange={(newF) =>
              setFilters((prev) => ({ ...prev, ...newF }))
            }
          />

          {/* Right Main Stage (Hero Banner, Play Button & Credentials) */}
          <SteamHeroStage
            game={selectedGame}
            accounts={accounts}
            onEditGame={handleEditGame}
            onDeleteGame={handleDeleteGame}
            onOpenAddGame={handleOpenAddGame}
            onOpenAccounts={() => setIsAccountModalOpen(true)}
          />
        </div>
      ) : (
        /* Steam Deck Grid View */
        <SteamDeckGrid
          games={filteredGames}
          allGamesCount={games.length}
          accounts={accounts}
          genres={allGenres}
          filter={filters}
          onFilterChange={(newF) =>
            setFilters((prev) => ({ ...prev, ...newF }))
          }
          onSelectGame={(g) => setDrawerGame(g)}
          onOpenAddGame={handleOpenAddGame}
          onResetFilters={resetFilters}
        />
      )}

      {/* Game Detail Drawer (used in Grid view or mobile) */}
      <GameDrawer
        game={drawerGame}
        accounts={accounts}
        onClose={() => setDrawerGame(null)}
        onEdit={handleEditGame}
        onDelete={handleDeleteGame}
      />

      {/* Add / Edit Game Modal */}
      <GameModal
        isOpen={isGameModalOpen}
        initialGame={editingGame}
        accounts={accounts}
        onClose={() => {
          setIsGameModalOpen(false);
          setEditingGame(null);
        }}
        onSave={handleSaveGame}
      />

      {/* Steam Account Manager Modal */}
      <AccountManagerModal
        isOpen={isAccountModalOpen}
        accounts={accounts}
        onClose={() => setIsAccountModalOpen(false)}
        onSaveAccount={handleSaveAccount}
        onDeleteAccount={handleDeleteAccount}
      />
    </div>
  );
}
