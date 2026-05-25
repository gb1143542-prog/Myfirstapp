import { Feather } from "@expo/vector-icons";
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
import ServiceStatusCard from "@/components/ServiceStatusCard";
import SectionHeader from "@/components/SectionHeader";
import AppConfigCard from "@/components/AppConfigCard";
import { useOverlay } from "@/context/OverlayContext";
import { useColors } from "@/hooks/useColors";

export default function DashboardScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { serviceActive, setServiceActive, appConfigs, updateAppConfig, permissions, onboardingComplete } =
    useOverlay();

  const enabledApps = appConfigs.filter((a) => a.enabled);
  const configuredApps = appConfigs.filter((a) => a.imageUri !== null);
  const topApps = appConfigs.slice(0, 3);

  const handlePermissionsBanner = () => {
    router.push("/onboarding");
  };

  const missingPerms = !permissions.overlay || !permissions.accessibility || !permissions.storage;

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
      {missingPerms && (
        <TouchableOpacity
          style={[styles.permBanner, { backgroundColor: colors.card, borderColor: colors.warning }]}
          onPress={handlePermissionsBanner}
          activeOpacity={0.8}
        >
          <View style={[styles.permIcon, { backgroundColor: "rgba(245,158,11,0.15)" }]}>
            <Feather name="alert-triangle" size={16} color={colors.warning} />
          </View>
          <Text style={[styles.permText, { color: colors.text }]}>
            Permissions needed — tap to set up
          </Text>
          <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
        </TouchableOpacity>
      )}

      <ServiceStatusCard
        active={serviceActive}
        onToggle={setServiceActive}
        enabledCount={enabledApps.length}
      />

      <View style={[styles.statsGrid, { gap: 10 }]}>
        <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.statNum, { color: colors.primary }]}>
            {configuredApps.length}
          </Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
            Configured
          </Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.statNum, { color: colors.success }]}>
            {enabledApps.length}
          </Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
            Active
          </Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.statNum, { color: colors.accent }]}>
            {appConfigs.length}
          </Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
            Total Apps
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <SectionHeader
          title="Monitored Apps"
          subtitle="Top configured apps"
          action={
            <TouchableOpacity onPress={() => router.push("/(tabs)/apps")}>
              <Text style={[styles.seeAll, { color: colors.primary }]}>See all</Text>
            </TouchableOpacity>
          }
        />
        {topApps.map((cfg) => (
          <AppConfigCard
            key={cfg.packageName}
            config={cfg}
            onToggle={(enabled) => updateAppConfig(cfg.packageName, { enabled })}
          />
        ))}
      </View>

      <View style={[styles.quickActions, { gap: 10 }]}>
        <TouchableOpacity
          style={[styles.quickBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => router.push("/(tabs)/schedule")}
          activeOpacity={0.8}
        >
          <View style={[styles.quickIcon, { backgroundColor: colors.primaryGlow }]}>
            <Feather name="clock" size={18} color={colors.primary} />
          </View>
          <Text style={[styles.quickLabel, { color: colors.text }]}>Scheduler</Text>
          <Feather name="chevron-right" size={14} color={colors.mutedForeground} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.quickBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => router.push("/(tabs)/settings")}
          activeOpacity={0.8}
        >
          <View style={[styles.quickIcon, { backgroundColor: colors.primaryGlow }]}>
            <Feather name="settings" size={18} color={colors.primary} />
          </View>
          <Text style={[styles.quickLabel, { color: colors.text }]}>Settings</Text>
          <Feather name="chevron-right" size={14} color={colors.mutedForeground} />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: 16 },
  permBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    marginBottom: 14,
  },
  permIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  permText: {
    flex: 1,
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  statsGrid: {
    flexDirection: "row",
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    alignItems: "center",
  },
  statNum: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
  },
  statLabel: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    marginTop: 2,
  },
  section: { marginBottom: 20 },
  seeAll: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  quickActions: {
    flexDirection: "row",
    marginBottom: 20,
  },
  quickBtn: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  quickIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  quickLabel: {
    flex: 1,
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
});
