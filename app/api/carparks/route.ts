import { NextResponse } from "next/server";
import proj4 from "proj4";
import type { Carpark } from "@/lib/types";

const SVY21 =
  "+proj=tmerc +lat_0=1.366666666666667 +lon_0=103.8333333333333 +k=1 +x_0=28001.642 +y_0=38744.572 +ellps=WGS84 +units=m +no_defs";

const INFO_URL =
  "https://data.gov.sg/api/action/datastore_search?resource_id=d_23f946fa557947f93a8043bbef41dd09&limit=5000";
const LIVE_URL = "https://api.data.gov.sg/v1/transport/carpark-availability";

type Info = { address: string; lat: number; lng: number };
let infoCache: Map<string, Info> | null = null;

/**
 * Helper function to fetch static carpark information.
 * Converts local SVY21 grid coordinates to global WGS84 latitude and longitude.
 */
async function getInfo() {
  if (infoCache) return infoCache;
  const res = await fetch(INFO_URL, { next: { revalidate: 86400 } });
  const json = await res.json();
  const map = new Map<string, Info>();
  for (const r of json.result.records) {
    const [lng, lat] = proj4(SVY21, "WGS84", [+r.x_coord, +r.y_coord]);
    map.set(r.car_park_no, { address: r.address, lat, lng });
  }
  return (infoCache = map);
}

/**
 * Next.js API Route Handler (GET request).
 * Fetches real-time availability, combines it with cached static details, and returns a unified array.
 */
export async function GET() {
  try {
    const [info, liveRes] = await Promise.all([
      getInfo(),
      fetch(LIVE_URL, { next: { revalidate: 30 } }),
    ]);
    const live = await liveRes.json();
    const data = live.items[0].carpark_data;

    const carparks: Carpark[] = [];
    for (const d of data) {
      const location = info.get(d.carpark_number);
      if (!location) continue;
      const lots = d.carpark_info[0];
      carparks.push({
        id: d.carpark_number,
        ...location,
        total: +lots.total_lots,
        available: +lots.lots_available,
        updatedAt: d.update_datetime,
      });
    }
    return NextResponse.json(carparks);
  } catch {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 502 });
  }
}