import React, { useState } from "react";
import { StyleSheet, Alert, ScrollView, View } from "react-native";
import { supabase } from "../lib/supabaseClient";
import type { UserProfile } from "@vyte/shared";
import { VyteCard, VyteButton, VyteInput, VyteScreenContainer, VyteTitleBlock } from "../components";

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
    <VyteScreenContainer>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <VyteCard>
          <VyteTitleBlock
            title="Set up your vibe"
            subtitle="Tell Vyte who you are so we can match your energy."
          />

          <VyteInput
            label="Display name"
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="Alex"
          />

          <VyteInput
            label="Birthdate (YYYY-MM-DD)"
            value={birthdate}
            onChangeText={setBirthdate}
            placeholder="1995-05-10"
          />

          <VyteInput
            label="Gender"
            value={gender}
            onChangeText={setGender}
            placeholder="Your gender"
          />

          <VyteInput
            label="Short bio"
            value={bio}
            onChangeText={setBio}
            placeholder="Two lines that feel like you."
            multiline
          />

          <VyteInput
            label="City"
            value={city}
            onChangeText={setCity}
            placeholder="London"
          />

          <VyteInput
            label="Country"
            value={country}
            onChangeText={setCountry}
            placeholder="United Kingdom"
          />

          <View style={styles.buttonContainer}>
            <VyteButton
              label={loading ? "Saving" : "Save profile"}
              onPress={handleSubmit}
              disabled={loading}
            />
          </View>
        </VyteCard>
      </ScrollView>
    </VyteScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  buttonContainer: {
    marginTop: 24,
  },
});
