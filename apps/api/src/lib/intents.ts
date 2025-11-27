import type { IntentType, UserIntent, UserProfile } from "@vyte/shared";
import { supabaseServer } from "./supabaseClient";

function mapRowToUserIntent(row: any): UserIntent {
  return {
    userId: row.user_id,
    intent: row.intent as IntentType,
    updatedAt: row.updated_at,
  };
}

export async function upsertUserIntent(userId: string, intent: IntentType): Promise<UserIntent> {
  if (!supabaseServer) {
    throw new Error("Supabase not configured");
  }

  const { data, error } = await supabaseServer
    .from("user_intents")
    .upsert(
      {
        user_id: userId,
        intent,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    )
    .select("user_id, intent, updated_at")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapRowToUserIntent(data);
}

export async function getUserIntent(userId: string): Promise<UserIntent | null> {
  if (!supabaseServer) {
    throw new Error("Supabase not configured");
  }

  const { data, error } = await supabaseServer
    .from("user_intents")
    .select("user_id, intent, updated_at")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) return null;
  return mapRowToUserIntent(data);
}

export async function findNearbyUsersWithIntent(
  userId: string,
  intent: IntentType,
  limit: number,
): Promise<
  Array<{
    profile: UserProfile;
    intent: UserIntent;
  }>
> {
  if (!supabaseServer) {
    throw new Error("Supabase not configured");
  }

  // Get current user's city/country
  const { data: meProfile, error: meError } = await supabaseServer
    .from("user_profiles")
    .select("id, display_name, birthdate, gender, bio, location_lat, location_lng, location_city, location_country, created_at, updated_at")
    .eq("id", userId)
    .maybeSingle();

  if (meError) {
    throw new Error(meError.message);
  }

  if (!meProfile || !meProfile.location_city || !meProfile.location_country) {
    return [];
  }

  const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabaseServer
    .from("user_intents")
    .select(
      "user_id, intent, updated_at, profile:user_profiles!inner(id, display_name, birthdate, gender, bio, location_lat, location_lng, location_city, location_country, created_at, updated_at)",
    )
    .eq("intent", intent)
    .gte("updated_at", fourHoursAgo)
    .eq("profile.location_city", meProfile.location_city)
    .eq("profile.location_country", meProfile.location_country)
    .neq("user_id", userId)
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  if (!data) return [];

  return data.map((row: any) => {
    const profileRow = row.profile;
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

    const userIntent = mapRowToUserIntent(row);

    return { profile, intent: userIntent };
  });
}
