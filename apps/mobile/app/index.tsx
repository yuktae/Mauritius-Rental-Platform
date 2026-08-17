import { SafeAreaView, StyleSheet, Text, View } from "react-native";

import { BRAND_NAME } from "@boro/config";
import { ROLE_LABELS } from "@boro/types";
import { colors } from "@boro/ui";

export default function IndexScreen() {
  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.content}>
        <Text style={styles.kicker}>Initial mobile shell</Text>
        <Text style={styles.title}>{BRAND_NAME}</Text>
        <Text style={styles.copy}>
          Phase 1 will start with login, signup, OTP verification, mandatory
          profile setup, ID verification status, and role-based routing.
        </Text>
        <View style={styles.roles}>
          <Text style={styles.role}>{ROLE_LABELS.renter.en}</Text>
          <Text style={styles.role}>{ROLE_LABELS.owner.en}</Text>
          <Text style={styles.role}>{ROLE_LABELS.admin.en}</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.ivory
  },
  content: {
    flex: 1,
    justifyContent: "center",
    padding: 24
  },
  kicker: {
    color: colors.coral,
    fontSize: 13,
    fontWeight: "800",
    textTransform: "uppercase"
  },
  title: {
    color: colors.ink,
    fontSize: 48,
    fontWeight: "900",
    letterSpacing: 0,
    marginTop: 8
  },
  copy: {
    color: colors.muted,
    fontSize: 16,
    lineHeight: 24,
    marginTop: 16
  },
  roles: {
    flexDirection: "row",
    gap: 10,
    marginTop: 28
  },
  role: {
    backgroundColor: colors.white,
    borderColor: colors.line,
    borderRadius: 999,
    borderWidth: 1,
    color: colors.ink,
    fontSize: 13,
    fontWeight: "800",
    paddingHorizontal: 14,
    paddingVertical: 10
  }
});
