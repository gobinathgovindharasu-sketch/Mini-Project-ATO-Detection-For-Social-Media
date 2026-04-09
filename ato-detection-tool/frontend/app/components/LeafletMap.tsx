"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import type { Session } from "@/lib/api";

interface LeafletMapProps {
  sessions: Session[];
}

export default function LeafletMap({ sessions }: LeafletMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const markers = sessions.filter(
    (s) => s.latitude != null && s.longitude != null
  );

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [20, 0],
      zoom: 2,
      zoomControl: true,
      scrollWheelZoom: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
    }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    map.eachLayer((layer: L.Layer) => {
      if (layer instanceof L.CircleMarker) {
        map.removeLayer(layer);
      }
    });

    markers.forEach((session) => {
      const isRisky = session.risk_score >= 0.8;
      const isMedium = session.risk_score >= 0.5 && session.risk_score < 0.8;
      const color = isRisky ? "#ff1744" : isMedium ? "#ffd600" : "#00e676";
      const radius = isRisky ? 8 : isMedium ? 6 : 4;

      const marker = L.circleMarker([session.latitude!, session.longitude!], {
        radius,
        color,
        fillColor: color,
        fillOpacity: 0.7,
        weight: 1,
      }).addTo(map);

      marker.bindPopup(`
        <div style="font-size:11px;font-family:monospace;min-width:180px;">
          <div style="font-weight:bold;color:${color};">
            Risk: ${(session.risk_score * 100).toFixed(0)}%
            ${session.is_takeover ? " \u2014 TAKEOVER" : ""}
          </div>
          ${session.username ? `<div>@${session.username} (${session.platform})</div>` : ""}
          <div>IP: ${session.ip}</div>
          <div>Location: ${session.location || "Unknown"}</div>
          <div>Device: ${session.device_type || "Unknown"}</div>
          <div>Hour: ${session.login_hour}:00</div>
          <div style="color:#888;">${session.xai_reason || ""}</div>
        </div>
      `);
    });
  }, [markers]);

  return <div ref={containerRef} style={{ height: "100%", width: "100%" }} />;
}
