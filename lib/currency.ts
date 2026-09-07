import { CurrencyCode, SteamGame } from "@/types";

// Standard estimated exchange rate: 1 USD = 16,000 IDR
export const USD_TO_IDR_RATE = 16000;

/**
 * Format a numeric amount to a localized currency string
 */
export function formatCurrency(amount: number, currency: CurrencyCode = "IDR"): string {
  if (amount === 0) return "Free";

  if (currency === "IDR") {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount);
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Get total calculated price for a single game (Base Price + DLC Price)
 * Returns value in the game's native currency
 */
export function getGameTotalPrice(game: SteamGame): {
  total: number;
  base: number;
  dlc: number;
  currency: CurrencyCode;
  isFree: boolean;
} {
  const currency: CurrencyCode = game.currency || "IDR";
  if (game.isFree) {
    const dlc = game.includesDlc ? (game.dlcPrice || 0) : 0;
    return {
      total: dlc,
      base: 0,
      dlc,
      currency,
      isFree: dlc === 0,
    };
  }

  const base = game.price || 0;
  const dlc = game.includesDlc ? (game.dlcPrice || 0) : 0;
  const total = base + dlc;

  return {
    total,
    base,
    dlc,
    currency,
    isFree: total === 0,
  };
}

/**
 * Convert any game's total price into the target currency
 */
export function convertToCurrency(
  amount: number,
  from: CurrencyCode,
  to: CurrencyCode
): number {
  if (from === to) return amount;
  if (from === "USD" && to === "IDR") {
    return Math.round(amount * USD_TO_IDR_RATE);
  }
  if (from === "IDR" && to === "USD") {
    return Number((amount / USD_TO_IDR_RATE).toFixed(2));
  }
  return amount;
}

/**
 * Calculate total valuation of a list of games in a chosen target currency
 */
export function calculateTotalValuation(
  games: SteamGame[],
  targetCurrency: CurrencyCode = "IDR"
): number {
  return games.reduce((sum, game) => {
    const { total, currency } = getGameTotalPrice(game);
    const converted = convertToCurrency(total, currency, targetCurrency);
    return sum + converted;
  }, 0);
}
