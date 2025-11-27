import React, { useEffect, useState, useCallback } from "react";
import { ActivityIndicator, View, StyleSheet } from "react-native";
import { supabase } from "./lib/supabaseClient";
import type {
  UserProfile,
  FeatureEntitlements,
  SubscriptionTier,
  IntentType,
  UserIntent,
  VibeRoomWithMembers,
} from "@vyte/shared";
import { AuthScreen } from "./screens/AuthScreen";
import { ProfileSetupScreen } from "./screens/ProfileSetupScreen";
import { HomeScreen } from "./screens/HomeScreen";
import {
  API_BASE_URL,
  fetchEntitlements,
  setUserIntent,
  fetchNearbyIntents,
  joinVibeRoomApi,
  leaveVibeRoomApi,
  fetchActiveVibeRoom,
} from "./lib/api";

type AppStage = "loading" | "auth" | "profile" | "home";

export default function App() {
  console.log("API:", process.env.EXPO_PUBLIC_API_BASE_URL);
  console.log("SUPABASE:", process.env.EXPO_PUBLIC_SUPABASE_URL);

  const [stage, setStage] = useState<AppStage>("loading");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [entitlements, setEntitlements] = useState<FeatureEntitlements | null>(null);
  const [tier, setTier] = useState<SubscriptionTier | null>(null);
  const [currentIntent, setCurrentIntent] = useState<IntentType>("NONE");
  const [nearbyIntents, setNearbyIntents] = useState<
    Array<{
      profile: UserProfile;
      intent: UserIntent;
    }>
  >([]);
  const [activeVibeRoom, setActiveVibeRoom] = useState<VibeRoomWithMembers | null>(null);

  useEffect(() => {
    const bootstrap = async () => {
      if (!supabase) {
        setStage("auth");
        return;
      }

      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        setStage("auth");
        return;
      }

      try {
        const token = data.session.access_token;

        const res = await fetch(`${API_BASE_URL}/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const p: UserProfile = await res.json();
          setProfile(p);

          // Fetch entitlements and active vibe room in parallel, but do not block navigation to Home
          fetchEntitlements(token)
            .then((result) => {
              setEntitlements(result.entitlements);
              setTier(result.tier);
              console.log("Entitlements", result);
            })
            .catch((error) => {
              console.warn("Failed to fetch entitlements", error);
            });

          fetchActiveVibeRoom(token)
            .then((room) => {
              setActiveVibeRoom(room);
            })
            .catch((error) => {
              console.warn("Failed to fetch active vibe room", error);
            })
            .finally(() => {
              setStage("home");
            });

          // Optimistically go to home even before async calls resolve
          setStage("home");
        } else if (res.status === 404) {
          setStage("profile");
        } else {
          setStage("auth");
        }
      } catch {
        setStage("auth");
      }
    };

    bootstrap();
  }, []);

  const handleChangeIntent = useCallback(
    async (intent: IntentType) => {
      if (!supabase) return;

      // Optimistic local update
      setCurrentIntent(intent);
      if (intent === "NONE") {
        setNearbyIntents([]);
      }

      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        console.warn("No session when changing intent");
        return;
      }

      const token = data.session.access_token;

      try {
        if (intent !== "NONE") {
          await setUserIntent(token, intent);
          const results = await fetchNearbyIntents(token, intent);
          setNearbyIntents(results);

          const room = await joinVibeRoomApi(token, intent);
          setActiveVibeRoom(room);
        } else {
          await leaveVibeRoomApi(token);
          setActiveVibeRoom(null);
        }
      } catch (error) {
        console.warn("Failed to update intent or fetch nearby intents", error);
      }
    },
    [],
  );

  if (stage === "loading") {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color="#FF4F5E" />
      </View>
    );
  }

  if (stage === "auth") {
    return (
      <AuthScreen
        onAuthenticated={() => {
          setStage("profile");
        }}
      />
    );
  }

  if (stage === "profile") {
    return (
      <ProfileSetupScreen
        apiBaseUrl={API_BASE_URL}
        onCompleted={(p) => {
          setProfile(p);
          setStage("home");
        }}
      />
    );
  }

  return (
    <HomeScreen
      profile={profile}
      entitlements={entitlements}
      currentIntent={currentIntent}
      onChangeIntent={handleChangeIntent}
      nearbyIntents={nearbyIntents}
      activeVibeRoom={activeVibeRoom}
    />
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: "#060608",
    alignItems: "center",
    justifyContent: "center",
  },
});
