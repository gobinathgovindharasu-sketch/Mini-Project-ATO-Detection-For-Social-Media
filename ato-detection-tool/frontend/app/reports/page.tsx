"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "../components/Header";
import { useAuth } from "@/lib/auth";
import { api, Alert } from "@/lib/api";
import {
  FileText,
  Download,
  Bell,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

export default function ReportsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }
    if (user) {
      api.getAlerts(100).then(setAlerts).catch(() => {});
    }
  }, [user, authLoading]);

  const downloadPDF = async (type: "sessions" | "alerts") => {
    const token = localStorage.getItem("ato_token");
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const url = `${baseUrl}/api/reports/${type}`;
    try {
      const resp = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!resp.ok) throw new Error("Download failed");
      const blob = await resp.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `${type}_report.pdf`;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch {
      alert("Failed to download report. Make sure you are logged in.");
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-ato-cyan text-xs animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      <div className="max-w-[1400px] mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5 text-ato-cyan" />
          <h1 className="text-lg font-bold text-white">Reports & Alerts</h1>
        </div>

        {/* Download buttons */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-ato-card border border-ato-border rounded-lg p-6 space-y-4">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-ato-cyan" />
              <h3 className="text-sm font-bold text-white">Sessions Report</h3>
            </div>
            <p className="text-[11px] text-gray-500">
              Download a comprehensive PDF report of all login sessions,
              including risk scores, XAI reasons, and device details.
            </p>
            <button
              onClick={() => downloadPDF("sessions")}
              className="flex items-center gap-2 px-4 py-2 bg-ato-cyan/10 border border-ato-cyan/30 text-ato-cyan text-xs rounded hover:bg-ato-cyan/20 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Download Sessions PDF
            </button>
          </div>

          <div className="bg-ato-card border border-ato-border rounded-lg p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-ato-red" />
              <h3 className="text-sm font-bold text-white">Alerts Report</h3>
            </div>
            <p className="text-[11px] text-gray-500">
              Download a detailed PDF of all high-risk alerts, webhook delivery
              status, and threat summaries.
            </p>
            <button
              onClick={() => downloadPDF("alerts")}
              className="flex items-center gap-2 px-4 py-2 bg-ato-red/10 border border-ato-red/30 text-ato-red text-xs rounded hover:bg-ato-red/20 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Download Alerts PDF
            </button>
          </div>
        </div>

        {/* Alerts table */}
        <div className="bg-ato-card border border-ato-border rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-ato-border flex items-center justify-between">
            <h3 className="text-xs font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-ato-red" />
              Recent Alerts
            </h3>
            <span className="text-[10px] text-gray-500">
              {alerts.length} alerts
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="border-b border-ato-border text-gray-500 text-left">
                  <th className="px-4 py-2 font-medium">ID</th>
                  <th className="px-4 py-2 font-medium">Session</th>
                  <th className="px-4 py-2 font-medium">Risk Score</th>
                  <th className="px-4 py-2 font-medium">Message</th>
                  <th className="px-4 py-2 font-medium">Webhook</th>
                  <th className="px-4 py-2 font-medium">Time</th>
                </tr>
              </thead>
              <tbody>
                {alerts.map((a) => (
                  <tr
                    key={a.id}
                    className="border-b border-ato-border/50 hover:bg-ato-dark/30"
                  >
                    <td className="px-4 py-2 text-gray-400">#{a.id}</td>
                    <td className="px-4 py-2 text-gray-400">
                      #{a.login_session_id}
                    </td>
                    <td className="px-4 py-2">
                      <span className="px-2 py-0.5 bg-red-900/30 text-ato-red rounded text-[10px] font-bold">
                        {(a.risk_score * 100).toFixed(0)}%
                      </span>
                    </td>
                    <td className="px-4 py-2 text-gray-500 max-w-[300px] truncate">
                      {a.message}
                    </td>
                    <td className="px-4 py-2">
                      {a.webhook_sent ? (
                        <span className="flex items-center gap-1 text-ato-green">
                          <CheckCircle className="w-3 h-3" /> Sent
                        </span>
                      ) : (
                        <span className="text-gray-600">Pending</span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-gray-600 whitespace-nowrap">
                      {new Date(a.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
                {alerts.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-8 text-center text-gray-600"
                    >
                      No alerts found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
