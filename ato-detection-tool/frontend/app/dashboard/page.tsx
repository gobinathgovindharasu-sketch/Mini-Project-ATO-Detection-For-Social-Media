"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "../components/Header";
import WorldMap from "../components/WorldMap";
import SessionTable from "../components/SessionTable";
import StatsCard from "../components/StatsCard";
import AddAccountModal from "../components/AddAccountModal";
import { useAuth } from "@/lib/auth";
import { api, Session, DashboardStats, Account } from "@/lib/api";
import {
  Shield,
  Activity,
  AlertTriangle,
  Bell,
  TrendingUp,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react";

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const [s, sess, accts] = await Promise.all([
        api.getDashboard(),
        api.getSessions(100),
        api.getAccounts(),
      ]);
      setStats(s);
      setSessions(sess);
      setAccounts(accts);
    } catch {
      // Might not be authenticated
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }
    if (user) loadData();
  }, [user, authLoading]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleDeleteAccount = async (id: number) => {
    try {
      await api.deleteAccount(id);
      loadData();
    } catch {}
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
        {/* Title row */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-ato-cyan" />
              Security Dashboard
            </h1>
            <p className="text-[10px] text-gray-500 mt-1">
              Welcome back, {user?.email}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              className="flex items-center gap-1 px-3 py-1.5 text-xs bg-ato-dark border border-ato-border text-gray-400 hover:text-ato-cyan rounded transition-colors"
            >
              <RefreshCw
                className={`w-3 h-3 ${refreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-1 px-3 py-1.5 text-xs bg-ato-green/90 hover:bg-ato-green text-black font-bold rounded transition-colors"
            >
              <Plus className="w-3 h-3" />
              Add Account
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <StatsCard
              label="Monitored Accounts"
              value={stats.total_accounts}
              icon={<Shield className="w-5 h-5" />}
              color="text-ato-cyan"
            />
            <StatsCard
              label="Total Sessions"
              value={stats.total_sessions}
              icon={<Activity className="w-5 h-5" />}
              color="text-blue-400"
            />
            <StatsCard
              label="Takeovers Detected"
              value={stats.takeover_count}
              icon={<AlertTriangle className="w-5 h-5" />}
              color="text-ato-red"
            />
            <StatsCard
              label="Alerts"
              value={stats.alert_count}
              icon={<Bell className="w-5 h-5" />}
              color="text-ato-yellow"
            />
            <StatsCard
              label="Avg Risk Score"
              value={`${(stats.avg_risk_score * 100).toFixed(1)}%`}
              icon={<TrendingUp className="w-5 h-5" />}
              color="text-ato-green"
            />
          </div>
        )}

        {/* Map + Accounts side by side */}
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <WorldMap sessions={sessions} height="350px" />
          </div>
          <div className="bg-ato-card border border-ato-border rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-ato-border flex items-center justify-between">
              <h3 className="text-xs font-bold text-white">
                Monitored Accounts
              </h3>
              <span className="text-[10px] text-gray-500">
                {accounts.length} accounts
              </span>
            </div>
            <div className="divide-y divide-ato-border/50 max-h-[310px] overflow-y-auto">
              {accounts.map((a) => (
                <div
                  key={a.id}
                  className="px-4 py-3 flex items-center justify-between hover:bg-ato-dark/30"
                >
                  <div>
                    <div className="text-xs text-gray-300">@{a.username}</div>
                    <div className="text-[10px] text-gray-600 capitalize">
                      {a.platform}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteAccount(a.id)}
                    className="text-gray-600 hover:text-ato-red transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              {accounts.length === 0 && (
                <div className="px-4 py-8 text-center text-gray-600 text-[11px]">
                  No accounts yet. Click &quot;Add Account&quot; to start.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sessions Table */}
        <SessionTable sessions={sessions} title="Recent Login Sessions" />
      </div>

      <AddAccountModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onAdded={loadData}
      />
    </div>
  );
}
