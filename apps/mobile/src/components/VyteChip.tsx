import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import type { StyleProp, ViewStyle } from "react-native";
import { vyteColors, vyteRadii, vyteSpacing, vyteTypography } from "../theme/vyteTheme";

interface VyteChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export const VyteChip: React.FC<VyteChipProps> = ({ label, selected, onPress, style }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.base,
        selected ? styles.selected : null,
        style,
      ]}
    >
      <Text style={[styles.label, selected ? styles.labelSelected : null]}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: vyteRadii.sm,
    borderWidth: 1,
    borderColor: vyteColors.borderSubtle,
    backgroundColor: vyteColors.chipBackground,
    paddingHorizontal: vyteSpacing.sm,
    paddingVertical: vyteSpacing.xs,
  },
  selected: {
    backgroundColor: vyteColors.chipSelectedBackground,
    borderColor: vyteColors.chipSelectedBackground,
  },
  label: {
    fontSize: vyteTypography.label,
    color: vyteColors.textSecondary,
  },
  labelSelected: {
    color: vyteColors.textPrimary,
    fontWeight: "600",
  },
});
