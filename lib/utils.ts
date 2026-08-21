import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getSteamPosterUrl(appId: string | number): string {
  return `https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/${appId}/library_600x900.jpg`;
}

export function getSteamBannerUrl(appId: string | number): string {
  return `https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/${appId}/header.jpg`;
}

export function getSteamHeroUrl(appId: string | number): string {
  return `https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/${appId}/library_hero.jpg`;
}
