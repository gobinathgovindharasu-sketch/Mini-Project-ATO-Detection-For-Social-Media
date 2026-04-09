"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Header from "../components/Header";
import WorldMap from "../components/WorldMap";
import SessionTable from "../components/SessionTable";
import { api, Session } from "@/lib/api";
import { Search, Globe } from "lucide-react";

function ExploreContent() {
  const searchParams = useSearchParams();
  const initialQ = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQ);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [allSessions, setAllSessions] = useState<Session[]>([]);
  const [total, setTotal] = useState(0);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    api.getAllSessions(200).then(setAllSessions).catch(() => {});
  }, []);

  useEffect(() => {
    if (initialQ) {
      handleSearch(initialQ);
    }
  }, [initialQ]);

  const handleSearch = async (q?: string) => {
    const searchQ = q || query;
    if (!searchQ.trim()) return;
    try {
      const res = await api.search(searchQ.trim());
      setSessions(res.sessions);
      setTotal(res.total);
      setSearched(true);
    } catch {
      setSessions([]);
      setTotal(0);
    }
  };

  const displaySessions = searched ? sessions : allSessions;

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center gap-3">
        <Globe className="w-5 h-5 text-ato-cyan" />
        <h1 className="text-lg font-bold text-white">Explore</h1>
      </div>

      {/* Big search */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSearch();
        }}
        className="flex gap-2"
      >
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by username, IP, location, device, email..."
          className="flex-1 bg-ato-dark border border-ato-border rounded px-4 py-3 text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-ato-cyan/50"
        />
        <button
          type="submit"
          className="px-6 py-3 bg-ato-red hover:bg-red-700 text-white rounded font-bold text-xs transition-colors flex items-center gap-2"
        >
          <Search className="w-4 h-4" />
          Search
        </button>
      </form>

      {searched && (
        <p className="text-xs text-gray-500">
          Found <span className="text-ato-cyan font-bold">{total}</span>{" "}
          results for &quot;{query}&quot;
        </p>
      )}

      <WorldMap sessions={displaySessions} height="300px" />

      <SessionTable
        sessions={displaySessions}
        title={searched ? `Search Results (${total})` : "Recent Sessions"}
      />
    </div>
  );
}

export default function ExplorePage() {
  return (
    <div className="min-h-screen">
      <Header />
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-20 text-ato-cyan text-xs animate-pulse">
            Loading...
          </div>
        }
      >
        <ExploreContent />
      </Suspense>
    </div>
  );
}
