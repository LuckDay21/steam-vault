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

  // Check currency query parameter, default to "id" (IDR), support "us" (USD)
  const searchParams = request.nextUrl.searchParams;
  const requestedCurrency = (searchParams.get("currency") || "IDR").toUpperCase();
  const countryCode = requestedCurrency === "USD" ? "us" : "id";

  const defaultCoverUrl = `https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/${trimmedAppId}/library_600x900.jpg`;
  const defaultBannerUrl = `https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/${trimmedAppId}/header.jpg`;
  const defaultHeroUrl = `https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/${trimmedAppId}/library_hero.jpg`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    // Parallel fetch: App Details + DLC List
    const [appDetailsRes, dlcRes] = await Promise.allSettled([
      fetch(
        `https://store.steampowered.com/api/appdetails?appids=${trimmedAppId}&cc=${countryCode}&l=english`,
        {
          signal: controller.signal,
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            Accept: "application/json",
          },
          next: { revalidate: 86400 },
        }
      ),
      fetch(
        `https://store.steampowered.com/api/dlcforapp/?appid=${trimmedAppId}&cc=${countryCode}`,
        {
          signal: controller.signal,
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            Accept: "application/json",
          },
          next: { revalidate: 86400 },
        }
      ),
    ]);

    clearTimeout(timeoutId);

    // Parse App Details
    let data: any = null;
    if (appDetailsRes.status === "fulfilled" && appDetailsRes.value.ok) {
      try {
        const json = await appDetailsRes.value.json();
        data = json[trimmedAppId]?.data;
      } catch (e) {
        console.warn("Error parsing appdetails json:", e);
      }
    }

    // Parse DLC Details
    interface DlcItemResult {
      id: number;
      name: string;
      price: number;
      headerImage?: string;
    }
    const dlcList: DlcItemResult[] = [];

    if (dlcRes.status === "fulfilled" && dlcRes.value.ok) {
      try {
        const dlcJson = await dlcRes.value.json();
        if (Array.isArray(dlcJson.dlc)) {
          dlcJson.dlc.forEach((item: any) => {
            let itemPrice = 0;
            if (item.price_overview?.final) {
              itemPrice = item.price_overview.final / 100;
            }
            dlcList.push({
              id: item.id,
              name: item.name || `DLC #${item.id}`,
              price: itemPrice,
              headerImage: item.header_image || undefined,
            });
          });
        }
      } catch (e) {
        console.warn("Error parsing dlcforapp json:", e);
      }
    }

    if (!data) {
      return NextResponse.json({
        success: true,
        fallback: true,
        appId: trimmedAppId,
        coverUrl: defaultCoverUrl,
        bannerUrl: defaultBannerUrl,
        heroUrl: defaultHeroUrl,
        genres: [],
        price: 0,
        currency: requestedCurrency,
        isFree: false,
        hasDlc: dlcList.length > 0,
        dlcList,
      });
    }

    // Collect genres
    const genres: string[] = [];
    if (Array.isArray(data.genres)) {
      data.genres.forEach((g: { description?: string }) => {
        if (g.description && !genres.includes(g.description)) {
          genres.push(g.description);
        }
      });
    }

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

    // Extract price information
    let price = 0;
    const isFree = Boolean(data.is_free);
    let currency = requestedCurrency;

    if (!isFree && data.price_overview) {
      const rawFinal = data.price_overview.final || 0;
      currency = (data.price_overview.currency || requestedCurrency).toUpperCase();
      price = rawFinal / 100;
    }

    const hasDlc = dlcList.length > 0 || (Array.isArray(data.dlc) && data.dlc.length > 0);

    return NextResponse.json({
      success: true,
      appId: trimmedAppId,
      title: data.name || "",
      coverUrl: defaultCoverUrl,
      bannerUrl: data.header_image || defaultBannerUrl,
      heroUrl: defaultHeroUrl,
      genres,
      shortDescription: data.short_description || "",
      price,
      currency,
      isFree,
      hasDlc,
      dlcCount: dlcList.length || (data.dlc?.length ?? 0),
      dlcList,
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
      price: 0,
      currency: requestedCurrency,
      isFree: false,
      hasDlc: false,
      dlcList: [],
    });
  }
}
