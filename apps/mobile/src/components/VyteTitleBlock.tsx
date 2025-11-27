import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { vyteColors, vyteSpacing, vyteTypography } from "../theme/vyteTheme";

interface VyteTitleBlockProps {
  title: string;
  subtitle?: string;
}

export const VyteTitleBlock: React.FC<VyteTitleBlockProps> = ({ title, subtitle }) => {
  return (
    <View style={styles.root}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    marginBottom: vyteSpacing.lg,
  },
  title: {
    fontSize: vyteTypography.title,
    color: vyteColors.textPrimary,
    fontWeight: "700",
    marginBottom: vyteSpacing.xs,
  },
  subtitle: {
    fontSize: vyteTypography.subtitle,
    color: vyteColors.textSecondary,
  },
});
