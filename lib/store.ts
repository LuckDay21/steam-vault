import {
  ref,
  set,
  remove,
  get,
  onValue,
} from "firebase/database";
import { db, isFirebaseConfigured } from "./firebase";
import { SteamAccount, SteamGame } from "@/types";

const LOCAL_STORAGE_ACCOUNTS = "steam_vault_accounts";
const LOCAL_STORAGE_GAMES = "steam_vault_games";
const EVENT_NAME = "steam-vault-storage";

// Helper to remove undefined keys which Firebase RTDB disallows
function sanitizeForFirebase<T extends Record<string, unknown>>(data: T): Partial<T> {
  const clean: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(data)) {
    if (val !== undefined) {
      clean[key] = val;
    }
  }
  return clean as Partial<T>;
}

// Helpers for Local Storage Fallback & Optimistic Cache
function getLocalAccounts(): SteamAccount[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(LOCAL_STORAGE_ACCOUNTS);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function saveLocalAccounts(accounts: SteamAccount[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LOCAL_STORAGE_ACCOUNTS, JSON.stringify(accounts));
}

function getLocalGames(): SteamGame[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(LOCAL_STORAGE_GAMES);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function saveLocalGames(games: SteamGame[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LOCAL_STORAGE_GAMES, JSON.stringify(games));
}

// ----------------------------------------------------
// Accounts Subscriptions & Actions
// ----------------------------------------------------
export function subscribeAccounts(callback: (accounts: SteamAccount[]) => void) {
  // Always emit cached local state immediately for zero-delay UI
  callback(getLocalAccounts());

  const handleUpdate = () => {
    callback(getLocalAccounts());
  };

  window.addEventListener(EVENT_NAME, handleUpdate);
  window.addEventListener("storage", handleUpdate);

  let unsubscribeDatabase: (() => void) | null = null;

  if (db && isFirebaseConfigured) {
    const accountsRef = ref(db, "accounts");
    unsubscribeDatabase = onValue(
      accountsRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const val = snapshot.val();
          const list: SteamAccount[] = val ? Object.values(val) : [];
          list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
          saveLocalAccounts(list);
          callback(list);
        } else {
          // Cloud has no accounts yet; if we have local accounts, sync them up
          const local = getLocalAccounts();
          if (local.length > 0) {
            local.forEach((acc) => {
              set(ref(db!, `accounts/${acc.id}`), sanitizeForFirebase(acc as unknown as Record<string, unknown>)).catch(() => {});
            });
            callback(local);
          } else {
            callback([]);
          }
        }
      },
      (error) => {
        console.warn("Realtime Database accounts error, keeping local:", error);
        callback(getLocalAccounts());
      }
    );
  }

  return () => {
    window.removeEventListener(EVENT_NAME, handleUpdate);
    window.removeEventListener("storage", handleUpdate);
    if (unsubscribeDatabase) unsubscribeDatabase();
  };
}

export async function saveAccount(account: Omit<SteamAccount, "id" | "createdAt"> & { id?: string }) {
  const accountId = account.id || `acc-${Date.now()}`;
  const record: SteamAccount = {
    ...account,
    id: accountId,
    createdAt: Date.now(),
  };

  // 1. Optimistic local update
  const list = getLocalAccounts();
  const index = list.findIndex((a) => a.id === accountId);
  if (index >= 0) {
    list[index] = { ...list[index], ...record };
  } else {
    list.unshift(record);
  }
  saveLocalAccounts(list);
  window.dispatchEvent(new Event(EVENT_NAME));

  // 2. Sync to Firebase Realtime Database
  if (db && isFirebaseConfigured) {
    try {
      await set(ref(db, `accounts/${accountId}`), sanitizeForFirebase(record as unknown as Record<string, unknown>));
    } catch (error) {
      console.error("Firebase Realtime Database saveAccount error:", error);
    }
  }

  return record;
}

