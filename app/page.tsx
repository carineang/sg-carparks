"use client";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { useCarparks } from "@/hooks/useCarparks";
import { useGeolocation } from "@/hooks/useGeolocation";
import { distanceKm } from "@/lib/geo";

// Import the Map component
const Map = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-slate-200" />,
});

const RADIUS_OPTIONS = [0.5, 1, 2, 5];

// Label and colours for carpark occupancy
const getStatus = (percentage: number) =>
  percentage > 30
    ? { label: "Available", bar: "bg-emerald-500", badge: "bg-emerald-50 text-emerald-700 ring-emerald-600/20" }
    : percentage > 10
    ? { label: "Filling up", bar: "bg-amber-500", badge: "bg-amber-50 text-amber-700 ring-amber-600/20" }
    : { label: "Almost full", bar: "bg-red-500", badge: "bg-red-50 text-red-700 ring-red-600/20" };

export default function Home() {
  // Retrieve carpark data and loading/error information
  const { data, isLoading, isError, dataUpdatedAt, refetch, isFetching } = useCarparks();

  // Retrieve user's current geographical location
  const { pos, located, loading, error, locate } = useGeolocation();

  // Stores the ID of the currently selected carpark
  const [selected, setSelected] = useState<string>();

  // Stores the selected search radius, defaults to 2 km on launch
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

  // Scroll the list to the selected carpark
  useEffect(() => {
    if (!selected) return;
    document
      .getElementById(`carpark-${selected}`)
      ?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [selected]);

  return (
    <main className="flex h-screen flex-col bg-slate-50 text-slate-900 md:flex-row">
      {/* Carpark list: left on desktop, below the map on mobile */}
      <aside className="order-2 h-1/2 overflow-y-auto border-t border-slate-200 bg-white md:order-1 md:h-full md:w-[26rem] md:shrink-0 md:border-r md:border-t-0">
        {/* Header */}
        <header className="bg-gradient-to-br from-blue-600 to-indigo-700 px-5 py-4 text-white">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 text-xl font-bold">
              P
            </span>
            <div>
              <h1 className="text-lg font-bold leading-tight">SG Carpark Finder</h1>
              <p className="text-xs text-blue-100">Live HDB carpark availability</p>
            </div>
          </div>
        </header>

        {/* Controls: stay visible while the list scrolls */}
        <div className="sticky top-0 z-10 space-y-3 border-b border-slate-200 bg-white/95 px-5 py-3 backdrop-blur">
          <button
            onClick={locate}
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-3 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 active:scale-[0.98] disabled:opacity-60"
          >
            {loading && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            )}
            {loading ? "Locating…" : located ? "📍 Update my location" : "📍 Nearby me"}
          </button>

          {error && (
            <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">{error}</p>
          )}

          {/* Shown until the user shares their location */}
          {!located && (
            <p className="rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-700">
              Showing Singapore centre
            </p>
          )}

          <div>
            <div className="mb-1.5 flex items-center justify-between text-xs font-medium text-slate-500">
              <span>Search radius</span>
              <button
                onClick={() => refetch()}
                className="rounded-md px-2 py-1 text-blue-600 transition hover:bg-blue-50"
              >
                {isFetching ? "Updating…" : "Refresh"}
              </button>
            </div>
            <div
              className="grid grid-cols-5 gap-1.5"
              title={located ? undefined : "Tap “Nearby me” to change the radius"}
            >
              {RADIUS_OPTIONS.map((r) => (
                <button
                  key={r}
                  onClick={() => setRadius(r)}
                  disabled={!located}
                  className={`rounded-lg py-1.5 text-sm font-medium transition disabled:cursor-not-allowed ${
                    radius === r
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-50 disabled:hover:bg-slate-100"
                  }`}
                >
                  {r} km
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Summary and live status */}
        <div className="flex items-center justify-between px-5 pb-1 pt-3 text-xs text-slate-500">
          <span>
            {isLoading ? "Loading…" : `${nearby.length} carparks within ${radius} km`}
          </span>
          {dataUpdatedAt > 0 && (
            <span className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              Live · {new Date(dataUpdatedAt).toLocaleTimeString()}
            </span>
          )}
        </div>

        <div className="px-5 pb-6 pt-2">
          {/* Loading skeletons */}
          {isLoading && (
            <ul className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <li key={i} className="animate-pulse rounded-xl border border-slate-200 p-4">
                  <div className="h-4 w-3/4 rounded bg-slate-200" />
                  <div className="mt-4 h-2 rounded bg-slate-200" />
                  <div className="mt-3 h-3 w-1/3 rounded bg-slate-200" />
                </li>
              ))}
            </ul>
          )}

          {isError && (
            <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
              Couldn’t load carpark data.{" "}
              <button onClick={() => refetch()} className="font-semibold underline">
                Try again
              </button>
            </div>
          )}

          {!isLoading && !isError && nearby.length === 0 && (
            <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
              <p className="text-2xl">🅿️</p>
              <p className="mt-2 font-medium text-slate-700">No carparks in this radius</p>
              <p className="mt-1">Try a larger radius.</p>
            </div>
          )}

          <ul className="space-y-3">
            {nearby.map((c) => {
              const percentage = c.total ? Math.round((c.available / c.total) * 100) : 0;
              const status = getStatus(percentage);
              const isSelected = selected === c.id;
              return (
                <li
                  key={c.id}
                  id={`carpark-${c.id}`}
                  onClick={() => setSelected(c.id)}
                  className={`scroll-mt-64 cursor-pointer rounded-xl border p-4 transition hover:shadow-md ${
                    isSelected
                      ? "border-blue-500 bg-blue-50/60 ring-2 ring-blue-500/30"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-slate-900">{c.address}</p>
                      {located && (
                        <p className="mt-0.5 text-xs text-slate-500">{c.dist.toFixed(2)} km away</p>
                      )}
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${status.badge}`}
                    >
                      {status.label}
                    </span>
                  </div>

                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${status.bar}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                  <div className="mt-2 flex items-baseline justify-between text-sm">
                    <span>
                      <span className="text-lg font-bold">{c.available}</span>
                      <span className="text-slate-500"> / {c.total} lots</span>
                    </span>
                    <span className="text-xs text-slate-500">{percentage}% free</span>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </aside>

      {/* Map: right on desktop, on top on mobile */}
      <section className="relative order-1 h-1/2 md:order-2 md:h-full md:flex-1">
        <Map
          center={pos}
          radius={radius}
          carparks={nearby}
          selected={selected}
          onSelect={setSelected}
          located={located}
        />

        {/* Legend */}
        <div className="absolute bottom-4 left-4 z-[1000] rounded-xl bg-white/90 px-3 py-2 text-xs shadow-lg ring-1 ring-black/5 backdrop-blur">
          <p className="mb-1 font-semibold text-slate-700">Availability</p>
          <ul className="space-y-1 text-slate-600">
            <li className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Over 30% free
            </li>
            <li className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> 10–30% free
            </li>
            <li className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500" /> Under 10% free
            </li>
          </ul>
        </div>
      </section>
    </main>
  );
}
