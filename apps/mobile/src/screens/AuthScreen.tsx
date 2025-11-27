import React, { useState } from "react";
import { StyleSheet, Alert, View } from "react-native";
import { supabase } from "../lib/supabaseClient";
import { VyteCard, VyteButton, VyteInput, VyteScreenContainer, VyteTitleBlock } from "../components";

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
      <VyteCard>
        <VyteTitleBlock
          title="Vyte"
          subtitle={mode === "signup" ? "Create account" : "Welcome back"}
        />

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
          <VyteButton
            label={
              mode === "signup" ? "Already have an account? Log in" : "New here? Create an account"
            }
            onPress={() => setMode(mode === "signup" ? "login" : "signup")}
            variant="ghost"
          />
        </View>
      </VyteCard>
    </VyteScreenContainer>
  );
};

const styles = StyleSheet.create({
  buttonStack: {
    marginTop: 24,
    gap: 12,
  },
});
