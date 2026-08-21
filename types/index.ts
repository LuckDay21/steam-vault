export interface SteamAccount {
  id: string;
  label: string;
  username: string;
  password: string;
  colorTag?: string;
  notes?: string;
  createdAt: number;
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
}

export type SortOption = "title-asc" | "title-desc" | "newest" | "accounts-desc";

export interface FilterState {
  search: string;
  selectedAccountId: string | null;
  onlyDuplicates: boolean; // Games owned on 2+ accounts
  selectedGenre: string | null;
  sortBy: SortOption;
}
