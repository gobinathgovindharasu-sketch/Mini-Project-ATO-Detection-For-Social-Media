"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import type { Session } from "@/lib/api";

interface WorldMapProps {
  sessions: Session[];
  height?: string;
}

// Dynamically import the Leaflet map from a separate file (ssr: false).
// This ensures Leaflet is never loaded on the server and the map container
// lifecycle is fully managed via useRef + useEffect with proper cleanup.
const LeafletMap = dynamic(() => import("./LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-ato-dark flex items-center justify-center">
      <div className="text-ato-cyan text-xs animate-pulse">
        Loading world map...
      </div>
    </div>
  ),
});

export default function WorldMap({ sessions, height = "400px" }: WorldMapProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className="bg-ato-dark rounded-lg border border-ato-border flex items-center justify-center"
        style={{ height }}
      >
        <div className="text-ato-cyan text-xs animate-pulse">
          Loading world map...
        </div>
      </div>
    );
  }

  return (
    <div
      className="rounded-lg overflow-hidden border border-ato-border glow-cyan"
      style={{ height }}
    >
      <LeafletMap sessions={sessions} />
    </div>
  );
}
