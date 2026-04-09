/**
 * API client — wraps fetch for the FastAPI backend.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("ato_token") : null;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(body.detail || "API error");
  }

  return res.json();
}

/* ---------- Auth ---------- */
export interface User {
  id: number;
  email: string;
  role: string;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export const api = {
  register: (email: string, password: string, role = "user") =>
    request<AuthResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, role }),
    }),

  login: (email: string, password: string) =>
    request<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  /* ---------- Accounts ---------- */
  getAccounts: () => request<Account[]>("/api/accounts/"),

  addAccount: (platform: string, username: string, password: string) =>
    request<Account>("/api/accounts/", {
      method: "POST",
      body: JSON.stringify({ platform, username, password }),
    }),

  deleteAccount: (id: number) =>
    request<{ detail: string }>(`/api/accounts/${id}`, { method: "DELETE" }),

  /* ---------- Sessions ---------- */
  getSessions: (limit = 100) =>
    request<Session[]>(`/api/sessions/?limit=${limit}`),

  getAllSessions: (limit = 200) =>
    request<Session[]>(`/api/sessions/all?limit=${limit}`),

  analyzeSession: (data: SessionCreate) =>
    request<Session>("/api/sessions/analyze", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getDashboard: () => request<DashboardStats>("/api/sessions/dashboard"),

  search: (q: string) =>
    request<SearchResult>(`/api/sessions/search?q=${encodeURIComponent(q)}`),

  /* ---------- Alerts ---------- */
  getAlerts: (limit = 50) => request<Alert[]>(`/api/alerts/?limit=${limit}`),

  getAllAlerts: (limit = 50) =>
    request<Alert[]>(`/api/alerts/all?limit=${limit}`),

  /* ---------- Health ---------- */
  health: () => request<{ status: string; version: string }>("/api/health"),
};

/* ---------- Types ---------- */
export interface Account {
  id: number;
  user_id: number;
  platform: string;
  username: string;
  created_at: string;
}

export interface Session {
  id: number;
  monitored_account_id: number;
  ip: string;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  login_hour: number;
  device_type: string | null;
  risk_score: number;
  is_takeover: boolean;
  xai_reason: string | null;
  timestamp: string;
  platform?: string;
  username?: string;
}

export interface SessionCreate {
  monitored_account_id: number;
  ip: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  login_hour: number;
  device_type?: string;
}

export interface DashboardStats {
  total_accounts: number;
  total_sessions: number;
  takeover_count: number;
  alert_count: number;
  avg_risk_score: number;
}

export interface Alert {
  id: number;
  login_session_id: number;
  risk_score: number;
  message: string;
  webhook_sent: boolean;
  created_at: string;
}

export interface SearchResult {
  sessions: Session[];
  total: number;
}
