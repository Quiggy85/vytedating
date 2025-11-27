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
  // First, find user intents updated recently for this intent
  const { data: intentRows, error: intentsError } = await supabaseServer
    .from("user_intents")
    .select("user_id, intent, updated_at")
    .eq("intent", intent)
    .gte("updated_at", fourHoursAgo)
    .neq("user_id", userId);

  if (intentsError) {
    throw new Error(intentsError.message);
  }

  if (!intentRows || intentRows.length === 0) {
    return [];
  }

  // Collect unique user ids and limit how many we fetch
  const uniqueUserIds = Array.from(new Set(intentRows.map((row: any) => row.user_id)));

  if (uniqueUserIds.length === 0) {
    return [];
  }

  const { data: profileRows, error: profilesError } = await supabaseServer
    .from("user_profiles")
    .select(
      "id, display_name, birthdate, gender, bio, location_lat, location_lng, location_city, location_country, created_at, updated_at",
    )
    .in("id", uniqueUserIds)
    .eq("location_city", meProfile.location_city)
    .eq("location_country", meProfile.location_country)
    .limit(limit);

  if (profilesError) {
    throw new Error(profilesError.message);
  }

  if (!profileRows || profileRows.length === 0) {
    return [];
  }

  const intentsByUserId = new Map<string, UserIntent>();
  for (const row of intentRows as any[]) {
    const mapped = mapRowToUserIntent(row);
    // Keep the latest intent per user
    const existing = intentsByUserId.get(mapped.userId);
    if (!existing || existing.updatedAt < mapped.updatedAt) {
      intentsByUserId.set(mapped.userId, mapped);
    }
  }

  const results: Array<{ profile: UserProfile; intent: UserIntent }> = [];

  for (const profileRow of profileRows as any[]) {
    const userIntent = intentsByUserId.get(profileRow.id);
    if (!userIntent) continue;

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

    results.push({ profile, intent: userIntent });
  }

  return results.slice(0, limit);
}
