"use client";

import React, { useState, useEffect } from "react";
import { SteamAccount, SteamGame } from "@/types";
import {
  X,
  Sparkles,
  Image as ImageIcon,
  Check,
  Gamepad2,
  Loader2,
} from "lucide-react";
import { getSteamBannerUrl, getSteamPosterUrl } from "@/lib/utils";

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
    } else {
      setTitle("");
      setSteamAppId("");
      setCoverUrl("");
      setBannerUrl("");
      setGenresInput("");
      // Default select the first account if only 1 exists
      setSelectedAccountIds(accounts.length === 1 ? [accounts[0].id] : []);
      setNotes("");
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
      const res = await fetch(`/api/steam/${trimmedId}`);
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
        setFetchSuccessMessage("Steam info & tags loaded!");
        setTimeout(() => setFetchSuccessMessage(null), 3000);
      } else {
        // Fallback to static URLs
        setCoverUrl(getSteamPosterUrl(trimmedId));
        setBannerUrl(getSteamBannerUrl(trimmedId));
      }
    } catch {
      // Fallback on network error
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const parsedGenres = genresInput
      .split(",")
      .map((g) => g.trim())
      .filter(Boolean);

    onSave({
      id: initialGame?.id,
      title: title.trim(),
      steamAppId: steamAppId.trim() || undefined,
      coverUrl: coverUrl.trim() || undefined,
      bannerUrl: bannerUrl.trim() || undefined,
      genres: parsedGenres,
      accountIds: selectedAccountIds,
      notes: notes.trim() || undefined,
    });

    onClose();
  };

  const currentPoster =
    coverUrl || (steamAppId ? getSteamPosterUrl(steamAppId) : null);

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
                Auto-fetch tags, title & covers via Steam AppID or enter manually
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
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
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

            {/* Right: Inputs */}
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
                  Click &apos;Auto-Fill Info&apos; to automatically load game title, genre tags, and cover images from Steam.
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
                  placeholder="Auto-filled via AppID, e.g. Action, RPG, Open World"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#141f2d] border border-slate-700 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>

              {/* Custom Cover & Banner URLs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Poster Cover URL
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
                    Hero Banner URL
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
              placeholder="e.g. Purchased DLCs, save progress, or activation keys"
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
