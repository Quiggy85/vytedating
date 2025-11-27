import type {
  FeatureEntitlements,
  SubscriptionTier,
  IntentType,
  UserIntent,
  UserProfile,
  VibeRoomWithMembers,
} from "@vyte/shared";

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL || "http://localhost:3000/api";

export interface MeEntitlementsResponse {
  tier: SubscriptionTier;
  entitlements: FeatureEntitlements;
}

export async function fetchEntitlements(
  token: string,
): Promise<MeEntitlementsResponse> {
  const url = `${API_BASE_URL}/me/entitlements`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const raw = await res.text();
    console.warn("ENTITLEMENTS_FETCH_ERROR", res.status, raw);

    let message = `Failed to fetch entitlements (status ${res.status})`;
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object" && "error" in parsed && parsed.error) {
        message = String(parsed.error);
      }
    } catch {
      if (raw) message = raw;
    }

    throw new Error(message);
  }

  const json = (await res.json()) as MeEntitlementsResponse;
  return json;
}

export async function setUserIntent(token: string, intent: IntentType): Promise<UserIntent> {
  const res = await fetch(`${API_BASE_URL}/me/intent`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ intent }),
  });

  if (!res.ok) {
    const raw = await res.text();
    console.warn("SET_INTENT_ERROR", res.status, raw);
    throw new Error(`Failed to set intent: ${res.status}`);
  }

  return (await res.json()) as UserIntent;
}

export async function fetchNearbyIntents(
  token: string,
  intent?: IntentType,
): Promise<
  Array<{
    profile: UserProfile;
    intent: UserIntent;
  }>
> {
  const url = new URL(`${API_BASE_URL}/intents/nearby`);
  if (intent && intent !== "NONE") {
    url.searchParams.set("intent", intent);
  }

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const raw = await res.text();
    console.warn("NEARBY_INTENTS_ERROR", res.status, raw);
    throw new Error(`Failed to fetch nearby intents: ${res.status}`);
  }

  return (await res.json()) as Array<{
    profile: UserProfile;
    intent: UserIntent;
  }>;
}

export async function joinVibeRoomApi(
  token: string,
  intent: IntentType,
): Promise<VibeRoomWithMembers | null> {
  const res = await fetch(`${API_BASE_URL}/vibe-rooms/join`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ intent }),
  });

  if (!res.ok) {
    const raw = await res.text();
    console.warn("JOIN_VIBE_ROOM_ERROR", res.status, raw);
    throw new Error(`Failed to join vibe room: ${res.status}`);
  }

  if (res.status === 204) return null;
  return (await res.json()) as VibeRoomWithMembers | null;
}

export async function leaveVibeRoomApi(token: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/vibe-rooms/leave`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const raw = await res.text();
    console.warn("LEAVE_VIBE_ROOM_ERROR", res.status, raw);
    throw new Error(`Failed to leave vibe room: ${res.status}`);
  }
}

export async function fetchActiveVibeRoom(
  token: string,
): Promise<VibeRoomWithMembers | null> {
  const res = await fetch(`${API_BASE_URL}/vibe-rooms/active`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const raw = await res.text();
    console.warn("ACTIVE_VIBE_ROOM_ERROR", res.status, raw);
    throw new Error(`Failed to fetch active vibe room: ${res.status}`);
  }

  if (res.status === 204) return null;
  return (await res.json()) as VibeRoomWithMembers | null;
}
