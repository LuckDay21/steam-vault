import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ appId: string }> }
) {
  const { appId } = await context.params;
  const trimmedAppId = appId?.trim();

  if (!trimmedAppId || !/^\d+$/.test(trimmedAppId)) {
    return NextResponse.json(
      { error: "Invalid Steam AppID format" },
      { status: 400 }
    );
  }

  const defaultCoverUrl = `https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/${trimmedAppId}/library_600x900.jpg`;
  const defaultBannerUrl = `https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/${trimmedAppId}/header.jpg`;
  const defaultHeroUrl = `https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/${trimmedAppId}/library_hero.jpg`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(
      `https://store.steampowered.com/api/appdetails?appids=${trimmedAppId}&l=english`,
      {
        signal: controller.signal,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          Accept: "application/json",
        },
        next: { revalidate: 86400 }, // Cache for 24h
      }
    );

    clearTimeout(timeoutId);

    if (!res.ok) {
      return NextResponse.json({
        success: true,
        fallback: true,
        appId: trimmedAppId,
        coverUrl: defaultCoverUrl,
        bannerUrl: defaultBannerUrl,
        heroUrl: defaultHeroUrl,
        genres: [],
      });
    }

    const json = await res.json();
    const appData = json[trimmedAppId];

    if (!appData?.success || !appData?.data) {
      return NextResponse.json({
        success: true,
        fallback: true,
        appId: trimmedAppId,
        coverUrl: defaultCoverUrl,
        bannerUrl: defaultBannerUrl,
        heroUrl: defaultHeroUrl,
        genres: [],
      });
    }

    const data = appData.data;

    // Collect genres
    const genres: string[] = [];
    if (Array.isArray(data.genres)) {
      data.genres.forEach((g: { description?: string }) => {
        if (g.description && !genres.includes(g.description)) {
          genres.push(g.description);
        }
      });
    }

    // Collect select categories (e.g. Co-op, Multi-player, PvP)
    if (Array.isArray(data.categories)) {
      data.categories.forEach((c: { description?: string }) => {
        if (
          c.description &&
          ["Co-op", "Multi-player", "Online Co-op", "PvP", "Single-player"].includes(
            c.description
          ) &&
          !genres.includes(c.description)
        ) {
          genres.push(c.description);
        }
      });
    }

    return NextResponse.json({
      success: true,
      appId: trimmedAppId,
      title: data.name || "",
      coverUrl: defaultCoverUrl,
      bannerUrl: data.header_image || defaultBannerUrl,
      heroUrl: defaultHeroUrl,
      genres,
      shortDescription: data.short_description || "",
    });
  } catch (error) {
    console.warn(`Steam API fetch failed for AppID ${trimmedAppId}:`, error);
    return NextResponse.json({
      success: true,
      fallback: true,
      appId: trimmedAppId,
      coverUrl: defaultCoverUrl,
      bannerUrl: defaultBannerUrl,
      heroUrl: defaultHeroUrl,
      genres: [],
    });
  }
}
