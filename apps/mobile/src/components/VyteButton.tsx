import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import type { StyleProp, ViewStyle } from "react-native";
import { vyteColors, vyteRadii, vyteSpacing, vyteTypography } from "../theme/vyteTheme";

interface VyteButtonProps {
  label: string;
  onPress: () => void;
  variant?: "primary" | "ghost";
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const VyteButton: React.FC<VyteButtonProps> = ({
  label,
  onPress,
  variant = "primary",
  disabled,
  style,
}) => {
  const isPrimary = variant === "primary";

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.base,
        isPrimary ? styles.primary : styles.ghost,
        disabled && styles.disabled,
        style,
      ]}
    >
      <Text style={[styles.label, isPrimary ? styles.primaryLabel : styles.ghostLabel]}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    height: 44,
    borderRadius: vyteRadii.sm,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: vyteSpacing.md,
  },
  primary: {
    backgroundColor: vyteColors.accent,
    borderColor: vyteColors.accent,
  },
  ghost: {
    backgroundColor: "transparent",
    borderColor: vyteColors.borderSubtle,
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    fontSize: vyteTypography.body,
    fontWeight: "600",
  },
  primaryLabel: {
    color: vyteColors.textPrimary,
  },
  ghostLabel: {
    color: vyteColors.textSecondary,
  },
});
