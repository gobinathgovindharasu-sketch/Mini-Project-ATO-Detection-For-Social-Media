"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "../components/Header";
import { useAuth } from "@/lib/auth";
import { Shield, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const { login, register } = useAuth();
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (isRegister) {
        await register(email, password);
      } else {
        await login(email, password);
      }
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async () => {
    setError("");
    setLoading(true);
    try {
      await login("demo@ato-detect.io", "demo123");
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Demo login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      <div className="flex items-center justify-center py-20 px-4">
        <div className="w-full max-w-sm">
          <div className="bg-ato-card border border-ato-border rounded-lg overflow-hidden">
            {/* Header */}
            <div className="px-6 py-5 border-b border-ato-border text-center">
              <Shield className="w-8 h-8 text-ato-cyan mx-auto mb-2" />
              <h1 className="text-lg font-bold text-white">
                {isRegister ? "Create Account" : "Sign In"}
              </h1>
              <p className="text-[10px] text-gray-500 mt-1">
                {isRegister
                  ? "Join the ATO Detection platform"
                  : "Access your security dashboard"}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full bg-ato-dark border border-ato-border rounded px-3 py-2 text-xs text-gray-300 placeholder-gray-600 focus:outline-none focus:border-ato-cyan/50"
                />
              </div>

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
                    required
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

              {error && <p className="text-xs text-ato-red">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-ato-green/90 hover:bg-ato-green text-black font-bold py-2.5 rounded text-xs transition-colors disabled:opacity-50"
              >
                {loading
                  ? "Please wait..."
                  : isRegister
                  ? "Create Account"
                  : "Sign In"}
              </button>

              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-ato-border" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-ato-card px-3 text-[10px] text-gray-600">
                    or
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleDemo}
                disabled={loading}
                className="w-full bg-ato-dark border border-ato-border text-gray-400 hover:text-ato-cyan font-medium py-2.5 rounded text-xs transition-colors disabled:opacity-50"
              >
                Try Demo Account
              </button>

              <p className="text-center text-[10px] text-gray-600">
                {isRegister ? "Already have an account?" : "Need an account?"}{" "}
                <button
                  type="button"
                  onClick={() => setIsRegister(!isRegister)}
                  className="text-ato-cyan hover:underline"
                >
                  {isRegister ? "Sign in" : "Register"}
                </button>
              </p>

              {/* Demo credentials */}
              <div className="bg-ato-dark/50 border border-ato-border rounded p-3 space-y-1">
                <p className="text-[10px] text-gray-500 font-bold">Demo Credentials:</p>
                <p className="text-[10px] text-gray-600">
                  Admin: admin@ato-detect.io / admin123
                </p>
                <p className="text-[10px] text-gray-600">
                  User: demo@ato-detect.io / demo123
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
