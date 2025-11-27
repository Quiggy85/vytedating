import React from "react";
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from "react-native";
import type { UserProfile, FeatureEntitlements, IntentType, UserIntent, VibeRoomWithMembers } from "@vyte/shared";

interface HomeScreenProps {
  profile: UserProfile | null;
  entitlements: FeatureEntitlements | null;
  currentIntent: IntentType;
  onChangeIntent: (intent: IntentType) => void;
  nearbyIntents: Array<{
    profile: UserProfile;
    intent: UserIntent;
  }>;
  activeVibeRoom: VibeRoomWithMembers | null;
}

const INTENT_CHIPS: { label: string; value: IntentType }[] = [
  { label: "Off", value: "NONE" },
  { label: "Just chat", value: "JUST_CHAT" },
  { label: "Drinks", value: "DRINKS" },
  { label: "Date", value: "DATE" },
  { label: "See where it goes", value: "SEE_WHERE_IT_GOES" },
];

export const HomeScreen: React.FC<HomeScreenProps> = ({
  profile,
  entitlements,
  currentIntent,
  onChangeIntent,
  nearbyIntents,
  activeVibeRoom,
}) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Home</Text>
        <Text style={styles.subtitle}>
          {profile?.displayName
            ? `Welcome back, ${profile.displayName}`
            : "Your Vyte experience will live here soon."}
        </Text>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What are you in the mood for?</Text>
          <View style={styles.chipRow}>
            {INTENT_CHIPS.map((chip) => {
              const selected = chip.value === currentIntent;
              return (
                <TouchableOpacity
                  key={chip.value}
                  style={[styles.chip, selected && styles.chipSelected]}
                  onPress={() => onChangeIntent(chip.value)}
                >
                  <Text style={[styles.chipLabel, selected && styles.chipLabelSelected]}>
                    {chip.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vibe Room</Text>
          {currentIntent === "NONE" || !activeVibeRoom ? (
            <Text style={styles.sectionValue}>Set a vibe above to join a room.</Text>
          ) : (
            <View style={styles.vibeCard}>
              <View style={styles.vibeHeaderRow}>
                <View>
                  <Text style={styles.vibeTitle}>{activeVibeRoom.intent}</Text>
                  <Text style={styles.vibeSubtitle}>
                    {[activeVibeRoom.city, activeVibeRoom.country]
                      .filter(Boolean)
                      .join(", ") || "Somewhere nearby"}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.leaveButton}
                  onPress={() => onChangeIntent("NONE")}
                >
                  <Text style={styles.leaveButtonLabel}>Leave</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.vibeMembersBox}>
                {activeVibeRoom.members.length === 0 ? (
                  <Text style={styles.sectionValue}>You are the first one here.</Text>
                ) : (
                  <ScrollView style={styles.vibeMembersList}>
                    {activeVibeRoom.members.map((member) => (
                      <View key={member.userId} style={styles.vibeMemberRow}>
                        <Text style={styles.vibeMemberName}>
                          {member.profile?.displayName || "Someone"}
                        </Text>
                        <Text style={styles.vibeMemberMeta}>
                          {[member.profile?.locationCity, member.profile?.locationCountry]
                            .filter(Boolean)
                            .join(", ") || "Somewhere out there"}
                        </Text>
                      </View>
                    ))}
                  </ScrollView>
                )}
              </View>
            </View>
          )}
        </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nearby Vytes</Text>
          {nearbyIntents.length === 0 ? (
            <Text style={styles.sectionValue}>No one nearby with this vibe yet.</Text>
          ) : (
            <ScrollView style={styles.nearbyList}>
              {nearbyIntents.map((entry) => (
                <View key={entry.profile.id} style={styles.nearbyCard}>
                  <Text style={styles.nearbyName}>{entry.profile.displayName}</Text>
                  <Text style={styles.nearbyLocation}>
                    {[entry.profile.locationCity, entry.profile.locationCountry]
                      .filter(Boolean)
                      .join(", ") || "Somewhere out there"}
                  </Text>
                  <Text style={styles.nearbyIntent}>{entry.intent.intent}</Text>
                </View>
              ))}
            </ScrollView>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Entitlements (debug)</Text>
          <View style={styles.entitlementsBox}>
            <ScrollView>
              <Text style={styles.entitlementsText}>
                {entitlements ? JSON.stringify(entitlements, null, 2) : "No entitlements loaded"}
              </Text>
            </ScrollView>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#060608",
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  card: {
    backgroundColor: "#101018",
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    padding: 24,
    flex: 1,
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
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 12,
    color: "#A5A7C2",
    marginBottom: 4,
  },
  sectionValue: {
    fontSize: 14,
    color: "#F5F5FA",
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    backgroundColor: "#151521",
  },
  chipSelected: {
    backgroundColor: "#FF4F5E",
    borderColor: "#FF4F5E",
  },
  chipLabel: {
    fontSize: 12,
    color: "#A5A7C2",
  },
  chipLabelSelected: {
    color: "#F5F5FA",
    fontWeight: "600",
  },
  nearbyList: {
    maxHeight: 200,
    marginTop: 8,
  },
  nearbyCard: {
    backgroundColor: "#151521",
    borderRadius: 3,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    padding: 10,
    marginBottom: 8,
  },
  nearbyName: {
    fontSize: 14,
    color: "#F5F5FA",
    fontWeight: "600",
    marginBottom: 2,
  },
  nearbyLocation: {
    fontSize: 12,
    color: "#A5A7C2",
    marginBottom: 4,
  },
  nearbyIntent: {
    fontSize: 12,
    color: "#FF4F5E",
  },
  vibeCard: {
    marginTop: 8,
    backgroundColor: "#151521",
    borderRadius: 3,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    padding: 10,
  },
  vibeHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  vibeTitle: {
    fontSize: 14,
    color: "#F5F5FA",
    fontWeight: "600",
  },
  vibeSubtitle: {
    fontSize: 12,
    color: "#A5A7C2",
    marginTop: 2,
  },
  leaveButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: "#FF4F5E",
    backgroundColor: "#FF4F5E",
  },
  leaveButtonLabel: {
    fontSize: 12,
    color: "#F5F5FA",
    fontWeight: "600",
  },
  vibeMembersBox: {
    borderRadius: 3,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "#101018",
    padding: 8,
    maxHeight: 160,
  },
  vibeMembersList: {
    maxHeight: 160,
  },
  vibeMemberRow: {
    marginBottom: 6,
  },
  vibeMemberName: {
    fontSize: 13,
    color: "#F5F5FA",
    fontWeight: "500",
  },
  vibeMemberMeta: {
    fontSize: 11,
    color: "#A5A7C2",
  },
  entitlementsBox: {
    marginTop: 4,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "#151521",
    padding: 8,
    maxHeight: 160,
  },
  entitlementsText: {
    fontSize: 11,
    color: "#A5A7C2",
    fontFamily: "monospace",
  },
});
