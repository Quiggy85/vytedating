import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Alert } from "react-native";
import { supabase } from "../lib/supabaseClient";

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
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
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
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Vyte</Text>
        <Text style={styles.subtitle}>{mode === "signup" ? "Create account" : "Welcome back"}</Text>

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="you@example.com"
          placeholderTextColor="#55576A"
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="••••••••"
          placeholderTextColor="#55576A"
        />

        <TouchableOpacity style={styles.primaryButton} onPress={handleAuth} disabled={loading}>
          <Text style={styles.primaryButtonText}>
            {loading ? "Please wait" : mode === "signup" ? "Sign up" : "Log in"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => setMode(mode === "signup" ? "login" : "signup")}
        >
          <Text style={styles.secondaryButtonText}>
            {mode === "signup" ? "Already have an account? Log in" : "New here? Create an account"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#060608",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  card: {
    backgroundColor: "#101018",
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    padding: 24,
  },
  title: {
    fontSize: 28,
    color: "#F5F5FA",
    fontWeight: "700",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#A5A7C2",
    marginBottom: 24,
  },
  label: {
    fontSize: 12,
    color: "#A5A7C2",
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    backgroundColor: "#151521",
    borderRadius: 3,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#F5F5FA",
    fontSize: 14,
  },
  primaryButton: {
    marginTop: 24,
    backgroundColor: "#FF4F5E",
    borderRadius: 3,
    paddingVertical: 12,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#F5F5FA",
    fontSize: 14,
    fontWeight: "600",
  },
  secondaryButton: {
    marginTop: 16,
  },
  secondaryButtonText: {
    color: "#A5A7C2",
    fontSize: 12,
  },
});
