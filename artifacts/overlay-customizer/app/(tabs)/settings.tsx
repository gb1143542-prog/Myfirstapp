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
import SectionHeader from "@/components/SectionHeader";
import { useOverlay } from "@/context/OverlayContext";
import { useColors } from "@/hooks/useColors";

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { permissions, setPermissionGranted, serviceActive, setServiceActive } =
    useOverlay();

  const permList = [
    {
      key: "overlay" as const,
      icon: "monitor" as const,
      label: "Draw Over Apps",
      desc: "Required for overlay display",
    },
    {
      key: "accessibility" as const,
      icon: "eye" as const,
      label: "Accessibility Service",
      desc: "Monitors foreground app changes",
    },
    {
      key: "storage" as const,
      icon: "image" as const,
      label: "Photo Access",
      desc: "Read images from gallery",
    },
  ];

  const settingsRows = [
    {
      icon: "bell" as const,
      label: "Persistent Notification",
      desc: "Show status in notification tray",
      value: true,
    },
    {
      icon: "zap" as const,
      label: "Quick Settings Tile",
      desc: "Add toggle to quick settings panel",
      value: true,
    },
    {
      icon: "battery" as const,
      label: "Battery Optimization",
      desc: "Exempt from battery saver",
      value: false,
    },
  ];

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: Platform.OS === "web" ? 67 + 16 : 16,
          paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 + 80 : 100),
        },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.section}>
        <SectionHeader title="Service" />
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.settingRow}>
            <View style={[styles.iconWrap, { backgroundColor: colors.primaryGlow }]}>
              <Feather name="power" size={18} color={colors.primary} />
            </View>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>
                Overlay Service
              </Text>
              <Text style={[styles.settingDesc, { color: colors.mutedForeground }]}>
                {serviceActive ? "Running in background" : "Service stopped"}
              </Text>
            </View>
            <TouchableOpacity
              style={[
                styles.toggle,
                {
                  backgroundColor: serviceActive ? colors.primary : colors.cardElevated,
                  borderColor: serviceActive ? colors.primary : colors.border,
                },
              ]}
              onPress={() => {
                if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                setServiceActive(!serviceActive);
              }}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.knob,
                  {
                    backgroundColor: serviceActive
                      ? colors.primaryForeground
                      : colors.mutedForeground,
                    transform: [{ translateX: serviceActive ? 22 : 2 }],
                  },
                ]}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <SectionHeader title="Permissions" />
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {permList.map((p, i) => (
            <View key={p.key}>
              <View style={styles.settingRow}>
                <View
                  style={[
                    styles.iconWrap,
                    {
                      backgroundColor: permissions[p.key]
                        ? colors.successGlow
                        : colors.primaryGlow,
                    },
                  ]}
                >
                  <Feather
                    name={p.icon}
                    size={18}
                    color={permissions[p.key] ? colors.success : colors.primary}
                  />
                </View>
                <View style={styles.settingInfo}>
                  <Text style={[styles.settingLabel, { color: colors.text }]}>
                    {p.label}
                  </Text>
                  <Text style={[styles.settingDesc, { color: colors.mutedForeground }]}>
                    {p.desc}
                  </Text>
                </View>
                {permissions[p.key] ? (
                  <View
                    style={[
                      styles.checkBadge,
                      { backgroundColor: colors.successGlow, borderColor: colors.success },
                    ]}
                  >
                    <Feather name="check" size={12} color={colors.success} />
                  </View>
                ) : (
                  <TouchableOpacity
                    style={[styles.grantBtn, { backgroundColor: colors.primary }]}
                    onPress={() => {
                      if (Platform.OS !== "web") Haptics.selectionAsync();
                      setPermissionGranted(p.key, true);
                    }}
                  >
                    <Text style={[styles.grantText, { color: colors.primaryForeground }]}>
                      Grant
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
              {i < permList.length - 1 && (
                <View style={[styles.divider, { backgroundColor: colors.border }]} />
              )}
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <SectionHeader title="Android System" />
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {settingsRows.map((s, i) => (
            <View key={s.label}>
              <View style={styles.settingRow}>
                <View style={[styles.iconWrap, { backgroundColor: colors.primaryGlow }]}>
                  <Feather name={s.icon} size={18} color={colors.primary} />
                </View>
                <View style={styles.settingInfo}>
                  <Text style={[styles.settingLabel, { color: colors.text }]}>
                    {s.label}
                  </Text>
                  <Text style={[styles.settingDesc, { color: colors.mutedForeground }]}>
                    {s.desc}
                  </Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor: s.value
                        ? colors.successGlow
                        : colors.card,
                      borderColor: s.value ? colors.success : colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      { color: s.value ? colors.success : colors.mutedForeground },
                    ]}
                  >
                    {s.value ? "On" : "Off"}
                  </Text>
                </View>
              </View>
              {i < settingsRows.length - 1 && (
                <View style={[styles.divider, { backgroundColor: colors.border }]} />
              )}
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <SectionHeader title="App" />
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => router.push("/onboarding")}
            activeOpacity={0.8}
          >
            <View style={[styles.iconWrap, { backgroundColor: colors.primaryGlow }]}>
              <Feather name="help-circle" size={18} color={colors.primary} />
            </View>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>
                Setup Guide
              </Text>
              <Text style={[styles.settingDesc, { color: colors.mutedForeground }]}>
                Re-run the permissions onboarding
              </Text>
            </View>
            <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
          </TouchableOpacity>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.settingRow}>
            <View style={[styles.iconWrap, { backgroundColor: colors.primaryGlow }]}>
              <Feather name="info" size={18} color={colors.primary} />
            </View>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>
                Version
              </Text>
              <Text style={[styles.settingDesc, { color: colors.mutedForeground }]}>
                Overlay Customizer v1.0.0
              </Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: 16 },
  section: { marginBottom: 20 },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 12,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  settingInfo: { flex: 1 },
  settingLabel: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  settingDesc: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  toggle: {
    width: 52,
    height: 30,
    borderRadius: 15,
    borderWidth: 1.5,
    justifyContent: "center",
  },
  knob: {
    width: 22,
    height: 22,
    borderRadius: 11,
  },
  divider: {
    height: 1,
    marginHorizontal: 14,
  },
  checkBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  grantBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  grantText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
});
