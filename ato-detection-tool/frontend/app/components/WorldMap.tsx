"use client";

import { useEffect, useId, useState } from "react";
import dynamic from "next/dynamic";
import type { Session } from "@/lib/api";

interface WorldMapProps {
  sessions: Session[];
  height?: string;
}

// The actual map component — only runs on the client
function MapInner({ sessions, height = "400px" }: WorldMapProps) {
  const {
    MapContainer,
    TileLayer,
    CircleMarker,
    Popup,
  } = require("react-leaflet");

  const markers = sessions.filter(
    (s) => s.latitude != null && s.longitude != null
  );

  return (
    <MapContainer
      center={[20, 0]}
      zoom={2}
      style={{ height: "100%", width: "100%" }}
      zoomControl={true}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {markers.map((session: Session) => {
        const isRisky = session.risk_score >= 0.8;
        const isMedium =
          session.risk_score >= 0.5 && session.risk_score < 0.8;
        const color = isRisky
          ? "#ff1744"
          : isMedium
          ? "#ffd600"
          : "#00e676";
        const radius = isRisky ? 8 : isMedium ? 6 : 4;

        return (
          <CircleMarker
            key={session.id}
            center={[session.latitude!, session.longitude!]}
            radius={radius}
            pathOptions={{
              color: color,
              fillColor: color,
              fillOpacity: 0.7,
              weight: 1,
            }}
          >
            <Popup>
              <div className="text-xs space-y-1 min-w-[180px]">
                <div className="font-bold" style={{ color }}>
                  Risk: {(session.risk_score * 100).toFixed(0)}%
                  {session.is_takeover && " — TAKEOVER"}
                </div>
                {session.username && (
                  <div>
                    @{session.username} ({session.platform})
                  </div>
                )}
                <div>IP: {session.ip}</div>
                <div>Location: {session.location || "Unknown"}</div>
                <div>Device: {session.device_type || "Unknown"}</div>
                <div>Hour: {session.login_hour}:00</div>
                <div className="text-gray-500">{session.xai_reason}</div>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}

// Dynamic import of the entire map — prevents SSR and "already initialized" errors
const DynamicMap = dynamic(() => Promise.resolve(MapInner), {
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
  const mapId = useId();

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
      {/* key={mapId} ensures a fresh Leaflet instance per mount */}
      <div key={mapId} style={{ height: "100%", width: "100%" }}>
        <DynamicMap sessions={sessions} height={height} />
      </div>
    </div>
  );
}
