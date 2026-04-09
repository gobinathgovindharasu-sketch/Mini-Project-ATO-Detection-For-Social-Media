"use client";

import type { Session } from "@/lib/api";
import { AlertTriangle, CheckCircle, Clock, Monitor, Globe } from "lucide-react";

interface Props {
  sessions: Session[];
  title?: string;
}

export default function SessionTable({ sessions, title = "Live Sessions" }: Props) {
  return (
    <div className="bg-ato-card border border-ato-border rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-ato-border flex items-center justify-between">
        <h3 className="text-xs font-bold text-white">{title}</h3>
        <span className="text-[10px] text-gray-500">{sessions.length} records</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-[11px]">
          <thead>
            <tr className="border-b border-ato-border text-gray-500 text-left">
              <th className="px-4 py-2 font-medium">Status</th>
              <th className="px-4 py-2 font-medium">Account</th>
              <th className="px-4 py-2 font-medium">IP</th>
              <th className="px-4 py-2 font-medium">Location</th>
              <th className="px-4 py-2 font-medium">Hour</th>
              <th className="px-4 py-2 font-medium">Device</th>
              <th className="px-4 py-2 font-medium">Risk</th>
              <th className="px-4 py-2 font-medium">Reason</th>
              <th className="px-4 py-2 font-medium">Time</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((s) => {
              const isHigh = s.risk_score >= 0.8;
              const isMed = s.risk_score >= 0.5 && s.risk_score < 0.8;
              return (
                <tr
                  key={s.id}
                  className={`border-b border-ato-border/50 hover:bg-ato-dark/50 transition-colors ${
                    isHigh ? "bg-red-950/10" : ""
                  }`}
                >
                  <td className="px-4 py-2">
                    {s.is_takeover ? (
                      <AlertTriangle className="w-3.5 h-3.5 text-ato-red" />
                    ) : (
                      <CheckCircle className="w-3.5 h-3.5 text-ato-green" />
                    )}
                  </td>
                  <td className="px-4 py-2 text-gray-300">
                    {s.username ? (
                      <span>
                        @{s.username}
                        <span className="text-gray-600 ml-1">({s.platform})</span>
                      </span>
                    ) : (
                      <span className="text-gray-600">#{s.monitored_account_id}</span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-gray-400 font-mono">{s.ip}</td>
                  <td className="px-4 py-2 text-gray-400">
                    <span className="flex items-center gap-1">
                      <Globe className="w-3 h-3" />
                      {s.location || "—"}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-gray-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {s.login_hour}:00
                    </span>
                  </td>
                  <td className="px-4 py-2 text-gray-400">
                    <span className="flex items-center gap-1">
                      <Monitor className="w-3 h-3" />
                      {s.device_type || "—"}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        isHigh
                          ? "bg-red-900/30 text-ato-red"
                          : isMed
                          ? "bg-yellow-900/30 text-ato-yellow"
                          : "bg-green-900/30 text-ato-green"
                      }`}
                    >
                      {(s.risk_score * 100).toFixed(0)}%
                    </span>
                  </td>
                  <td className="px-4 py-2 text-gray-500 max-w-[200px] truncate">
                    {s.xai_reason || "—"}
                  </td>
                  <td className="px-4 py-2 text-gray-600 whitespace-nowrap">
                    {new Date(s.timestamp).toLocaleString()}
                  </td>
                </tr>
              );
            })}
            {sessions.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-gray-600">
                  No sessions found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
