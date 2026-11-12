"use client";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect } from "react";
import type { Carpark } from "@/lib/types";

// Marker colour based on carpark occupancy
const color = (c: Carpark) => {
  const r = c.total ? c.available / c.total : 0;
  return r > 0.3 ? "#16a34a" : r > 0.1 ? "#f59e0b" : "#dc2626";
};

/**
 * Recentre and re-zooms the map when the position or zoom changes
 */
function Recenter({ pos, zoom }: { pos: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(pos, zoom);
  }, [pos, zoom, map]);
  return null;
}

export default function Map({
  center,
  zoom,
  carparks,
  selected,
  onSelect,
  located,
}: {
  center: [number, number];
  zoom: number;
  carparks: Carpark[];
  selected?: string;
  onSelect: (id: string) => void;
  located: boolean;
}) {
  return (
    <MapContainer center={center} zoom={zoom} className="h-full w-full">
      <Recenter pos={center} zoom={zoom} />
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* User's location */}
      {located && (
        <CircleMarker
          center={center}
          radius={8}
          pathOptions={{ color: "#2563eb", fillOpacity: 1 }}
        >
          <Popup>You are here</Popup>
        </CircleMarker>
      )}

      {/* Carparks */}
      {carparks.map((c) => (
        <CircleMarker
          key={c.id}
          center={[c.lat, c.lng]}
          radius={c.id === selected ? 12 : 8}
          pathOptions={{ color: color(c), fillColor: color(c), fillOpacity: 0.8 }}
          eventHandlers={{ click: () => onSelect(c.id) }}
        >
          <Popup>
            <b>{c.address}</b>
            <br />
            {c.available} / {c.total} lots
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
