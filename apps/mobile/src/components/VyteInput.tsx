import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import type { StyleProp, ViewStyle, KeyboardTypeOptions } from "react-native";
import { vyteColors, vyteRadii, vyteSpacing, vyteTypography } from "../theme/vyteTheme";

interface VyteInputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  multiline?: boolean;
  keyboardType?: KeyboardTypeOptions;
  secureTextEntry?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const VyteInput: React.FC<VyteInputProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  multiline,
  keyboardType,
  secureTextEntry,
  style,
}) => {
  return (
    <View style={style}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        style={[styles.input, multiline && styles.multiline]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={vyteColors.textMuted}
        multiline={multiline}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  label: {
    fontSize: vyteTypography.label,
    color: vyteColors.textSecondary,
    marginBottom: vyteSpacing.xs,
    marginTop: vyteSpacing.sm,
  },
  input: {
    backgroundColor: vyteColors.inputBackground,
    borderRadius: vyteRadii.sm,
    borderWidth: 1,
    borderColor: vyteColors.borderSubtle,
    paddingHorizontal: vyteSpacing.sm,
    paddingVertical: vyteSpacing.xs,
    color: vyteColors.textPrimary,
    fontSize: vyteTypography.body,
  },
  multiline: {
    minHeight: 100,
    textAlignVertical: "top",
  },
});
