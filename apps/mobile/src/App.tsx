import React, { useEffect, useState } from "react";
import { ActivityIndicator, View, StyleSheet } from "react-native";
import { supabase } from "./lib/supabaseClient";
import type { UserProfile } from "@vyte/shared";
import { AuthScreen } from "./screens/AuthScreen";
import { ProfileSetupScreen } from "./screens/ProfileSetupScreen";
import { HomeScreen } from "./screens/HomeScreen";

type AppStage = "loading" | "auth" | "profile" | "home";

// Configure this to point to your deployed API base URL, e.g. https://vyte-api.vercel.app/api
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || "http://localhost:3000/api";

export default function App() {
  const [stage, setStage] = useState<AppStage>("loading");
  const [profile, setProfile] = useState<UserProfile | null>(null);

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
        const res = await fetch(`${API_BASE_URL}/me`, {
          headers: {
            Authorization: `Bearer ${data.session.access_token}`,
          },
        });

        if (res.ok) {
          const p: UserProfile = await res.json();
          setProfile(p);
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

  return <HomeScreen />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: "#060608",
    alignItems: "center",
    justifyContent: "center",
  },
});
