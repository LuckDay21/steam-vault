"use client";

import React, { useState, useEffect } from "react";
import { CurrencyCode, SteamAccount, SteamGame, SteamGameDlcItem } from "@/types";
import {
  X,
  Sparkles,
  Image as ImageIcon,
  Check,
  Gamepad2,
  Loader2,
  DollarSign,
  Package,
  CheckSquare,
  Square,
  Layers,
} from "lucide-react";
import { getSteamBannerUrl, getSteamPosterUrl } from "@/lib/utils";
import { formatCurrency } from "@/lib/currency";

interface GameModalProps {
  isOpen: boolean;
  initialGame?: SteamGame | null;
  accounts: SteamAccount[];
  onClose: () => void;
  onSave: (game: Omit<SteamGame, "id" | "createdAt"> & { id?: string }) => void;
}

export function GameModal({
  isOpen,
  initialGame,
  accounts,
  onClose,
  onSave,
}: GameModalProps) {
  const [title, setTitle] = useState("");
  const [steamAppId, setSteamAppId] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [genresInput, setGenresInput] = useState("");
  const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>([]);
  const [notes, setNotes] = useState("");

  // Pricing & DLC state
  const [price, setPrice] = useState<string>("");
  const [currency, setCurrency] = useState<CurrencyCode>("IDR");
  const [isFree, setIsFree] = useState<boolean>(false);
  const [includesDlc, setIncludesDlc] = useState<boolean>(false);
  const [dlcPrice, setDlcPrice] = useState<string>("");
  const [dlcItems, setDlcItems] = useState<SteamGameDlcItem[]>([]);

  const [previewError, setPreviewError] = useState(false);
  const [isLoadingSteam, setIsLoadingSteam] = useState(false);
  const [fetchSuccessMessage, setFetchSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (initialGame) {
      setTitle(initialGame.title || "");
      setSteamAppId(initialGame.steamAppId || "");
      setCoverUrl(initialGame.coverUrl || "");
      setBannerUrl(initialGame.bannerUrl || "");
      setGenresInput(initialGame.genres?.join(", ") || "");
      setSelectedAccountIds(initialGame.accountIds || []);
      setNotes(initialGame.notes || "");
      setPrice(initialGame.price !== undefined ? String(initialGame.price) : "");
      setCurrency(initialGame.currency || "IDR");
      setIsFree(Boolean(initialGame.isFree));
      setIncludesDlc(Boolean(initialGame.includesDlc));
      setDlcPrice(initialGame.dlcPrice !== undefined ? String(initialGame.dlcPrice) : "");
      setDlcItems(initialGame.dlcItems || []);
    } else {
      setTitle("");
      setSteamAppId("");
      setCoverUrl("");
      setBannerUrl("");
      setGenresInput("");
      setSelectedAccountIds(accounts.length === 1 ? [accounts[0].id] : []);
      setNotes("");
      setPrice("");
      setCurrency("IDR");
      setIsFree(false);
      setIncludesDlc(false);
      setDlcPrice("");
      setDlcItems([]);
    }
    setPreviewError(false);
    setIsLoadingSteam(false);
    setFetchSuccessMessage(null);
  }, [initialGame, isOpen, accounts]);

  if (!isOpen) return null;

  const handleFetchSteamAssets = async () => {
    const trimmedId = steamAppId.trim();
    if (!trimmedId) return;

    setIsLoadingSteam(true);
    setFetchSuccessMessage(null);

    try {
      const res = await fetch(`/api/steam/${trimmedId}?currency=${currency}`);
      if (res.ok) {
        const data = await res.json();
        if (data.title && !title.trim()) {
          setTitle(data.title);
        }
        if (Array.isArray(data.genres) && data.genres.length > 0) {
          setGenresInput(data.genres.join(", "));
        }
        if (data.coverUrl) {
          setCoverUrl(data.coverUrl);
        }
        if (data.bannerUrl) {
          setBannerUrl(data.bannerUrl);
        }

        // Auto-fill price info
        if (data.isFree) {
          setIsFree(true);
          setPrice("0");
        } else if (data.price !== undefined && data.price > 0) {
          setIsFree(false);
          setPrice(String(data.price));
          if (data.currency === "USD" || data.currency === "IDR") {
            setCurrency(data.currency);
          }
        }

        // Auto-fill DLC list
        if (Array.isArray(data.dlcList) && data.dlcList.length > 0) {
          // Map to SteamGameDlcItem preserving any currently selected items
          const mappedDlc: SteamGameDlcItem[] = data.dlcList.map((d: any) => {
            const existing = dlcItems.find((item) => item.id === d.id);
            return {
              id: d.id,
              name: d.name,
              price: d.price || 0,
              headerImage: d.headerImage,
              selected: existing ? existing.selected : false,
            };
          });
          setDlcItems(mappedDlc);
          setIncludesDlc(true);

          // Calculate current selected DLC total
          const selectedTotal = mappedDlc
            .filter((d) => d.selected)
            .reduce((sum, d) => sum + d.price, 0);
          if (selectedTotal > 0) {
            setDlcPrice(String(selectedTotal));
          }
        }

        setFetchSuccessMessage("Steam info, price & DLCs loaded!");
        setTimeout(() => setFetchSuccessMessage(null), 3500);
      } else {
        setCoverUrl(getSteamPosterUrl(trimmedId));
        setBannerUrl(getSteamBannerUrl(trimmedId));
      }
    } catch {
      setCoverUrl(getSteamPosterUrl(trimmedId));
      setBannerUrl(getSteamBannerUrl(trimmedId));
    } finally {
      setPreviewError(false);
      setIsLoadingSteam(false);
    }
  };

  const toggleAccount = (accId: string) => {
    setSelectedAccountIds((prev) =>
      prev.includes(accId)
        ? prev.filter((id) => id !== accId)
        : [...prev, accId]
    );
  };

  // Toggle individual DLC selection and update dlcPrice automatically
  const toggleDlcItem = (dlcId: number) => {
    setDlcItems((prev) => {
      const updated = prev.map((item) =>
        item.id === dlcId ? { ...item, selected: !item.selected } : item
      );

      // Auto-sum selected DLC prices
      const sum = updated
        .filter((item) => item.selected)
        .reduce((total, item) => total + item.price, 0);

      setDlcPrice(sum > 0 ? String(sum) : "");
      return updated;
    });
  };

  // Select / Deselect all DLCs
  const handleSelectAllDlcs = (selectAll: boolean) => {
    setDlcItems((prev) => {
      const updated = prev.map((item) => ({ ...item, selected: selectAll }));
      const sum = selectAll
        ? updated.reduce((total, item) => total + item.price, 0)
        : 0;
      setDlcPrice(sum > 0 ? String(sum) : "");
      return updated;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const parsedGenres = genresInput
      .split(",")
      .map((g) => g.trim())
      .filter(Boolean);

    const parsedPrice = isFree ? 0 : price ? Number(price) : undefined;
    const parsedDlcPrice = includesDlc && dlcPrice ? Number(dlcPrice) : undefined;

    onSave({
      id: initialGame?.id,
      title: title.trim(),
      steamAppId: steamAppId.trim() || undefined,
      coverUrl: coverUrl.trim() || undefined,
      bannerUrl: bannerUrl.trim() || undefined,
      genres: parsedGenres,
      accountIds: selectedAccountIds,
      notes: notes.trim() || undefined,
      price: parsedPrice,
      currency,
      isFree,
      includesDlc,
      dlcPrice: parsedDlcPrice,
      dlcItems: includesDlc ? dlcItems : [],
    });

    onClose();
  };

  const currentPoster =
    coverUrl || (steamAppId ? getSteamPosterUrl(steamAppId) : null);

  // Calculate live preview total
  const numBase = isFree ? 0 : Number(price) || 0;
  const numDlc = includesDlc ? Number(dlcPrice) || 0 : 0;
  const calculatedTotal = numBase + numDlc;
  const selectedDlcCount = dlcItems.filter((d) => d.selected).length;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity animate-in fade-in"
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-2xl bg-[#0f1722] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#121c29]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <Gamepad2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                {initialGame ? "Edit Game" : "Add Game to Vault"}
              </h3>
              <p className="text-xs text-slate-400">
                Track game titles, pricing valuation, DLC checklist, and account ownership
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[82vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left: Poster Preview */}
            <div className="flex flex-col items-center gap-2">
              <span className="text-xs font-semibold text-slate-400 uppercase self-start">
                Cover Poster Preview
              </span>
              <div className="w-full aspect-[2/3] max-w-[180px] rounded-xl bg-[#172332] border border-slate-700/80 overflow-hidden flex items-center justify-center relative shadow-inner">
                {currentPoster && !previewError ? (
                  <img
                    src={currentPoster}
                    alt="Cover preview"
                    onError={() => setPreviewError(true)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center p-3 text-slate-500 flex flex-col items-center">
                    <ImageIcon className="w-8 h-8 mb-1 text-slate-600" />
                    <span className="text-[11px]">No Cover Art</span>
                  </div>
                )}
              </div>
              <span className="text-[10px] text-slate-500 text-center">
                Steam 600x900 Capsule
              </span>
            </div>

            {/* Right: Primary Inputs */}
            <div className="md:col-span-2 space-y-4">
              {/* Steam App ID + Auto Fetch Button */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Steam App ID
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={steamAppId}
                    onChange={(e) => setSteamAppId(e.target.value)}
                    placeholder="e.g. 730, 1091500, 1245620"
                    className="flex-1 px-3.5 py-2 rounded-xl bg-[#141f2d] border border-slate-700 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleFetchSteamAssets}
                    disabled={!steamAppId.trim() || isLoadingSteam}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-500 disabled:opacity-40 disabled:hover:bg-sky-600 text-white transition-all shadow-sm cursor-pointer shrink-0"
                  >
                    {isLoadingSteam ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Fetching...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-sky-200" />
                        <span>Auto-Fill Info</span>
                      </>
                    )}
                  </button>
                </div>
                {fetchSuccessMessage && (
                  <p className="text-[11px] text-emerald-400 font-medium mt-1 flex items-center gap-1 animate-in fade-in">
                    <Check className="w-3 h-3" />
                    <span>{fetchSuccessMessage}</span>
                  </p>
                )}
                <p className="text-[11px] text-slate-500 mt-1">
                  Auto-fetch pulls the game title, pricing, tags, and complete DLC catalog with prices.
                </p>
              </div>

              {/* Game Title */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Game Title <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Cyberpunk 2077, Elden Ring, CS2"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#141f2d] border border-slate-700 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                />
              </div>

              {/* Genres / Tags */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Game Tags / Genres
                </label>
                <input
                  type="text"
                  value={genresInput}
                  onChange={(e) => setGenresInput(e.target.value)}
                  placeholder="e.g. Action, RPG, Open World, Co-op"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#141f2d] border border-slate-700 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>
          </div>

          {/* Pricing & DLC Section */}
          <div className="p-4 rounded-xl bg-[#121c29] border border-[#212f42] space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                <span>Price & DLC Valuation</span>
              </span>
              <span className="text-[11px] font-semibold text-emerald-400">
                Total: {formatCurrency(calculatedTotal, currency)}
              </span>
            </div>

            {/* Base Price Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Currency
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                  className="w-full px-3 py-2 rounded-xl bg-[#141f2d] border border-slate-700 text-xs font-bold text-slate-200 focus:outline-none focus:border-sky-500 cursor-pointer"
                >
                  <option value="IDR">IDR (Rp)</option>
                  <option value="USD">USD ($)</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-400">
                    Base Game Price
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isFree}
                      onChange={(e) => {
                        setIsFree(e.target.checked);
                        if (e.target.checked) setPrice("0");
                      }}
                      className="rounded accent-sky-500 w-3.5 h-3.5"
                    />
                    <span>Free to Play</span>
                  </label>
                </div>
                <input
                  type="number"
                  step="any"
                  disabled={isFree}
                  value={isFree ? "0" : price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder={currency === "IDR" ? "e.g. 759000" : "e.g. 59.99"}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#141f2d] border border-slate-700 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-500 disabled:opacity-50 font-mono"
                />
              </div>
            </div>

            {/* DLC Option Toggle & Interactive Checklist */}
            <div className="pt-2 border-t border-slate-800/80 space-y-3">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={includesDlc}
                    onChange={(e) => setIncludesDlc(e.target.checked)}
                    className="rounded accent-emerald-500 w-4 h-4 cursor-pointer"
                  />
                  <span className="text-xs font-bold text-slate-200">
                    Includes DLCs / Expansion Packs
                  </span>
                </label>

                {includesDlc && (
                  <div className="flex items-center gap-2">
                    {dlcItems.length > 0 && (
                      <span className="text-[11px] font-semibold text-sky-400">
                        {selectedDlcCount}/{dlcItems.length} Owned
                      </span>
                    )}
                    <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      Active
                    </span>
                  </div>
                )}
              </div>

              {includesDlc && (
                <div className="space-y-3 pt-1 animate-in fade-in duration-150">
                  {/* DLC Interactive Checklist if DLC items exist */}
                  {dlcItems.length > 0 ? (
                    <div className="space-y-2 rounded-xl bg-[#0e141c] p-3 border border-slate-800">
                      <div className="flex items-center justify-between pb-1 border-b border-slate-800/80 text-[11px]">
                        <span className="font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                          <Package className="w-3.5 h-3.5 text-sky-400" />
                          <span>Select DLCs You Own</span>
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleSelectAllDlcs(true)}
                            className="text-sky-400 hover:text-sky-300 font-semibold cursor-pointer"
                          >
                            Select All
                          </button>
                          <span className="text-slate-600">|</span>
                          <button
                            type="button"
                            onClick={() => handleSelectAllDlcs(false)}
                            className="text-slate-400 hover:text-white cursor-pointer"
                          >
                            Clear
                          </button>
                        </div>
                      </div>

                      {/* Scrollable list of DLC items */}
                      <div className="max-h-44 overflow-y-auto space-y-1.5 pr-1">
                        {dlcItems.map((dlc) => (
                          <div
                            key={dlc.id}
                            onClick={() => toggleDlcItem(dlc.id)}
                            className={`flex items-center justify-between p-2 rounded-lg border text-xs cursor-pointer select-none transition-all ${
                              dlc.selected
                                ? "bg-[#16273c] border-sky-500/70 text-white shadow-xs"
                                : "bg-[#121922] border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300"
                            }`}
                          >
                            <div className="flex items-center gap-2.5 overflow-hidden">
                              <div
                                className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border transition-all ${
                                  dlc.selected
                                    ? "bg-sky-500 border-sky-400 text-white"
                                    : "border-slate-600 bg-slate-900"
                                }`}
                              >
                                {dlc.selected && <Check className="w-3 h-3 stroke-[3]" />}
                              </div>
                              <span className="truncate font-medium">
                                {dlc.name}
                              </span>
                            </div>

                            <span className="font-mono text-[11px] font-bold text-emerald-400 shrink-0 ml-2">
                              {dlc.price > 0 ? formatCurrency(dlc.price, currency) : "Free"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-400 italic">
                      Click &apos;Auto-Fill Info&apos; with a valid Steam AppID to load the official DLC list, or manually enter the DLC price below.
                    </p>
                  )}

                  {/* Manual DLC price override */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-slate-400">
                        Total DLCs Additional Price ({currency})
                      </label>
                      {dlcItems.length > 0 && (
                        <span className="text-[11px] text-slate-500">
                          Auto-calculated from selected items (or edit manually)
                        </span>
                      )}
                    </div>
                    <input
                      type="number"
                      step="any"
                      value={dlcPrice}
                      onChange={(e) => setDlcPrice(e.target.value)}
                      placeholder={currency === "IDR" ? "e.g. 450000" : "e.g. 29.99"}
                      className="w-full px-3.5 py-2 rounded-xl bg-[#141f2d] border border-emerald-500/50 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-400 font-mono"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Custom Artwork URLs (Collapsible/Optional) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Custom Poster Cover URL
              </label>
              <input
                type="url"
                value={coverUrl}
                onChange={(e) => {
                  setCoverUrl(e.target.value);
                  setPreviewError(false);
                }}
                placeholder="https://..."
                className="w-full px-3 py-1.5 rounded-lg bg-[#141f2d] border border-slate-700 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Custom Hero Banner URL
              </label>
              <input
                type="url"
                value={bannerUrl}
                onChange={(e) => setBannerUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-1.5 rounded-lg bg-[#141f2d] border border-slate-700 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          {/* Account Ownership Selection (Multi-select) */}
          <div className="pt-2 border-t border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Owned On Steam Accounts:
              </label>
              <span className="text-xs text-sky-400">
                {selectedAccountIds.length} selected
              </span>
            </div>

            {accounts.length === 0 ? (
              <p className="text-xs text-amber-400 italic">
                No accounts created yet. Please create Steam accounts first in &quot;Accounts Hub&quot;.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1">
                {accounts.map((acc) => {
                  const isChecked = selectedAccountIds.includes(acc.id);
                  return (
                    <div
                      key={acc.id}
                      onClick={() => toggleAccount(acc.id)}
                      className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer select-none transition-all ${
                        isChecked
                          ? "bg-[#17273a] border-sky-500 text-white shadow-sm"
                          : "bg-[#131b26] border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                      }`}
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: acc.colorTag || "#38bdf8" }}
                        />
                        <span className="text-xs font-semibold truncate">
                          {acc.label}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono truncate">
                          ({acc.username})
                        </span>
                      </div>

                      <div
                        className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border ${
                          isChecked
                            ? "bg-sky-500 border-sky-400 text-white"
                            : "border-slate-600 bg-slate-900"
                        }`}
                      >
                        {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Custom Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Purchased DLCs, edition info, or activation keys"
              className="w-full px-3.5 py-2 rounded-xl bg-[#141f2d] border border-slate-700 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-500 resize-none"
            />
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 shadow-md shadow-sky-600/30 transition-all cursor-pointer"
            >
              {initialGame ? "Save Changes" : "Add to Library"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
