"use client";
import { useEffect, useState } from "react";

const SG_CENTRE: [number, number] = [1.3521, 103.8198];

/**
 * React Hook to retrieve user's current geographic coordinates, falls back to Singapore's centre if geolocation is unsupported.
 */
export function useGeolocation() {
  const [pos, setPos] = useState<[number, number]>(SG_CENTRE);
  const [located, setLocated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) return setError("Geolocation not supported");

    // Request the user's current position from the browser
    navigator.geolocation.getCurrentPosition(
      
      // Triggered if the user grants permission and location is found
      (p) => { setPos([p.coords.latitude, p.coords.longitude]); setLocated(true); },

      // Triggered if the user denies permission or a timeout occurs
      () => setError("Location denied. Showing Singapore centre."),

      // Options for high accuracy and 8s timeout window
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, []);

  return { pos, located, error };
}