import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import type { UserProfile, FeatureEntitlements, IntentType, UserIntent, VibeRoomWithMembers } from "@vyte/shared";
import { VyteCard, VyteChip, VyteScreenContainer, VyteSection, VyteTitleBlock } from "../components";
import { vyteColors, vyteSpacing, vyteTypography, vyteRadii } from "../theme/vyteTheme";

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
    <VyteScreenContainer>
      <VyteCard style={styles.card}>
        <VyteTitleBlock
          title="Home"
          subtitle={
            profile?.displayName
              ? `Welcome back, ${profile.displayName}`
              : "Your Vyte experience will live here soon."
          }
        />

        <VyteSection title="What are you in the mood for?">
          <View style={styles.chipRow}>
            {INTENT_CHIPS.map((chip) => (
              <VyteChip
                key={chip.value}
                label={chip.label}
                selected={chip.value === currentIntent}
                onPress={() => onChangeIntent(chip.value)}
                style={styles.chip}
              />
            ))}
          </View>
        </VyteSection>

        <VyteSection title="Vibe Room">
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
                <View style={styles.leaveButton}>
                  <Text style={styles.leaveButtonLabel} onPress={() => onChangeIntent("NONE")}>
                    Leave
                  </Text>
                </View>
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
        </VyteSection>

        <VyteSection title="Nearby Vytes">
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
        </VyteSection>

        <VyteSection title="Entitlements (debug)">
          <View style={styles.entitlementsBox}>
            <ScrollView>
              <Text style={styles.entitlementsText}>
                {entitlements ? JSON.stringify(entitlements, null, 2) : "No entitlements loaded"}
              </Text>
            </ScrollView>
          </View>
        </VyteSection>
      </VyteCard>
    </VyteScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    flex: 1,
  },
  section: {
    marginBottom: vyteSpacing.lg,
  },
  sectionTitle: {
    fontSize: vyteTypography.label,
    color: vyteColors.textSecondary,
    marginBottom: vyteSpacing.xs,
  },
  sectionValue: {
    fontSize: vyteTypography.body,
    color: vyteColors.textPrimary,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: vyteSpacing.sm,
    gap: vyteSpacing.sm,
  },
  chip: {
  },
  nearbyList: {
    maxHeight: 200,
    marginTop: vyteSpacing.sm,
  },
  nearbyCard: {
    backgroundColor: vyteColors.surfaceMuted,
    borderRadius: vyteRadii.sm,
    borderWidth: 1,
    borderColor: vyteColors.borderSubtle,
    padding: vyteSpacing.sm,
    marginBottom: vyteSpacing.sm,
  },
  nearbyName: {
    fontSize: vyteTypography.body,
    color: vyteColors.textPrimary,
    fontWeight: "600",
    marginBottom: 2,
  },
  nearbyLocation: {
    fontSize: vyteTypography.label,
    color: vyteColors.textSecondary,
    marginBottom: vyteSpacing.xs,
  },
  nearbyIntent: {
    fontSize: vyteTypography.label,
    color: vyteColors.accent,
  },
  vibeCard: {
    marginTop: vyteSpacing.sm,
    backgroundColor: vyteColors.surfaceMuted,
    borderRadius: vyteRadii.sm,
    borderWidth: 1,
    borderColor: vyteColors.borderStrong,
    padding: vyteSpacing.sm,
  },
  vibeHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: vyteSpacing.sm,
  },
  vibeTitle: {
    fontSize: vyteTypography.body,
    color: vyteColors.textPrimary,
    fontWeight: "600",
  },
  vibeSubtitle: {
    fontSize: vyteTypography.label,
    color: vyteColors.textSecondary,
    marginTop: 2,
  },
  leaveButton: {
    paddingHorizontal: vyteSpacing.sm,
    paddingVertical: vyteSpacing.xs,
    borderRadius: vyteRadii.sm,
    borderWidth: 1,
    borderColor: vyteColors.accent,
    backgroundColor: vyteColors.accent,
  },
  leaveButtonLabel: {
    fontSize: vyteTypography.label,
    color: vyteColors.textPrimary,
    fontWeight: "600",
  },
  vibeMembersBox: {
    borderRadius: vyteRadii.sm,
    borderWidth: 1,
    borderColor: vyteColors.borderSubtle,
    backgroundColor: vyteColors.surface,
    padding: vyteSpacing.sm,
    maxHeight: 160,
  },
  vibeMembersList: {
    maxHeight: 160,
  },
  vibeMemberRow: {
    marginBottom: vyteSpacing.xs,
  },
  vibeMemberName: {
    fontSize: vyteTypography.body,
    color: vyteColors.textPrimary,
    fontWeight: "500",
  },
  vibeMemberMeta: {
    fontSize: vyteTypography.caption,
    color: vyteColors.textSecondary,
  },
  entitlementsBox: {
    marginTop: vyteSpacing.xs,
    borderRadius: vyteRadii.sm,
    borderWidth: 1,
    borderColor: vyteColors.borderSubtle,
    backgroundColor: vyteColors.surfaceMuted,
    padding: vyteSpacing.sm,
    maxHeight: 160,
  },
  entitlementsText: {
    fontSize: vyteTypography.caption,
    color: vyteColors.textSecondary,
    fontFamily: "monospace",
  },
});
