"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "./components/Header";
import WorldMap from "./components/WorldMap";
import { api, Session } from "@/lib/api";
import {
  Shield,
  Activity,
  Brain,
  FileText,
  Users,
  Server,
  GraduationCap,
} from "lucide-react";

export default function HomePage() {
  const [sessions, setSessions] = useState<Session[]>([]);

  useEffect(() => {
    api.getAllSessions(200).then(setSessions).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="max-w-[1400px] mx-auto px-4 py-12 md:py-20">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Left — Text */}
          <div className="space-y-6">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
              Search Engine for{" "}
              <span className="text-ato-cyan">Account Takeover</span>{" "}
              <span className="text-ato-red">Threats</span>
            </h1>
            <p className="text-sm md:text-base text-gray-500 leading-relaxed max-w-lg">
              Real-time behavioral intelligence for social media platforms.
              Detect unauthorized access, impossible travel, and suspicious
              device patterns using ensemble ML models.
            </p>
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-ato-green/90 hover:bg-ato-green text-black font-bold text-xs rounded transition-colors glow-green"
              >
                <Shield className="w-4 h-4" />
                Sign Up / Try Demo
              </Link>
              <Link
                href="/explore"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-ato-dark border border-ato-border text-gray-400 hover:text-white text-xs rounded transition-colors"
              >
                Explore Data
              </Link>
            </div>

            {/* Quick stats row */}
            <div className="flex items-center gap-6 pt-4 text-[10px] text-gray-600">
              <span>
                <span className="text-ato-cyan font-bold text-sm">1000+</span>{" "}
                Sessions Analyzed
              </span>
              <span>
                <span className="text-ato-red font-bold text-sm">ML</span>{" "}
                Ensemble Detection
              </span>
              <span>
                <span className="text-ato-green font-bold text-sm">256-bit</span>{" "}
                Encryption
              </span>
            </div>
          </div>

          {/* Right — Glowing World Map */}
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-ato-cyan/5 to-ato-red/5 rounded-xl blur-2xl" />
            <WorldMap sessions={sessions} height="380px" />
          </div>
        </div>
      </section>

      {/* Explore the Platform — 3 cards */}
      <section className="max-w-[1400px] mx-auto px-4 py-16 border-t border-ato-border">
        <h2 className="text-xl font-bold text-white mb-2">
          Explore the Platform
        </h2>
        <p className="text-xs text-gray-500 mb-8">
          Comprehensive tools for detecting and preventing account takeover
          attacks on social media
        </p>

        <div className="grid md:grid-cols-3 gap-4">
          {/* Card 1 */}
          <div className="bg-ato-card border border-ato-border rounded-lg p-6 hover:border-ato-cyan/30 transition-colors group">
            <Activity className="w-8 h-8 text-ato-cyan mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-sm font-bold text-white mb-2">
              Real-Time Monitoring
            </h3>
            <p className="text-[11px] text-gray-500 leading-relaxed">
              Monitor login sessions across all connected social media accounts
              in real-time. Get instant alerts for suspicious activity with
              detailed behavioral analysis.
            </p>
            <Link
              href="/monitor"
              className="inline-block mt-4 text-[10px] text-ato-cyan hover:underline"
            >
              Start Monitoring →
            </Link>
          </div>

          {/* Card 2 */}
          <div className="bg-ato-card border border-ato-border rounded-lg p-6 hover:border-ato-red/30 transition-colors group">
            <Brain className="w-8 h-8 text-ato-red mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-sm font-bold text-white mb-2">
              ML-Powered Detection
            </h3>
            <p className="text-[11px] text-gray-500 leading-relaxed">
              Ensemble of Isolation Forest and One-Class SVM models trained on
              behavioral baselines. Explainable AI provides clear reasons for
              every risk score.
            </p>
            <Link
              href="/dashboard"
              className="inline-block mt-4 text-[10px] text-ato-red hover:underline"
            >
              View Dashboard →
            </Link>
          </div>

          {/* Card 3 */}
          <div className="bg-ato-card border border-ato-border rounded-lg p-6 hover:border-ato-green/30 transition-colors group">
            <FileText className="w-8 h-8 text-ato-green mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-sm font-bold text-white mb-2">
              Reports & Alerts
            </h3>
            <p className="text-[11px] text-gray-500 leading-relaxed">
              Generate detailed PDF reports, configure webhook alerts for
              high-risk events, and maintain a complete audit trail of all
              detected threats.
            </p>
            <Link
              href="/reports"
              className="inline-block mt-4 text-[10px] text-ato-green hover:underline"
            >
              Generate Reports →
            </Link>
          </div>
        </div>
      </section>

      {/* Footer Stats Bar */}
      <footer className="border-t border-ato-border bg-[#0d47a1]/90">
        <div className="max-w-[1400px] mx-auto px-4 py-4 flex flex-wrap items-center justify-center gap-8 md:gap-16">
          <div className="flex items-center gap-2 text-white">
            <Users className="w-4 h-4 text-blue-300" />
            <span className="text-sm font-bold">Fortune 100</span>
            <span className="text-[10px] text-blue-200">Enterprises Protected</span>
          </div>
          <div className="flex items-center gap-2 text-white">
            <Server className="w-4 h-4 text-blue-300" />
            <span className="text-sm font-bold">Cloud Providers</span>
            <span className="text-[10px] text-blue-200">Integrated</span>
          </div>
          <div className="flex items-center gap-2 text-white">
            <GraduationCap className="w-4 h-4 text-blue-300" />
            <span className="text-sm font-bold">Universities</span>
            <span className="text-[10px] text-blue-200">Research Partners</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
