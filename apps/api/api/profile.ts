import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getUserIdFromRequest, AuthError } from "../src/lib/auth";
import { supabaseServer } from "../src/lib/supabaseClient";
import type { UserProfile } from "@vyte/shared";

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const userId = await getUserIdFromRequest(req);

    if (!supabaseServer) {
      res.status(500).json({ error: "Supabase not configured" });
      return;
    }

    const {
      displayName,
      birthdate,
      gender,
      bio,
      locationCity,
      locationCountry,
      locationLat,
      locationLng,
    } = (req.body || {}) as Partial<{
      displayName: string;
      birthdate: string | null;
      gender: string;
      bio: string | null;
      locationCity: string | null;
      locationCountry: string | null;
      locationLat: number | null;
      locationLng: number | null;
    }>;

    const { data: row, error } = await supabaseServer
      .from("user_profiles")
      .upsert(
        {
          id: userId,
          display_name: displayName,
          birthdate,
          gender,
          bio,
          location_city: locationCity,
          location_country: locationCountry,
          location_lat: locationLat,
          location_lng: locationLng,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      )
      .select("id, display_name, birthdate, gender, bio, location_lat, location_lng, location_city, location_country, created_at, updated_at")
      .single();

    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }

    const profile: UserProfile = {
      id: row.id,
      displayName: row.display_name ?? "",
      birthdate: row.birthdate ?? null,
      gender: row.gender ?? "",
      bio: row.bio ?? null,
      locationLat: row.location_lat,
      locationLng: row.location_lng,
      locationCity: row.location_city,
      locationCountry: row.location_country,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };

    res.status(200).json(profile);
  } catch (err) {
    if (err instanceof AuthError) {
      res.status(401).json({ error: err.message });
      return;
    }

    res.status(500).json({ error: "Unexpected error" });
  }
}
