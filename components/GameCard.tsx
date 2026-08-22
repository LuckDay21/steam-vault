"use client";

import React, { useState } from "react";
import { SteamAccount, SteamGame } from "@/types";
import { Gamepad2, Users, Layers, ExternalLink } from "lucide-react";
import { getSteamPosterUrl } from "@/lib/utils";

interface GameCardProps {
  game: SteamGame;
  accounts: SteamAccount[];
  onClick: () => void;
}

export function GameCard({ game, accounts, onClick }: GameCardProps) {
  const [imageError, setImageError] = useState(false);

  // Match accounts that own this game
  const ownerAccounts = accounts.filter((acc) =>
    (game.accountIds || []).includes(acc.id)
  );

  const posterSrc =
    game.coverUrl || (game.steamAppId ? getSteamPosterUrl(game.steamAppId) : null);

  const isDuplicate = ownerAccounts.length > 1;

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      className="group relative flex flex-col rounded-xl overflow-hidden bg-[#131b26] border border-slate-800/80 hover:border-sky-500/60 hover:shadow-xl hover:shadow-sky-500/10 transition-all duration-300 transform hover:-translate-y-1.5 cursor-pointer select-none text-left"
    >
      {/* Poster Image Container */}
      <div className="relative w-full aspect-[2/3] bg-gradient-to-b from-[#182333] to-[#0d141e] overflow-hidden">
        {posterSrc && !imageError ? (
          <img
            src={posterSrc}
            alt={game.title}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-gradient-to-br from-[#1b2b3d] to-[#0f1722]">
            <Gamepad2 className="w-12 h-12 text-slate-600 mb-2 group-hover:text-sky-400 transition-colors" />
            <span className="text-sm font-bold text-slate-300 line-clamp-2">
              {game.title}
            </span>
          </div>
        )}

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
          {isDuplicate && (
            <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-500/90 text-black shadow-md backdrop-blur-xs">
              <Layers className="w-3 h-3" />
              <span>{ownerAccounts.length} Accounts</span>
            </span>
          )}

          {game.steamAppId && (
            <span className="ml-auto text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-black/70 text-slate-300 backdrop-blur-xs border border-white/10">
              #{game.steamAppId}
            </span>
          )}
        </div>

        {/* Gradient shadow overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#131b26] via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />
      </div>

      {/* Card Info */}
      <div className="p-3.5 flex flex-col flex-1 justify-between gap-2.5 bg-[#131b26]">
        <div>
          <h3 className="text-sm font-bold text-slate-100 group-hover:text-sky-300 transition-colors line-clamp-1">
            {game.title}
          </h3>

          {/* Genres */}
          {game.genres && game.genres.length > 0 && (
            <p className="text-[11px] text-slate-400 truncate mt-0.5">
              {game.genres.slice(0, 3).join(" • ")}
            </p>
          )}
        </div>

        {/* Account Badges */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-1.5 overflow-hidden">
            {ownerAccounts.length > 0 ? (
              ownerAccounts.map((acc) => (
                <span
                  key={acc.id}
                  title={acc.label}
                  className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#1e2d3f] text-slate-200 border border-slate-700/60 truncate max-w-[120px]"
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ backgroundColor: acc.colorTag || "#38bdf8" }}
                  />
                  <span className="truncate">{acc.label}</span>
                </span>
              ))
            ) : (
              <span className="text-[11px] text-slate-500 italic">
                No accounts assigned
              </span>
            )}
          </div>

          <span className="text-xs text-sky-400 opacity-0 group-hover:opacity-100 transition-opacity font-semibold shrink-0">
            View &rarr;
          </span>
        </div>
      </div>
    </div>
  );
}
