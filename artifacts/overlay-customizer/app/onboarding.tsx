import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import PermissionItem from "@/components/PermissionItem";
import { useOverlay } from "@/context/OverlayContext";
import { useColors } from "@/hooks/useColors";

export default function OnboardingScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { permissions, setPermissionGranted, completeOnboarding, allPermissionsGranted } =
    useOverlay();

  const handleGrantOverlay = () => {
    if (Platform.OS !== "web") Haptics.selectionAsync();
    setPermissionGranted("overlay", true);
  };

  const handleGrantAccessibility = () => {
    if (Platform.OS !== "web") Haptics.selectionAsync();
    setPermissionGranted("accessibility", true);
  };

  const handleGrantStorage = () => {
    if (Platform.OS !== "web") Haptics.selectionAsync();
    setPermissionGranted("storage", true);
  };

  const handleContinue = () => {
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    completeOnboarding();
    router.replace("/(tabs)");
  };

  const grantedCount = Object.values(permissions).filter(Boolean).length;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + (Platform.OS === "web" ? 67 : 24),
            paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 100),
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.logoBadge, { backgroundColor: colors.primaryGlow, borderColor: colors.primary }]}>
          <Feather name="layers" size={32} color={colors.primary} />
        </View>

        <Text style={[styles.headline, { color: colors.text }]}>
          Setup Required
        </Text>
        <Text style={[styles.sub, { color: colors.mutedForeground }]}>
          Overlay Customizer needs a few permissions to draw backgrounds behind
          your apps. These are used only for the overlay feature.
        </Text>

        <View style={[styles.progressBar, { backgroundColor: colors.cardElevated }]}>
          <View
            style={[
              styles.progressFill,
              {
                backgroundColor: colors.primary,
                width: `${(grantedCount / 3) * 100}%` as any,
              },
            ]}
          />
        </View>
        <Text style={[styles.progressLabel, { color: colors.mutedForeground }]}>
          {grantedCount} of 3 permissions granted
        </Text>

        <View style={styles.list}>
          <PermissionItem
            icon="monitor"
            title="Draw Over Apps"
            description="Required to display your background image on top of WhatsApp, Messenger, and other apps."
            granted={permissions.overlay}
            onPress={handleGrantOverlay}
          />
          <PermissionItem
            icon="eye"
            title="Accessibility Service"
            description="Detects when a target app enters the foreground so the overlay can activate automatically."
            granted={permissions.accessibility}
            onPress={handleGrantAccessibility}
          />
          <PermissionItem
            icon="image"
            title="Photos & Storage"
            description="Lets you choose a background image from your personal photo gallery."
            granted={permissions.storage}
            onPress={handleGrantStorage}
          />
        </View>

        <View style={[styles.noticeBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="lock" size={14} color={colors.mutedForeground} />
          <Text style={[styles.noticeText, { color: colors.mutedForeground }]}>
            Your images are stored locally. Nothing is uploaded to any server.
          </Text>
        </View>
      </ScrollView>

      <View
        style={[
          styles.footer,
          {
            backgroundColor: colors.background,
            borderTopColor: colors.border,
            paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 16),
          },
        ]}
      >
        {allPermissionsGranted ? (
          <TouchableOpacity
            style={[styles.btn, { backgroundColor: colors.primary }]}
            onPress={handleContinue}
            activeOpacity={0.85}
          >
            <Text style={[styles.btnText, { color: colors.primaryForeground }]}>
              Get Started
            </Text>
            <Feather name="arrow-right" size={18} color={colors.primaryForeground} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.btn, { backgroundColor: colors.cardElevated }]}
            onPress={handleContinue}
            activeOpacity={0.85}
          >
            <Text style={[styles.btnText, { color: colors.mutedForeground }]}>
              Skip for now
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: {
    paddingHorizontal: 20,
    alignItems: "center",
  },
  logoBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  headline: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    textAlign: "center",
    marginBottom: 12,
  },
  sub: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 28,
    paddingHorizontal: 12,
  },
  progressBar: {
    width: "100%",
    height: 5,
    borderRadius: 3,
    marginBottom: 8,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  progressLabel: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    marginBottom: 24,
  },
  list: {
    width: "100%",
    marginBottom: 16,
  },
  noticeBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    borderRadius: 12,
    padding: 14,
    width: "100%",
    borderWidth: 1,
  },
  noticeText: {
    flex: 1,
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    lineHeight: 17,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  btn: {
    height: 54,
    borderRadius: 27,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  btnText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
});
