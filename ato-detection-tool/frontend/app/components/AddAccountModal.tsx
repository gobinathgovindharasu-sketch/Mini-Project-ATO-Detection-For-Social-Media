"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { X, Eye, EyeOff, Shield, Lock } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  onAdded: () => void;
}

const PLATFORMS = [
  { value: "twitter", label: "X / Twitter" },
  { value: "instagram", label: "Instagram" },
  { value: "facebook", label: "Facebook" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "tiktok", label: "TikTok" },
  { value: "youtube", label: "YouTube" },
  { value: "reddit", label: "Reddit" },
  { value: "snapchat", label: "Snapchat" },
];

export default function AddAccountModal({ open, onClose, onAdded }: Props) {
  const [platform, setPlatform] = useState("twitter");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!username || !password) {
      setError("All fields are required");
      return;
    }
    setLoading(true);
    try {
      await api.addAccount(platform, username, password);
      setUsername("");
      setPassword("");
      onAdded();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to add account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-ato-card border border-ato-border rounded-lg w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-ato-border">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-ato-cyan" />
            <h2 className="text-sm font-bold text-white">
              Add Social Media Account to Monitor
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Platform */}
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-1.5">
              Platform
            </label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="w-full bg-ato-dark border border-ato-border rounded px-3 py-2 text-xs text-gray-300 focus:outline-none focus:border-ato-cyan/50"
            >
              {PLATFORMS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          {/* Username */}
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-1.5">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="@username"
              className="w-full bg-ato-dark border border-ato-border rounded px-3 py-2 text-xs text-gray-300 placeholder-gray-600 focus:outline-none focus:border-ato-cyan/50"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full bg-ato-dark border border-ato-border rounded px-3 py-2 pr-10 text-xs text-gray-300 placeholder-gray-600 focus:outline-none focus:border-ato-cyan/50"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
              >
                {showPw ? (
                  <EyeOff className="w-3.5 h-3.5" />
                ) : (
                  <Eye className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>

          {/* Encryption notice */}
          <div className="flex items-start gap-2 bg-ato-dark/50 border border-ato-border rounded p-3">
            <Lock className="w-3.5 h-3.5 text-ato-green mt-0.5 shrink-0" />
            <p className="text-[10px] text-gray-500">
              Your password will be <span className="text-ato-green">encrypted using Fernet</span>{" "}
              before storage. We never store plain-text credentials.
            </p>
          </div>

          {error && (
            <p className="text-xs text-ato-red">{error}</p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-ato-green/90 hover:bg-ato-green text-black font-bold py-2.5 rounded text-xs transition-colors disabled:opacity-50"
          >
            {loading ? "Encrypting & Adding..." : "Encrypt & Start Monitoring"}
          </button>
        </form>
      </div>
    </div>
  );
}
