import React, { useState } from "react";
import { StyleSheet, Alert, View, Text } from "react-native";
import { supabase } from "../lib/supabaseClient";
import {
  VyteCard,
  VyteButton,
  VyteInput,
  VyteScreenContainer,
  VyteTitleBlock,
  VyteChip,
} from "../components";
import { vyteColors, vyteSpacing, vyteTypography, vyteRadii } from "../theme/vyteTheme";

interface AuthScreenProps {
  onAuthenticated: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthenticated }) => {
  const [mode, setMode] = useState<"login" | "signup">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    if (!supabase) {
      Alert.alert("Error", "Supabase not configured");
      return;
    }

    setLoading(true);
    try {
      if (mode === "signup") {
        const { error: signUpError } = await supabase.auth.signUp({ email, password });
        if (signUpError) throw signUpError;

        // Ensure we have an active session for subsequent API calls
        const { data: sessionData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          throw signInError;
        }

        if (!sessionData.session) {
          throw new Error("No active session after signup");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      onAuthenticated();
    } catch (err: any) {
      Alert.alert("Auth error", err.message ?? "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <VyteScreenContainer>
      <View style={styles.root}>
        <View style={styles.heroSection}>
          <VyteTitleBlock
            title="Vyte"
            subtitle="Real-time vibes. Meet people who want what you want, right now."
          />

          <View style={styles.heroChipsRow}>
            <VyteChip label="Intent-based matching" />
            <VyteChip label="Vibe rooms near you" />
            <VyteChip label="Meet halfway" />
          </View>

          <Text style={styles.heroDescription}>
            Set your vibe, see who's nearby, and meet in places that work for both of you.
          </Text>
        </View>

        <View style={styles.accentStrip} />

        <VyteCard>
          <View style={styles.formHeader}>
            <Text style={styles.formTitle}>
              {mode === "signup" ? "Create account" : "Welcome back"}
            </Text>
          </View>

          <VyteInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            keyboardType="email-address"
          />

          <VyteInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="••••••••"
          />

          <View style={styles.buttonStack}>
            <VyteButton
              label={loading ? "Please wait" : mode === "signup" ? "Sign up" : "Log in"}
              onPress={handleAuth}
              disabled={loading}
            />
          </View>

          <View style={styles.modeToggleRow}>
            <Text style={styles.modeToggleText}>
              {mode === "signup" ? "Already have an account? " : "New here? "}
            </Text>
            <Text
              style={styles.modeToggleLink}
              onPress={() => setMode(mode === "signup" ? "login" : "signup")}
            >
              {mode === "signup" ? "Log in" : "Create an account"}
            </Text>
          </View>
        </VyteCard>
      </View>
    </VyteScreenContainer>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: "space-between",
  },
  heroSection: {
    marginBottom: vyteSpacing.lg,
  },
  heroChipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: vyteSpacing.sm,
    gap: vyteSpacing.sm,
  },
  heroDescription: {
    marginTop: vyteSpacing.md,
    color: vyteColors.textMuted,
    fontSize: vyteTypography.body,
  },
  accentStrip: {
    height: 2,
    backgroundColor: vyteColors.accent,
    borderRadius: vyteRadii.xs,
    marginBottom: vyteSpacing.lg,
  },
  formHeader: {
    marginBottom: vyteSpacing.md,
  },
  formTitle: {
    fontSize: vyteTypography.subtitle,
    color: vyteColors.textPrimary,
    fontWeight: "600",
  },
  buttonStack: {
    marginTop: vyteSpacing.lg,
  },
  modeToggleRow: {
    marginTop: vyteSpacing.md,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  modeToggleText: {
    color: vyteColors.textSecondary,
    fontSize: vyteTypography.caption,
  },
  modeToggleLink: {
    color: vyteColors.accent,
    fontSize: vyteTypography.caption,
    fontWeight: "600",
  },
});
