"use client";

import React, { useState } from "react";
import { SteamAccount } from "@/types";
import {
  X,
  Plus,
  Trash2,
  Edit2,
  Users,
  Copy,
  Check,
  Eye,
  EyeOff,
  KeyRound,
  Shield,
} from "lucide-react";

interface AccountManagerModalProps {
  isOpen: boolean;
  accounts: SteamAccount[];
  onClose: () => void;
  onSaveAccount: (account: Omit<SteamAccount, "id" | "createdAt"> & { id?: string }) => void;
  onDeleteAccount: (accountId: string) => void;
}

const PRESET_COLORS = [
  "#38bdf8", // Sky Blue
  "#f59e0b", // Amber / Gold
  "#ec4899", // Pink
  "#10b981", // Emerald
  "#a855f7", // Purple
  "#ef4444", // Red
  "#6366f1", // Indigo
  "#14b8a6", // Teal
];

export function AccountManagerModal({
  isOpen,
  accounts,
  onClose,
  onSaveAccount,
  onDeleteAccount,
}: AccountManagerModalProps) {
  const [editingAccount, setEditingAccount] = useState<SteamAccount | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  // Form fields
  const [label, setLabel] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [colorTag, setColorTag] = useState(PRESET_COLORS[0]);
  const [notes, setNotes] = useState("");

  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [deletingId, setDeletingId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleStartAdd = () => {
    setEditingAccount(null);
    setLabel("");
    setUsername("");
    setPassword("");
    setColorTag(PRESET_COLORS[accounts.length % PRESET_COLORS.length]);
    setNotes("");
    setIsAddingNew(true);
  };

  const handleStartEdit = (acc: SteamAccount) => {
    setEditingAccount(acc);
    setLabel(acc.label);
    setUsername(acc.username);
    setPassword(acc.password);
    setColorTag(acc.colorTag || PRESET_COLORS[0]);
    setNotes(acc.notes || "");
    setIsAddingNew(true);
  };

  const handleCancelForm = () => {
    setIsAddingNew(false);
    setEditingAccount(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim() || !username.trim() || !password.trim()) return;

    onSaveAccount({
      id: editingAccount?.id,
      label: label.trim(),
      username: username.trim(),
      password: password.trim(),
      colorTag,
      notes: notes.trim() || undefined,
    });

    setIsAddingNew(false);
    setEditingAccount(null);
  };

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
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Steam Accounts Manager</h3>
              <p className="text-xs text-slate-400">
                Manage your credentials, colors, and notes
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

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Add / Edit Form */}
          {isAddingNew ? (
            <form
              onSubmit={handleSubmit}
              className="p-5 rounded-xl bg-[#141f2d] border border-sky-500/30 space-y-4 animate-in fade-in duration-200 shadow-lg"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-sm font-bold text-sky-300">
                  {editingAccount ? `Edit Account: ${editingAccount.label}` : "Add New Steam Account"}
                </span>
                <button
                  type="button"
                  onClick={handleCancelForm}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Account Label */}
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-300 mb-1">
                    Account Label <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    placeholder="e.g. Main Account, CS Smurf, Region TUR"
                    className="w-full px-3.5 py-2 rounded-xl bg-[#0f1620] border border-slate-700 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
                  />
                </div>

                {/* Color Tag Picker */}
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-300 mb-1">
                    Badge Color
                  </label>
                  <div className="flex items-center gap-2 py-1.5">
                    {PRESET_COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setColorTag(c)}
                        className={`w-6 h-6 rounded-full transition-transform cursor-pointer ${
                          colorTag === c
                            ? "scale-125 ring-2 ring-white ring-offset-2 ring-offset-[#141f2d]"
                            : "hover:scale-110 opacity-70 hover:opacity-100"
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>

                {/* Username */}
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-300 mb-1">
                    Steam Username <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. quraish_prime"
                    className="w-full px-3.5 py-2 rounded-xl bg-[#0f1620] border border-slate-700 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-500 font-mono"
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-300 mb-1">
                    Steam Password <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Your Steam password"
                    className="w-full px-3.5 py-2 rounded-xl bg-[#0f1620] border border-slate-700 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-500 font-mono"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Notes (Steam Guard, Email, etc.)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Steam Guard on Authenticator Phone #1"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#0f1620] border border-slate-700 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>

              {/* Form Buttons */}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleCancelForm}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 shadow-md transition-all cursor-pointer"
                >
                  {editingAccount ? "Update Account" : "Add Account"}
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={handleStartAdd}
              className="w-full py-3 rounded-xl border border-dashed border-sky-500/40 hover:border-sky-400 bg-sky-500/5 hover:bg-sky-500/10 text-sky-300 font-semibold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Another Steam Account</span>
            </button>
          )}

          {/* Accounts List */}
          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Configured Accounts ({accounts.length})
            </span>

            {accounts.length === 0 ? (
              <div className="p-8 text-center bg-[#131b26] rounded-xl border border-slate-800 text-slate-400 text-sm">
                No Steam accounts configured yet. Click above to add your first account!
              </div>
            ) : (
              accounts.map((acc) => {
                const isPassVisible = Boolean(visiblePasswords[acc.id]);
                return (
                  <div
                    key={acc.id}
                    className="p-4 rounded-xl bg-[#131e2b] border border-slate-700/70 hover:border-slate-600 transition-all space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span
                          className="w-3.5 h-3.5 rounded-full shadow-xs"
                          style={{ backgroundColor: acc.colorTag || "#38bdf8" }}
                        />
                        <span className="font-bold text-sm text-slate-100">
                          {acc.label}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleStartEdit(acc)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-sky-300 hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Edit account"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {deletingId === acc.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                onDeleteAccount(acc.id);
                                setDeletingId(null);
                              }}
                              className="px-2 py-1 rounded bg-red-600 text-white text-[11px] font-bold cursor-pointer"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setDeletingId(null)}
                              className="px-2 py-1 rounded bg-slate-800 text-slate-300 text-[11px] cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeletingId(acc.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                            title="Delete account"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Credentials Preview */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {/* Username */}
                      <div className="flex items-center justify-between bg-[#0b1119] px-3 py-2 rounded-lg border border-slate-800">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-slate-500 uppercase font-bold">
                            User
                          </span>
                          <span className="font-mono text-slate-200 truncate max-w-[140px]">
                            {acc.username}
                          </span>
                        </div>
                        <button
                          onClick={() => handleCopy(acc.username, `user-modal-${acc.id}`)}
                          className="p-1.5 rounded text-sky-400 hover:bg-sky-500/10 cursor-pointer"
                        >
                          {copiedKey === `user-modal-${acc.id}` ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>

                      {/* Password */}
                      <div className="flex items-center justify-between bg-[#0b1119] px-3 py-2 rounded-lg border border-slate-800">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-slate-500 uppercase font-bold">
                            Pass
                          </span>
                          <span className="font-mono text-slate-200 truncate max-w-[140px]">
                            {isPassVisible ? acc.password : "••••••••"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() =>
                              setVisiblePasswords((prev) => ({
                                ...prev,
                                [acc.id]: !prev[acc.id],
                              }))
                            }
                            className="p-1 rounded text-slate-400 hover:text-slate-200"
                          >
                            {isPassVisible ? (
                              <EyeOff className="w-3.5 h-3.5" />
                            ) : (
                              <Eye className="w-3.5 h-3.5" />
                            )}
                          </button>
                          <button
                            onClick={() => handleCopy(acc.password, `pass-modal-${acc.id}`)}
                            className="p-1.5 rounded text-sky-400 hover:bg-sky-500/10 cursor-pointer"
                          >
                            {copiedKey === `pass-modal-${acc.id}` ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <KeyRound className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    {acc.notes && (
                      <p className="text-[11px] text-slate-400 italic">
                        Note: {acc.notes}
                      </p>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-[#121c29] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
