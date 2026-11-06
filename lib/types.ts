/**
 * Represents a carpark with its location and real-time availability.
 */
export type Carpark = {
  id: string;
  address: string;
  lat: number;
  lng: number;
  total: number;
  available: number;
  updatedAt: string;
};