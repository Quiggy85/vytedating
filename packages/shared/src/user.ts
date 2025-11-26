export type SubscriptionTier = "FREE" | "PLUS" | "ELITE";

export interface UserProfile {
  id: string;
  displayName: string;
  birthdate: string | null; // ISO date string (YYYY-MM-DD) or null
  gender: string;
  bio: string | null;
  locationLat: number | null;
  locationLng: number | null;
  locationCity: string | null;
  locationCountry: string | null;
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
}
