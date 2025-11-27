import React from "react";
import { View, StyleSheet } from "react-native";
import type { StyleProp, ViewStyle } from "react-native";
import { vyteColors, vyteRadii, vyteSpacing } from "../theme/vyteTheme";

interface VyteCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export const VyteCard: React.FC<VyteCardProps> = ({ children, style }) => {
  return <View style={[styles.card, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: vyteColors.surface,
    borderRadius: vyteRadii.sm,
    borderWidth: 1,
    borderColor: vyteColors.borderSubtle,
    padding: vyteSpacing.lg,
  },
});
