"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "../components/Header";
import WorldMap from "../components/WorldMap";
import SessionTable from "../components/SessionTable";
import AddAccountModal from "../components/AddAccountModal";
import { useAuth } from "@/lib/auth";
import { api, Session, Account } from "@/lib/api";
import { Shield, Plus, RefreshCw, Wifi } from "lucide-react";

export default function MonitorPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [sessions, setSessions] = useState<Session[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const loadData = async () => {
    try {
      const [sess, accts] = await Promise.all([
        api.getSessions(200),
        api.getAccounts(),
      ]);
      setSessions(sess);
      setAccounts(accts);
    } catch {}
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }
    if (user) loadData();
  }, [user, authLoading]);

  // Auto-refresh every 10 seconds
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, [user]);

  const filteredSessions = selectedAccount
    ? sessions.filter((s) => s.monitored_account_id === selectedAccount)
    : sessions;

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
        {/* Title */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold text-white flex items-center gap-2">
              <Wifi className="w-5 h-5 text-ato-green" />
              Live Monitor
            </h1>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-900/20 border border-green-800/30 rounded text-[10px] text-ato-green">
              <span className="w-1.5 h-1.5 bg-ato-green rounded-full animate-pulse" />
              Live
            </span>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1 px-3 py-1.5 text-xs bg-ato-green/90 hover:bg-ato-green text-black font-bold rounded transition-colors"
          >
            <Plus className="w-3 h-3" />
            Add Account
          </button>
        </div>

        {/* Account filter tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedAccount(null)}
            className={`shrink-0 px-3 py-1.5 text-[10px] rounded border transition-colors ${
              selectedAccount === null
                ? "bg-ato-cyan/10 border-ato-cyan/30 text-ato-cyan"
                : "bg-ato-dark border-ato-border text-gray-500 hover:text-gray-300"
            }`}
          >
            All Accounts
          </button>
          {accounts.map((a) => (
            <button
              key={a.id}
              onClick={() => setSelectedAccount(a.id)}
              className={`shrink-0 px-3 py-1.5 text-[10px] rounded border transition-colors ${
                selectedAccount === a.id
                  ? "bg-ato-cyan/10 border-ato-cyan/30 text-ato-cyan"
                  : "bg-ato-dark border-ato-border text-gray-500 hover:text-gray-300"
              }`}
            >
              @{a.username} ({a.platform})
            </button>
          ))}
        </div>

        {/* Map */}
        <WorldMap sessions={filteredSessions} height="350px" />

        {/* Table */}
        <SessionTable
          sessions={filteredSessions}
          title={`Sessions ${
            selectedAccount
              ? `for ${accounts.find((a) => a.id === selectedAccount)?.username || ""}`
              : "(All Accounts)"
          }`}
        />
      </div>

      <AddAccountModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onAdded={loadData}
      />
    </div>
  );
}
