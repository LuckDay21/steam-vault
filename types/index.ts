export interface SteamAccount {
  id: string;
  label: string;
  username: string;
  password: string;
  colorTag?: string;
  notes?: string;
  createdAt: number;
}

export type CurrencyCode = "IDR" | "USD";

export interface SteamGameDlcItem {
  id: number;
  name: string;
  price: number;
  headerImage?: string;
  selected: boolean;
}

export interface SteamGame {
  id: string;
  title: string;
  steamAppId?: string;
  coverUrl?: string;
  bannerUrl?: string;
  genres: string[];
  accountIds: string[];
  notes?: string;
  createdAt: number;

  // Pricing & DLC fields
  price?: number;            // Base game price (e.g. 759000 or 59.99)
  currency?: CurrencyCode;   // "IDR" | "USD"
  isFree?: boolean;          // true if free-to-play
  includesDlc?: boolean;     // true if user owns DLCs
  dlcPrice?: number;         // Additional amount for DLCs
  dlcItems?: SteamGameDlcItem[]; // Individual DLC items with selection state
}

export type SortOption = "title-asc" | "title-desc" | "newest" | "accounts-desc" | "price-desc" | "price-asc";

export interface FilterState {
  search: string;
  selectedAccountId: string | null;
  onlyDuplicates: boolean; // Games owned on 2+ accounts
  selectedGenre: string | null;
  sortBy: SortOption;
}
