"use client";
import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { useCarparks } from "@/hooks/useCarparks";
import { useGeolocation } from "@/hooks/useGeolocation";
import { distanceKm } from "@/lib/geo";

// Import the Map component
const Map = dynamic(() => import("@/components/Map"), { ssr: false });

// Map zoom level that fits the selected radius
const zoomForRadius = (km: number) =>
  km <= 0.5 ? 16 : km <= 1 ? 15 : km <= 2 ? 14 : km <= 5 ? 13 : 12;

export default function Home() {
  // Retrieve carpark data and loading/error information
  const { data, isLoading, isError, dataUpdatedAt, refetch, isFetching } = useCarparks();

  // Retrieve user's current geographical location
  const { pos, located, loading, error, locate } = useGeolocation();

  // Stores the ID of the currently selected carpark
  const [selected, setSelected] = useState<string>();

  // Stores the selected search radius, defaults to 5 km on launch
  const [radius, setRadius] = useState(2);

  // Calculate nearby carparks (measured from user, or Singapore centre if not located)
  const nearby = useMemo(
    () =>
      (data ?? [])
        .map((c) => ({ ...c, dist: distanceKm(pos, [c.lat, c.lng]) }))
        .filter((c) => c.dist <= radius)
        .sort((a, b) => a.dist - b.dist)
        .slice(0, 500),
    [data, pos, radius]
  );

  // Zoom level follows the selected radius
  const zoom = zoomForRadius(radius);

  return (
    <main className="flex h-screen flex-col md:flex-row">
      {/* Carpark list: left on desktop, below the map on mobile */}
      <aside className="order-2 h-1/2 overflow-y-auto border-t p-4 md:order-1 md:h-full md:w-1/3 md:border-r md:border-t-0">
        <h1 className="text-xl font-bold">SG Carpark Availability</h1>

        {/* Nearby me button: asks for the user's location */}
        <button
          onClick={locate}
          disabled={loading}
          className="mt-3 w-full rounded bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-60"
        >
          {loading ? "Locating…" : located ? "📍 Update my location" : "📍 Nearby me"}
        </button>

        {error && <p className="mt-2 text-sm text-amber-600">{error}</p>}

        {/* Shown until the user shares their location */}
        {!located && (
          <p className="mt-2 rounded bg-blue-50 px-3 py-2 text-sm text-blue-700">
            Showing Singapore centre
          </p>
        )}

        <div className="my-3 flex items-center gap-2 text-sm">
          <label>Radius</label>
          <select
            value={radius}
            onChange={(e) => setRadius(+e.target.value)}
            disabled={!located}
            className="rounded border px-2 py-1 disabled:opacity-50"
          >
            {[0.5, 1, 2, 5].map((r) => (
              <option key={r} value={r}>
                {r} km
              </option>
            ))}
          </select>
          <button
            onClick={() => refetch()}
            className="ml-auto rounded bg-blue-600 px-3 py-1 text-white"
          >
            {isFetching ? "Updating…" : "Refresh"}
          </button>
        </div>

        {dataUpdatedAt > 0 && (
          <p className="mb-2 text-xs text-gray-500">
            Updated {new Date(dataUpdatedAt).toLocaleTimeString()}
          </p>
        )}

        {isLoading && <p>Loading carparks…</p>}
        {isError && <p className="text-red-600">Couldn’t load data. Try again.</p>}

        <ul className="space-y-2">
          {nearby.map((c) => {
            const percentage = c.total ? Math.round((c.available / c.total) * 100) : 0;
            return (
              <li
                key={c.id}
                onClick={() => setSelected(c.id)}
                className={`cursor-pointer rounded border p-3 ${
                  selected === c.id ? "border-blue-600 bg-blue-50" : ""
                }`}
              >
                <div className="flex justify-between gap-2">
                  <span className="font-medium">{c.address}</span>
                  {located && (
                    <span className="shrink-0 text-xs text-gray-500">
                      {c.dist.toFixed(2)} km
                    </span>
                  )}
                </div>
                <div className="mt-2 h-2 rounded bg-gray-200">
                  <div
                    className={`h-2 rounded ${
                      percentage > 30 ? "bg-green-600" : percentage > 10 ? "bg-amber-500" : "bg-red-600"
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <p className="mt-1 text-sm">
                  {c.available} / {c.total} lots ({percentage}%)
                </p>
              </li>
            );
          })}
        </ul>
      </aside>

      {/* Map: right on desktop, on top on mobile */}
      <section className="order-1 h-1/2 md:order-2 md:h-full md:w-2/3">
        <Map
          center={pos}
          zoom={zoom}
          carparks={nearby}
          selected={selected}
          onSelect={setSelected}
          located={located}
        />
      </section>
    </main>
  );
}
