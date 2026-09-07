"use client";

import React, { useState, useEffect, useMemo } from "react";
import { SteamHeader } from "@/components/SteamHeader";
import { SteamSidebar } from "@/components/SteamSidebar";
import { SteamHeroStage } from "@/components/SteamHeroStage";
import { SteamDeckGrid } from "@/components/SteamDeckGrid";
import { GameDrawer } from "@/components/GameDrawer";
import { GameModal } from "@/components/GameModal";
import { AccountManagerModal } from "@/components/AccountManagerModal";
import { WelcomeHero } from "@/components/WelcomeHero";
import { useAuth } from "@/context/AuthContext";
import {
  subscribeAccounts,
  subscribeGames,
  saveAccount,
  deleteAccount,
  saveGame,
  deleteGame,
} from "@/lib/store";
import { CurrencyCode, SteamAccount, SteamGame, FilterState } from "@/types";
import { calculateTotalValuation, convertToCurrency, getGameTotalPrice } from "@/lib/currency";
import { Loader2 } from "lucide-react";

export default function Home() {
  const {
    user,
    loading: isAuthLoading,
    isGuestMode,
    activeUserId,
    signInWithGoogle,
    signOutUser,
    enableGuestMode,
  } = useAuth();

  const [accounts, setAccounts] = useState<SteamAccount[]>([]);
  const [games, setGames] = useState<SteamGame[]>([]);
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"desktop" | "grid">("desktop");
  const [preferredCurrency, setPreferredCurrency] = useState<CurrencyCode>("IDR");

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

  // Subscribe to real-time accounts & games scoped by activeUserId
  useEffect(() => {
    if (!activeUserId) return;

    const unsubAccounts = subscribeAccounts(activeUserId, (updatedAccounts) => {
      setAccounts(updatedAccounts);
    });

    const unsubGames = subscribeGames(activeUserId, (updatedGames) => {
      setGames(updatedGames);
      setSelectedGameId((prev) => {
        if (prev && updatedGames.some((g) => g.id === prev)) return prev;
        return updatedGames.length > 0 ? updatedGames[0].id : null;
      });
    });

    return () => {
      unsubAccounts();
      unsubGames();
    };
  }, [activeUserId]);

  // Compute distinct genres
  const allGenres = useMemo(() => {
    const set = new Set<string>();
    games.forEach((g) => {
      (g.genres || []).forEach((genre) => {
        if (genre?.trim()) set.add(genre.trim());
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
          const matchTitle = game.title?.toLowerCase().includes(q);
          const matchAppId = game.steamAppId?.includes(q);
          const matchGenre = (game.genres || []).some((g) =>
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
      .sort((a, b) => {
        switch (filters.sortBy) {
          case "title-asc":
            return a.title.localeCompare(b.title);
          case "title-desc":
            return b.title.localeCompare(a.title);
          case "newest":
            return (b.createdAt || 0) - (a.createdAt || 0);
          case "accounts-desc":
            return (b.accountIds || []).length - (a.accountIds || []).length;
          case "price-desc": {
            const priceA = convertToCurrency(getGameTotalPrice(a).total, a.currency || "IDR", preferredCurrency);
            const priceB = convertToCurrency(getGameTotalPrice(b).total, b.currency || "IDR", preferredCurrency);
            return priceB - priceA;
          }
          case "price-asc": {
            const priceA = convertToCurrency(getGameTotalPrice(a).total, a.currency || "IDR", preferredCurrency);
            const priceB = convertToCurrency(getGameTotalPrice(b).total, b.currency || "IDR", preferredCurrency);
            return priceA - priceB;
          }
          default:
            return 0;
        }
      });
  }, [games, filters, preferredCurrency]);

  // Active game in hero stage
  const selectedGame = useMemo(() => {
    return (
      filteredGames.find((g) => g.id === selectedGameId) ||
      (filteredGames.length > 0 ? filteredGames[0] : null)
    );
  }, [filteredGames, selectedGameId]);

  // Total valuations
  const allGamesValuation = useMemo(() => {
    return calculateTotalValuation(games, preferredCurrency);
  }, [games, preferredCurrency]);

  const filteredValuation = useMemo(() => {
    return calculateTotalValuation(filteredGames, preferredCurrency);
  }, [filteredGames, preferredCurrency]);

  const togglePreferredCurrency = () => {
    setPreferredCurrency((prev) => (prev === "IDR" ? "USD" : "IDR"));
  };

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
    const saved = await saveGame(activeUserId, gameData);
    if (saved?.id) {
      setSelectedGameId(saved.id);
    }
  };

  const handleDeleteGame = async (gameId: string) => {
    await deleteGame(activeUserId, gameId);
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
    await saveAccount(activeUserId, accountData);
  };

  const handleDeleteAccount = async (accountId: string) => {
    await deleteAccount(activeUserId, accountId);
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

  // Auth Loading Screen
  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#171a21] text-[#66c0f4]">
        <Loader2 className="w-8 h-8 animate-spin mb-3" />
        <span className="text-xs font-bold tracking-widest text-[#8f98a0] uppercase">
          Loading Steam Vault...
        </span>
      </div>
    );
  }

  const showVaultUI = Boolean(user || isGuestMode);

  return (
    <div className="min-h-screen flex flex-col bg-[#171a21] text-[#c6d4df] font-sans antialiased overflow-hidden">
      {/* Top Steam Native Header */}
      <SteamHeader
        user={user}
        isGuestMode={isGuestMode}
        accountsCount={accounts.length}
        gamesCount={games.length}
        totalValuation={allGamesValuation}
        preferredCurrency={preferredCurrency}
        onToggleCurrency={togglePreferredCurrency}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onOpenAddGame={handleOpenAddGame}
        onOpenAccounts={() => setIsAccountModalOpen(true)}
        onSignInWithGoogle={signInWithGoogle}
        onSignOut={signOutUser}
      />

      {/* Main Content Area */}
      {!showVaultUI ? (
        /* Public Welcome Landing when not signed in */
        <WelcomeHero
          onSignInWithGoogle={signInWithGoogle}
          onContinueAsGuest={enableGuestMode}
        />
      ) : viewMode === "desktop" ? (
        /* Desktop Client View (Sidebar + Main Hero Stage) */
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Left Steam Library Sidebar */}
          <SteamSidebar
            games={filteredGames}
            allGamesCount={games.length}
            accounts={accounts}
            genres={allGenres}
            filter={filters}
            selectedGameId={selectedGame?.id || null}
            totalFilteredValuation={filteredValuation}
            preferredCurrency={preferredCurrency}
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
