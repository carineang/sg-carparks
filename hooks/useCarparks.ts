import { useQuery } from "@tanstack/react-query";
import type { Carpark } from "@/lib/types";

/**
 * React Hook to fetch and manage carpark data, handles caching, background updates and polling.
 */
export function useCarparks() {
  return useQuery<Carpark[]>({
    queryKey: ["carparks"],

    // Asynchronous function that fetches the data from API route
    queryFn: async () => {
      const res = await fetch("/api/carparks");
      if (!res.ok) throw new Error("Failed to load carparks");
      return res.json();
    },

    // Automatically re-fetches fresh data from the server every 60s for live updates
    refetchInterval: 60000,

    // Treats the data as "fresh" for 30s
    staleTime: 30000,

    // Automatically re-fetches data when the user refocuses the browser tab
    refetchOnWindowFocus: true,
  });
}