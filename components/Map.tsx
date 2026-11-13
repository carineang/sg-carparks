"use client";
import { MapContainer, TileLayer, CircleMarker, Circle, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { latLng } from "leaflet";
import { useEffect } from "react";
import type { Carpark } from "@/lib/types";

// Marker colour based on carpark occupancy
const color = (c: Carpark) => {
  const r = c.total ? c.available / c.total : 0;
  return r > 0.3 ? "#10b981" : r > 0.1 ? "#f59e0b" : "#ef4444";
};

// Fits the map to the search radius whenever the centre or radius changes
function FitRadius({ pos, radius }: { pos: [number, number]; radius: number }) {
  const map = useMap();
  useEffect(() => {
    const bounds = latLng(pos[0], pos[1]).toBounds(radius * 2000);
    map.fitBounds(bounds, { padding: [24, 24] });
  }, [pos, radius, map]);
  return null;
}

// Smoothly flies to the selected carpark
function FlyToSelected({ target }: { target?: { lat: number; lng: number } }) {
  const map = useMap();
  const lat = target?.lat;
  const lng = target?.lng;
  useEffect(() => {
    if (lat === undefined || lng === undefined) return;
    map.flyTo([lat, lng], Math.max(map.getZoom(), 15), { duration: 0.6 });
  }, [lat, lng, map]);
  return null;
}

export default function Map({
  center,
  radius,
  carparks,
  selected,
  onSelect,
  located,
}: {
  center: [number, number];
  radius: number;
  carparks: Carpark[];
  selected?: string;
  onSelect: (id: string) => void;
  located: boolean;
}) {
  const selectedCarpark = carparks.find((c) => c.id === selected);

  return (
    <MapContainer center={center} zoom={12} className="h-full w-full">
      <FitRadius pos={center} radius={radius} />
      <FlyToSelected target={selectedCarpark} />
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Search radius */}
      <Circle
        center={center}
        radius={radius * 1000}
        pathOptions={{
          color: "#2563eb",
          weight: 1.5,
          dashArray: "6 6",
          fillColor: "#3b82f6",
          fillOpacity: 0.06,
        }}
        interactive={false}
      />

      {/* User's location */}
      {located && (
        <>
          <CircleMarker
            center={center}
            radius={18}
            pathOptions={{ stroke: false, fillColor: "#2563eb", fillOpacity: 0.2 }}
            interactive={false}
          />
          <CircleMarker
            center={center}
            radius={8}
            pathOptions={{ color: "#ffffff", weight: 3, fillColor: "#2563eb", fillOpacity: 1 }}
          >
            <Popup>You are here</Popup>
          </CircleMarker>
        </>
      )}

      {/* Carparks */}
      {carparks.map((c) => {
        const isSelected = c.id === selected;
        return (
          <CircleMarker
            key={c.id}
            center={[c.lat, c.lng]}
            radius={isSelected ? 13 : 9}
            pathOptions={{
              color: isSelected ? "#1e3a8a" : "#ffffff",
              weight: isSelected ? 3 : 2,
              fillColor: color(c),
              fillOpacity: 0.95,
            }}
            eventHandlers={{ click: () => onSelect(c.id) }}
          >
            <Popup>
              <div className="min-w-[10rem]">
                <p className="font-semibold">{c.address}</p>
                <p className="mt-1 text-sm">
                  <span className="text-base font-bold">{c.available}</span> / {c.total} lots free
                </p>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
