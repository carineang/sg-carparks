"use client";
import { useCallback, useState } from "react";

const SG_CENTRE: [number, number] = [1.3521, 103.8198];

export function useGeolocation() {
  // Stores user's coordinates. Initially, use Singapore's centre as default location.
  const [pos, setPos] = useState<[number, number]>(SG_CENTRE);
  
  // Tracks whether the actual user location has been successfully obtained
  const [located, setLocated] = useState(false);
  
  // Tracks whether a location request is currently in progress
  const [loading, setLoading] = useState(false);
  
  // Stores an error message if something goes wrong
  const [error, setError] = useState<string | null>(null);

  /**
   * useCallback memoizes this function so it doesn't get recreated unnecessarily during component re-renders.
   */
  const locate = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }
    setLoading(true);
    setError(null);

    // Ask the browser to retrieve user's current location
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setPos([p.coords.latitude, p.coords.longitude]);
        setLocated(true);
        setLoading(false);
      },
      (err) => {
        setLoading(false);
        setError(
          err.code === err.PERMISSION_DENIED
            ? "Location permission denied. Enable it in your browser settings."
            : err.code === err.TIMEOUT
            ? "Location request timed out. Please try again."
            : "Couldn't determine your location."
        );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  }, []);

  return { pos, located, loading, error, locate };
}
