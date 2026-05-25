import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AppConfigCard from "@/components/AppConfigCard";
import SectionHeader from "@/components/SectionHeader";
import { useOverlay } from "@/context/OverlayContext";
import { useColors } from "@/hooks/useColors";

type Filter = "all" | "enabled" | "configured";

export default function AppsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { appConfigs, updateAppConfig } = useOverlay();
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = appConfigs.filter((a) => {
    if (filter === "enabled") return a.enabled;
    if (filter === "configured") return a.imageUri !== null;
    return true;
  });

  const tabs: { key: Filter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "enabled", label: "Active" },
    { key: "configured", label: "Configured" },
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
      <SectionHeader
        title="App Configurations"
        subtitle="Tap any app to set a background photo"
      />

      <View style={[styles.filterBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {tabs.map((t) => (
          <TouchableOpacity
            key={t.key}
            style={[
              styles.filterTab,
              filter === t.key && {
                backgroundColor: colors.primary,
              },
            ]}
            onPress={() => setFilter(t.key)}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.filterText,
                {
                  color: filter === t.key ? colors.primaryForeground : colors.mutedForeground,
                },
              ]}
            >
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {filtered.length === 0 ? (
        <View style={styles.empty}>
          <View style={[styles.emptyIcon, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="layers" size={28} color={colors.inactiveForeground} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>Nothing here</Text>
          <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>
            No apps match this filter
          </Text>
        </View>
      ) : (
        filtered.map((cfg) => (
          <AppConfigCard
            key={cfg.packageName}
            config={cfg}
            onToggle={(enabled) => updateAppConfig(cfg.packageName, { enabled })}
          />
        ))
      )}

      <View style={[styles.infoBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Feather name="info" size={14} color={colors.primary} />
        <Text style={[styles.infoText, { color: colors.mutedForeground }]}>
          On a real Android device, tap an app to select a background image and
          adjust opacity & blur. The overlay appears whenever that app is in the foreground.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: 16 },
  filterBar: {
    flexDirection: "row",
    borderRadius: 12,
    borderWidth: 1,
    padding: 4,
    marginBottom: 16,
    gap: 4,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 9,
    alignItems: "center",
  },
  filterText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  empty: {
    alignItems: "center",
    paddingVertical: 48,
    gap: 10,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
  },
  emptySub: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    marginTop: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    lineHeight: 18,
  },
});
