import {
  ref,
  set,
  remove,
  get,
  onValue,
} from "firebase/database";
import { db, isFirebaseConfigured } from "./firebase";
import { SteamAccount, SteamGame } from "@/types";

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

// Helpers for Local Storage Fallback & Optimistic Cache scoped by userId
function getLocalAccounts(userId: string): SteamAccount[] {
  if (typeof window === "undefined") return [];
  const key = `steam_vault_accounts_${userId}`;
  const data = localStorage.getItem(key);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function saveLocalAccounts(userId: string, accounts: SteamAccount[]) {
  if (typeof window === "undefined") return;
  const key = `steam_vault_accounts_${userId}`;
  localStorage.setItem(key, JSON.stringify(accounts));
}

function getLocalGames(userId: string): SteamGame[] {
  if (typeof window === "undefined") return [];
  const key = `steam_vault_games_${userId}`;
  const data = localStorage.getItem(key);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function saveLocalGames(userId: string, games: SteamGame[]) {
  if (typeof window === "undefined") return;
  const key = `steam_vault_games_${userId}`;
  localStorage.setItem(key, JSON.stringify(games));
}

// ----------------------------------------------------
// Accounts Subscriptions & Actions (Multi-Tenant)
// ----------------------------------------------------
export function subscribeAccounts(
  userId: string,
  callback: (accounts: SteamAccount[]) => void
) {
  callback(getLocalAccounts(userId));

  const handleUpdate = () => {
    callback(getLocalAccounts(userId));
  };

  window.addEventListener(EVENT_NAME, handleUpdate);
  window.addEventListener("storage", handleUpdate);

  let unsubscribeDatabase: (() => void) | null = null;

  // Only sync to cloud if authenticated (not guest)
  if (db && isFirebaseConfigured && userId && userId !== "guest") {
    const accountsRef = ref(db, `users/${userId}/accounts`);
    unsubscribeDatabase = onValue(
      accountsRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const val = snapshot.val();
          const list: SteamAccount[] = val ? Object.values(val) : [];
          list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
          saveLocalAccounts(userId, list);
          callback(list);
        } else {
          const local = getLocalAccounts(userId);
          if (local.length > 0) {
            local.forEach((acc) => {
              set(
                ref(db!, `users/${userId}/accounts/${acc.id}`),
                sanitizeForFirebase(acc as unknown as Record<string, unknown>)
              ).catch(() => {});
            });
            callback(local);
          } else {
            callback([]);
          }
        }
      },
      (error) => {
        console.warn("Realtime Database accounts error, keeping local:", error);
        callback(getLocalAccounts(userId));
      }
    );
  }

  return () => {
    window.removeEventListener(EVENT_NAME, handleUpdate);
    window.removeEventListener("storage", handleUpdate);
    if (unsubscribeDatabase) unsubscribeDatabase();
  };
}

export async function saveAccount(
  userId: string,
  account: Omit<SteamAccount, "id" | "createdAt"> & { id?: string }
) {
  const accountId = account.id || `acc-${Date.now()}`;
  const record: SteamAccount = {
    ...account,
    id: accountId,
    createdAt: Date.now(),
  };

  // 1. Optimistic local update
  const list = getLocalAccounts(userId);
  const index = list.findIndex((a) => a.id === accountId);
  if (index >= 0) {
    list[index] = { ...list[index], ...record };
  } else {
    list.unshift(record);
  }
  saveLocalAccounts(userId, list);
  window.dispatchEvent(new Event(EVENT_NAME));

  // 2. Sync to Firebase Realtime Database
  if (db && isFirebaseConfigured && userId && userId !== "guest") {
    try {
      await set(
        ref(db, `users/${userId}/accounts/${accountId}`),
        sanitizeForFirebase(record as unknown as Record<string, unknown>)
      );
    } catch (error) {
      console.error("Firebase Realtime Database saveAccount error:", error);
    }
  }

  return record;
}

