import React from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import type { ReactNode } from "react";
import { vyteColors, vyteSpacing } from "../theme/vyteTheme";

interface VyteScreenContainerProps {
  children: ReactNode;
}

export const VyteScreenContainer: React.FC<VyteScreenContainerProps> = ({ children }) => {
  return <SafeAreaView style={styles.container}>{children}</SafeAreaView>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: vyteColors.background,
    paddingHorizontal: vyteSpacing.lg,
    paddingVertical: vyteSpacing.lg,
  },
});
