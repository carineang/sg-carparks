"use client";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect } from "react";
import type { Carpark } from "@/lib/types";

/**
 * Marker colour based on parking lot availability ratio.
 * - Green (> 30% available): Many lots
 * - Amber (> 10% and <= 30% available): Limited lots
 * - Red (<= 10% available): Almost full
 */
const color = (c: Carpark) => {
  const ratio = c.total ? c.available / c.total : 0;
  return ratio > 0.3 ? "#16a34a" : ratio > 0.1 ? "#f59e0b" : "#dc2626";
};

/**
 * Re-centre and zoom the map whenever the centre or zoom properties change.
 */
function Recentre({ pos, zoom }: { pos: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => { map.setView(pos, zoom); }, [pos, zoom, map]);
  return null;
}

/**
 * Renders an interactive map with the user's location and colour-coded carpark markers.
 */
export default function Map({
  center, carparks, selected, onSelect, located,
}: {
  center: [number, number];
  carparks: Carpark[];
  selected?: string;
  onSelect: (id: string) => void;
  located: boolean;
}) {
  return (
    <MapContainer center={center} zoom={located ? 16 : 11} className="h-full w-full">
      <Recentre pos={center} zoom={located ? 16 : 11} />
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {located && (
        <CircleMarker center={center} radius={8} pathOptions={{ color: "#2563eb", fillOpacity: 1 }}>
          <Popup>You are here</Popup>
        </CircleMarker>
      )}
      {carparks.map((c) => (
        <CircleMarker
          key={c.id}
          center={[c.lat, c.lng]}
          radius={c.id === selected ? 12 : 8}
          pathOptions={{ color: color(c), fillColor: color(c), fillOpacity: 0.8 }}
          eventHandlers={{ click: () => onSelect(c.id) }}
        >
          <Popup>
            <b>{c.address}</b><br />
            {c.available} / {c.total} lots
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
