import type { IntentType, VibeRoomWithMembers } from "@vyte/shared";
import { supabaseServer } from "./supabaseClient";

async function getUserCityCountry(userId: string): Promise<{ city: string; country: string } | null> {
  if (!supabaseServer) throw new Error("Supabase not configured");

  const { data, error } = await supabaseServer
    .from("user_profiles")
    .select("location_city, location_country")
    .eq("id", userId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data || !data.location_city || !data.location_country) return null;

  return { city: data.location_city, country: data.location_country };
}

export async function findOrCreateVibeRoomForUser(
  userId: string,
  intent: IntentType,
): Promise<VibeRoomWithMembers | null> {
  if (!supabaseServer) throw new Error("Supabase not configured");
  if (intent === "NONE") return null;

  const location = await getUserCityCountry(userId);
  if (!location) return null;

  const { city, country } = location;

  let { data: room, error: roomError } = await supabaseServer
    .from("vibe_rooms")
    .select("id, city, country, intent, created_at, is_active")
    .eq("city", city)
    .eq("country", country)
    .eq("intent", intent)
    .eq("is_active", true)
    .maybeSingle();

  if (roomError && roomError.code !== "PGRST116") {
    throw new Error(roomError.message);
  }

  if (!room) {
    const insertResult = await supabaseServer
      .from("vibe_rooms")
      .insert({ city, country, intent, is_active: true })
      .select("id, city, country, intent, created_at, is_active")
      .single();

    if (insertResult.error) throw new Error(insertResult.error.message);
    room = insertResult.data;
  }

  const now = new Date().toISOString();
  const { error: memberError } = await supabaseServer
    .from("vibe_room_members")
    .upsert(
      {
        room_id: room.id,
        user_id: userId,
        joined_at: now,
        last_seen_at: now,
      },
      { onConflict: "room_id,user_id" },
    );

  if (memberError) throw new Error(memberError.message);

  return getVibeRoomWithMembers(room.id);
}

export async function joinVibeRoom(
  userId: string,
  intent: IntentType,
): Promise<VibeRoomWithMembers | null> {
  return findOrCreateVibeRoomForUser(userId, intent);
}

export async function leaveVibeRoom(userId: string): Promise<void> {
  if (!supabaseServer) throw new Error("Supabase not configured");

  const { error: deleteError } = await supabaseServer
    .from("vibe_room_members")
    .delete()
    .eq("user_id", userId);

  if (deleteError) throw new Error(deleteError.message);
}

export async function getActiveVibeRoomForUser(userId: string): Promise<VibeRoomWithMembers | null> {
  if (!supabaseServer) throw new Error("Supabase not configured");

  const { data: membership, error } = await supabaseServer
    .from("vibe_room_members")
    .select("room_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!membership) return null;

  return getVibeRoomWithMembers(membership.room_id);
}

export async function getVibeRoomWithMembers(roomId: string): Promise<VibeRoomWithMembers | null> {
  if (!supabaseServer) throw new Error("Supabase not configured");

  const { data: room, error: roomError } = await supabaseServer
    .from("vibe_rooms")
    .select("id, city, country, intent, created_at, is_active")
    .eq("id", roomId)
    .maybeSingle();

  if (roomError) throw new Error(roomError.message);
  if (!room) return null;

  const { data: members, error: membersError } = await supabaseServer
    .from("vibe_room_members")
    .select(
      "room_id, user_id, joined_at, last_seen_at, profile:user_profiles!inner(id, display_name, birthdate, gender, bio, location_lat, location_lng, location_city, location_country, created_at, updated_at)",
    )
    .eq("room_id", roomId);

  if (membersError) throw new Error(membersError.message);

  return {
    id: room.id,
    city: room.city,
    country: room.country,
    intent: room.intent,
    createdAt: room.created_at,
    isActive: room.is_active,
    members:
      members?.map((m: any) => ({
        roomId: m.room_id,
        userId: m.user_id,
        joinedAt: m.joined_at,
        lastSeenAt: m.last_seen_at,
        profile: m.profile
          ? {
              id: m.profile.id,
              displayName: m.profile.display_name ?? "",
              birthdate: m.profile.birthdate ?? null,
              gender: m.profile.gender ?? "",
              bio: m.profile.bio ?? null,
              locationLat: m.profile.location_lat,
              locationLng: m.profile.location_lng,
              locationCity: m.profile.location_city,
              locationCountry: m.profile.location_country,
              createdAt: m.profile.created_at,
              updatedAt: m.profile.updated_at,
            }
          : null,
      })) ?? [],
  };
}
