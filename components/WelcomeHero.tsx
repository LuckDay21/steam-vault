"use client";

import React from "react";
import { Gamepad2, Shield, Layers, KeyRound, Sparkles, ArrowRight } from "lucide-react";

interface WelcomeHeroProps {
  onSignInWithGoogle: () => void;
  onContinueAsGuest: () => void;
}

export function WelcomeHero({
  onSignInWithGoogle,
  onContinueAsGuest,
}: WelcomeHeroProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-12 max-w-5xl mx-auto w-full text-center select-none animate-in fade-in duration-300">
      {/* Brand Badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#182638] border border-[#2a475e] text-xs font-semibold text-[#66c0f4] mb-6">
        <Sparkles className="w-3.5 h-3.5" />
        <span>Multi-Account Game Catalog & Switcher</span>
      </div>

      {/* Main Headline */}
      <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white max-w-3xl leading-tight drop-shadow-md">
        Never lose track of which Steam account owns your games.
      </h1>

      {/* Subtitle */}
      <p className="mt-4 text-sm sm:text-base text-[#8f98a0] max-w-2xl leading-relaxed">
        Aggregate all your Steam accounts into one native Steam-client interface.
        Find games instantly, identify multi-account overlaps, and copy login credentials in 1-click.
      </p>

      {/* Call to Actions */}
      <div className="mt-8 flex flex-col sm:flex-row items-center gap-3.5 w-full max-w-md justify-center">
        {/* Google Sign In CTA */}
        <button
          onClick={onSignInWithGoogle}
          className="flex items-center justify-center gap-3 w-full sm:w-auto px-6 py-3 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm shadow-xl shadow-white/10 hover:shadow-white/20 transition-all hover:scale-[1.02] active:scale-98 cursor-pointer"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
            />
          </svg>
          <span>Sign In with Google</span>
        </button>

        {/* Continue as Guest */}
        <button
          onClick={onContinueAsGuest}
          className="flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-3 rounded-xl bg-[#1b2838] hover:bg-[#273a52] text-[#c6d4df] hover:text-white font-semibold text-sm border border-[#2a475e] transition-all cursor-pointer"
        >
          <span>Try Guest Mode</span>
          <ArrowRight className="w-4 h-4 text-[#8f98a0]" />
        </button>
      </div>

      {/* Feature Highlights Grid */}
      <div className="mt-14 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full text-left">
        <div className="p-4 rounded-xl bg-[#121a24] border border-[#212f42] space-y-2">
          <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-[#66c0f4]">
            <Gamepad2 className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-white">Steam Desktop UI</h3>
          <p className="text-xs text-[#8f98a0] leading-relaxed">
            Familiar Steam Client & Steam Deck interface with widescreen hero art and live game launching.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[#121a24] border border-[#212f42] space-y-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <KeyRound className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-white">1-Click Credential Copy</h3>
          <p className="text-xs text-[#8f98a0] leading-relaxed">
            Copy username and password instantly with password masking and private cloud isolation.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[#121a24] border border-[#212f42] space-y-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Layers className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-white">Smart Auto-Fetch</h3>
          <p className="text-xs text-[#8f98a0] leading-relaxed">
            Enter any Steam AppID to automatically retrieve game titles, genre tags, HD posters, and banners.
          </p>
        </div>
      </div>
    </div>
  );
}