export async function deleteAccount(accountId: string) {
  // 1. Optimistic local update
  const list = getLocalAccounts().filter((a) => a.id !== accountId);
  saveLocalAccounts(list);

  const games = getLocalGames().map((g) => ({
    ...g,
    accountIds: (g.accountIds || []).filter((id) => id !== accountId),
  }));
  saveLocalGames(games);
  window.dispatchEvent(new Event(EVENT_NAME));

  // 2. Sync to Firebase Realtime Database
  if (db && isFirebaseConfigured) {
    try {
      await remove(ref(db, `accounts/${accountId}`));
      // Also update games referencing this account in RTDB
      const gamesSnap = await get(ref(db, "games"));
      if (gamesSnap.exists()) {
        const gamesData = gamesSnap.val();
        for (const [gId, gVal] of Object.entries(gamesData)) {
          const gameObj = gVal as SteamGame;
          if (gameObj.accountIds?.includes(accountId)) {
            const updatedAccounts = gameObj.accountIds.filter((id) => id !== accountId);
            await set(ref(db, `games/${gId}/accountIds`), updatedAccounts);
          }
        }
      }
    } catch (error) {
      console.error("Firebase Realtime Database deleteAccount error:", error);
    }
  }
}

// ----------------------------------------------------
// Games Subscriptions & Actions
// ----------------------------------------------------
export function subscribeGames(callback: (games: SteamGame[]) => void) {
  // Always emit cached local state immediately for zero-delay UI
  callback(getLocalGames());

  const handleUpdate = () => {
    callback(getLocalGames());
  };

  window.addEventListener(EVENT_NAME, handleUpdate);
  window.addEventListener("storage", handleUpdate);

  let unsubscribeDatabase: (() => void) | null = null;

  if (db && isFirebaseConfigured) {
    const gamesRef = ref(db, "games");
    unsubscribeDatabase = onValue(
      gamesRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const val = snapshot.val();
          const list: SteamGame[] = val ? Object.values(val) : [];
          list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
          saveLocalGames(list);
          callback(list);
        } else {
          const local = getLocalGames();
          if (local.length > 0) {
            local.forEach((g) => {
              set(ref(db!, `games/${g.id}`), sanitizeForFirebase(g as unknown as Record<string, unknown>)).catch(() => {});
            });
            callback(local);
          } else {
            callback([]);
          }
        }
      },
      (error) => {
        console.warn("Realtime Database games error, keeping local:", error);
        callback(getLocalGames());
      }
    );
  }

  return () => {
    window.removeEventListener(EVENT_NAME, handleUpdate);
    window.removeEventListener("storage", handleUpdate);
    if (unsubscribeDatabase) unsubscribeDatabase();
  };
}

export async function saveGame(game: Omit<SteamGame, "id" | "createdAt"> & { id?: string }) {
  const gameId = game.id || `game-${Date.now()}`;
  const record: SteamGame = {
    ...game,
    id: gameId,
    createdAt: Date.now(),
  };

  // 1. Optimistic local update
  const list = getLocalGames();
  const index = list.findIndex((g) => g.id === gameId);
  if (index >= 0) {
    list[index] = { ...list[index], ...record };
  } else {
    list.unshift(record);
  }
  saveLocalGames(list);
  window.dispatchEvent(new Event(EVENT_NAME));

  // 2. Sync to Firebase Realtime Database
  if (db && isFirebaseConfigured) {
    try {
      await set(ref(db, `games/${gameId}`), sanitizeForFirebase(record as unknown as Record<string, unknown>));
    } catch (error) {
      console.error("Firebase Realtime Database saveGame error:", error);
    }
  }

  return record;
}

export async function deleteGame(gameId: string) {
  // 1. Optimistic local update
  const list = getLocalGames().filter((g) => g.id !== gameId);
  saveLocalGames(list);
  window.dispatchEvent(new Event(EVENT_NAME));

  // 2. Sync to Firebase Realtime Database
  if (db && isFirebaseConfigured) {
    try {
      await remove(ref(db, `games/${gameId}`));
    } catch (error) {
      console.error("Firebase Realtime Database deleteGame error:", error);
    }
  }
}
