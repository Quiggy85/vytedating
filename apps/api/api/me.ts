import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getUserIdFromRequest, AuthError } from "../src/lib/auth";
import { supabaseServer } from "../src/lib/supabaseClient";
import type { UserProfile } from "@vyte/shared";

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const userId = await getUserIdFromRequest(req);

    if (!supabaseServer) {
      res.status(500).json({ error: "Supabase not configured" });
      return;
    }

    const { data: profileRow, error } = await supabaseServer
      .from("user_profiles")
      .select("id, display_name, birthdate, gender, bio, location_lat, location_lng, location_city, location_country, created_at, updated_at")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }

    if (!profileRow) {
      res.status(404).json({ error: "Profile not found" });
      return;
    }

    const profile: UserProfile = {
      id: profileRow.id,
      displayName: profileRow.display_name ?? "",
      birthdate: profileRow.birthdate ?? null,
      gender: profileRow.gender ?? "",
      bio: profileRow.bio ?? null,
      locationLat: profileRow.location_lat,
      locationLng: profileRow.location_lng,
      locationCity: profileRow.location_city,
      locationCountry: profileRow.location_country,
      createdAt: profileRow.created_at,
      updatedAt: profileRow.updated_at,
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
