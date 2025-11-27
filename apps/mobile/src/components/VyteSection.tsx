import React from "react";
import { View, Text, StyleSheet } from "react-native";
import type { StyleProp, ViewStyle } from "react-native";
import { vyteColors, vyteSpacing, vyteTypography } from "../theme/vyteTheme";

interface VyteSectionProps {
  title?: string;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export const VyteSection: React.FC<VyteSectionProps> = ({ title, children, style }) => {
  return (
    <View style={[styles.section, style]}>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: vyteSpacing.lg,
  },
  title: {
    fontSize: vyteTypography.label,
    color: vyteColors.textSecondary,
    marginBottom: vyteSpacing.xs,
  },
});