export async function deleteAccount(userId: string, accountId: string) {
  // 1. Optimistic local update
  const list = getLocalAccounts(userId).filter((a) => a.id !== accountId);
  saveLocalAccounts(userId, list);

  const games = getLocalGames(userId).map((g) => ({
    ...g,
    accountIds: (g.accountIds || []).filter((id) => id !== accountId),
  }));
  saveLocalGames(userId, games);
  window.dispatchEvent(new Event(EVENT_NAME));

  // 2. Sync to Firebase Realtime Database
  if (db && isFirebaseConfigured && userId && userId !== "guest") {
    try {
      await remove(ref(db, `users/${userId}/accounts/${accountId}`));
      const gamesSnap = await get(ref(db, `users/${userId}/games`));
      if (gamesSnap.exists()) {
        const gamesData = gamesSnap.val();
        for (const [gId, gVal] of Object.entries(gamesData)) {
          const gameObj = gVal as SteamGame;
          if (gameObj.accountIds?.includes(accountId)) {
            const updatedAccounts = gameObj.accountIds.filter((id) => id !== accountId);
            await set(ref(db, `users/${userId}/games/${gId}/accountIds`), updatedAccounts);
          }
        }
      }
    } catch (error) {
      console.error("Firebase Realtime Database deleteAccount error:", error);
    }
  }
}

// ----------------------------------------------------
// Games Subscriptions & Actions (Multi-Tenant)
// ----------------------------------------------------
export function subscribeGames(
  userId: string,
  callback: (games: SteamGame[]) => void
) {
  callback(getLocalGames(userId));

  const handleUpdate = () => {
    callback(getLocalGames(userId));
  };

  window.addEventListener(EVENT_NAME, handleUpdate);
  window.addEventListener("storage", handleUpdate);

  let unsubscribeDatabase: (() => void) | null = null;

  if (db && isFirebaseConfigured && userId && userId !== "guest") {
    const gamesRef = ref(db, `users/${userId}/games`);
    unsubscribeDatabase = onValue(
      gamesRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const val = snapshot.val();
          const list: SteamGame[] = val ? Object.values(val) : [];
          list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
          saveLocalGames(userId, list);
          callback(list);
        } else {
          const local = getLocalGames(userId);
          if (local.length > 0) {
            local.forEach((g) => {
              set(
                ref(db!, `users/${userId}/games/${g.id}`),
                sanitizeForFirebase(g as unknown as Record<string, unknown>)
              ).catch(() => {});
            });
            callback(local);
          } else {
            callback([]);
          }
        }
      },
      (error) => {
        console.warn("Realtime Database games error, keeping local:", error);
        callback(getLocalGames(userId));
      }
    );
  }

  return () => {
    window.removeEventListener(EVENT_NAME, handleUpdate);
    window.removeEventListener("storage", handleUpdate);
    if (unsubscribeDatabase) unsubscribeDatabase();
  };
}

export async function saveGame(
  userId: string,
  game: Omit<SteamGame, "id" | "createdAt"> & { id?: string }
) {
  const gameId = game.id || `game-${Date.now()}`;
  const record: SteamGame = {
    ...game,
    id: gameId,
    createdAt: Date.now(),
  };

  // 1. Optimistic local update
  const list = getLocalGames(userId);
  const index = list.findIndex((g) => g.id === gameId);
  if (index >= 0) {
    list[index] = { ...list[index], ...record };
  } else {
    list.unshift(record);
  }
  saveLocalGames(userId, list);
  window.dispatchEvent(new Event(EVENT_NAME));

  // 2. Sync to Firebase Realtime Database
  if (db && isFirebaseConfigured && userId && userId !== "guest") {
    try {
      await set(
        ref(db, `users/${userId}/games/${gameId}`),
        sanitizeForFirebase(record as unknown as Record<string, unknown>)
      );
    } catch (error) {
      console.error("Firebase Realtime Database saveGame error:", error);
    }
  }

  return record;
}

export async function deleteGame(userId: string, gameId: string) {
  // 1. Optimistic local update
  const list = getLocalGames(userId).filter((g) => g.id !== gameId);
  saveLocalGames(userId, list);
  window.dispatchEvent(new Event(EVENT_NAME));

  // 2. Sync to Firebase Realtime Database
  if (db && isFirebaseConfigured && userId && userId !== "guest") {
    try {
      await remove(ref(db, `users/${userId}/games/${gameId}`));
    } catch (error) {
      console.error("Firebase Realtime Database deleteGame error:", error);
    }
  }
}
