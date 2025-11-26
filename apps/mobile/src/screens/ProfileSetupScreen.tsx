import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Alert, ScrollView } from "react-native";
import { supabase } from "../lib/supabaseClient";
import type { UserProfile } from "@vyte/shared";

interface ProfileSetupScreenProps {
  apiBaseUrl: string;
  onCompleted: (profile: UserProfile) => void;
}

export const ProfileSetupScreen: React.FC<ProfileSetupScreenProps> = ({ apiBaseUrl, onCompleted }) => {
  const [displayName, setDisplayName] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [gender, setGender] = useState("");
  const [bio, setBio] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!supabase) {
      Alert.alert("Error", "Supabase not configured");
      return;
    }

    setLoading(true);
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData.session) {
        throw new Error("Not authenticated");
      }

      const token = sessionData.session.access_token;
      const response = await fetch(`${apiBaseUrl}/profile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          displayName,
          birthdate: birthdate || null,
          gender,
          bio: bio || null,
          locationCity: city || null,
          locationCountry: country || null,
        }),
      });

      if (!response.ok) {
        const rawText = await response.text();
        console.log("PROFILE_SAVE_ERROR", response.status, rawText);

        let message = "Failed to save profile";
        try {
          const parsed = JSON.parse(rawText);
          if (parsed && typeof parsed === "object" && "error" in parsed && parsed.error) {
            message = String(parsed.error);
          }
        } catch {
          if (rawText) {
            message = rawText;
          }
        }

        throw new Error(message);
      }

      const profile: UserProfile = await response.json();
      onCompleted(profile);
    } catch (err: any) {
      Alert.alert("Profile error", err.message ?? "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <Text style={styles.title}>Set up your vibe</Text>
          <Text style={styles.subtitle}>Tell Vyte who you are so we can match your energy.</Text>

          <Text style={styles.label}>Display name</Text>
          <TextInput
            style={styles.input}
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="Alex"
            placeholderTextColor="#55576A"
          />

          <Text style={styles.label}>Birthdate (YYYY-MM-DD)</Text>
          <TextInput
            style={styles.input}
            value={birthdate}
            onChangeText={setBirthdate}
            placeholder="1995-05-10"
            placeholderTextColor="#55576A"
          />

          <Text style={styles.label}>Gender</Text>
          <TextInput
            style={styles.input}
            value={gender}
            onChangeText={setGender}
            placeholder="Your gender"
            placeholderTextColor="#55576A"
          />

          <Text style={styles.label}>Short bio</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={bio}
            onChangeText={setBio}
            placeholder="Two lines that feel like you."
            placeholderTextColor="#55576A"
            multiline
          />

          <Text style={styles.label}>City</Text>
          <TextInput
            style={styles.input}
            value={city}
            onChangeText={setCity}
            placeholder="London"
            placeholderTextColor="#55576A"
          />

          <Text style={styles.label}>Country</Text>
          <TextInput
            style={styles.input}
            value={country}
            onChangeText={setCountry}
            placeholder="United Kingdom"
            placeholderTextColor="#55576A"
          />

          <TouchableOpacity style={styles.primaryButton} onPress={handleSubmit} disabled={loading}>
            <Text style={styles.primaryButtonText}>{loading ? "Saving" : "Save profile"}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#060608",
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  card: {
    backgroundColor: "#101018",
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    padding: 24,
  },
  title: {
    fontSize: 24,
    color: "#F5F5FA",
    fontWeight: "700",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13,
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
  textArea: {
    height: 100,
    textAlignVertical: "top",
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
});
