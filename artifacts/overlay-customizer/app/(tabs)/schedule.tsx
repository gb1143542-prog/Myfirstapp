import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
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

const INTERVALS = [
  { hours: 1, label: "Every hour" },
  { hours: 3, label: "Every 3 hours" },
  { hours: 6, label: "Every 6 hours" },
  { hours: 12, label: "Every 12 hours" },
  { hours: 24, label: "Every day" },
  { hours: 168, label: "Every week" },
];

export default function ScheduleScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { schedulerConfig, updateSchedulerConfig } = useOverlay();

  const toggle = () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    updateSchedulerConfig({ enabled: !schedulerConfig.enabled });
  };

  const setInterval = (hours: number) => {
    if (Platform.OS !== "web") Haptics.selectionAsync();
    updateSchedulerConfig({ intervalHours: hours });
  };

  const setMode = (mode: "timer" | "album") => {
    if (Platform.OS !== "web") Haptics.selectionAsync();
    updateSchedulerConfig({ cycleMode: mode });
  };

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
        title="Auto-Change Scheduler"
        subtitle="Automatically rotate background photos"
      />

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.row}>
          <View style={styles.rowLeft}>
            <View style={[styles.iconWrap, { backgroundColor: colors.primaryGlow }]}>
              <Feather name="refresh-cw" size={18} color={colors.primary} />
            </View>
            <View>
              <Text style={[styles.rowTitle, { color: colors.text }]}>Auto-Change</Text>
              <Text style={[styles.rowSub, { color: colors.mutedForeground }]}>
                {schedulerConfig.enabled ? "Enabled" : "Disabled"}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={[
              styles.toggle,
              {
                backgroundColor: schedulerConfig.enabled ? colors.primary : colors.cardElevated,
                borderColor: schedulerConfig.enabled ? colors.primary : colors.border,
              },
            ]}
            onPress={toggle}
            activeOpacity={0.8}
          >
            <View
              style={[
                styles.knob,
                {
                  backgroundColor: schedulerConfig.enabled
                    ? colors.primaryForeground
                    : colors.mutedForeground,
                  transform: [{ translateX: schedulerConfig.enabled ? 22 : 2 }],
                },
              ]}
            />
          </TouchableOpacity>
        </View>
      </View>

      {schedulerConfig.enabled && (
        <>
          <View style={styles.section}>
            <SectionHeader title="Cycle Mode" />
            <View style={[styles.modeGrid, { gap: 10 }]}>
              {(["timer", "album"] as const).map((mode) => (
                <TouchableOpacity
                  key={mode}
                  style={[
                    styles.modeCard,
                    {
                      backgroundColor: schedulerConfig.cycleMode === mode
                        ? colors.primaryGlow
                        : colors.card,
                      borderColor: schedulerConfig.cycleMode === mode
                        ? colors.primary
                        : colors.border,
                      borderWidth: schedulerConfig.cycleMode === mode ? 1.5 : 1,
                    },
                  ]}
                  onPress={() => setMode(mode)}
                  activeOpacity={0.8}
                >
                  <Feather
                    name={mode === "timer" ? "clock" : "grid"}
                    size={22}
                    color={
                      schedulerConfig.cycleMode === mode
                        ? colors.primary
                        : colors.mutedForeground
                    }
                  />
                  <Text
                    style={[
                      styles.modeTitle,
                      {
                        color:
                          schedulerConfig.cycleMode === mode
                            ? colors.primary
                            : colors.text,
                      },
                    ]}
                  >
                    {mode === "timer" ? "Timer" : "Favorites Album"}
                  </Text>
                  <Text
                    style={[styles.modeSub, { color: colors.mutedForeground }]}
                  >
                    {mode === "timer"
                      ? "Change after a set interval"
                      : "Cycle through saved favorites"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {schedulerConfig.cycleMode === "timer" && (
            <View style={styles.section}>
              <SectionHeader title="Change Interval" />
              {INTERVALS.map((iv) => (
                <TouchableOpacity
                  key={iv.hours}
                  style={[
                    styles.intervalRow,
                    {
                      backgroundColor:
                        schedulerConfig.intervalHours === iv.hours
                          ? colors.primaryGlow
                          : colors.card,
                      borderColor:
                        schedulerConfig.intervalHours === iv.hours
                          ? colors.primary
                          : colors.border,
                      borderWidth:
                        schedulerConfig.intervalHours === iv.hours ? 1.5 : 1,
                    },
                  ]}
                  onPress={() => setInterval(iv.hours)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.intervalLabel,
                      {
                        color:
                          schedulerConfig.intervalHours === iv.hours
                            ? colors.primary
                            : colors.text,
                      },
                    ]}
                  >
                    {iv.label}
                  </Text>
                  {schedulerConfig.intervalHours === iv.hours && (
                    <Feather name="check" size={16} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}

          {schedulerConfig.cycleMode === "album" && (
            <View style={[styles.albumCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Feather name="grid" size={28} color={colors.inactiveForeground} />
              <Text style={[styles.albumTitle, { color: colors.text }]}>
                Favorites Album
              </Text>
              <Text style={[styles.albumSub, { color: colors.mutedForeground }]}>
                On a real device, you would select images from your gallery to
                add to the favorites album for cycling.
              </Text>
              <TouchableOpacity
                style={[styles.albumBtn, { backgroundColor: colors.primary }]}
                activeOpacity={0.85}
              >
                <Feather name="plus" size={16} color={colors.primaryForeground} />
                <Text style={[styles.albumBtnText, { color: colors.primaryForeground }]}>
                  Add Photos
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      )}

      {!schedulerConfig.enabled && (
        <View style={[styles.disabledCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="moon" size={32} color={colors.inactiveForeground} />
          <Text style={[styles.disabledTitle, { color: colors.text }]}>
            Scheduler is off
          </Text>
          <Text style={[styles.disabledSub, { color: colors.mutedForeground }]}>
            Enable auto-change to automatically rotate background photos on a
            schedule or cycle through your favorites.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: 16 },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    marginBottom: 20,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  rowTitle: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  rowSub: {
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
  section: { marginBottom: 20 },
  modeGrid: {
    flexDirection: "row",
  },
  modeCard: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    gap: 8,
  },
  modeTitle: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    textAlign: "center",
  },
  modeSub: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 15,
  },
  intervalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 8,
  },
  intervalLabel: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  albumCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 24,
    alignItems: "center",
    gap: 10,
  },
  albumTitle: {
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
  },
  albumSub: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 19,
  },
  albumBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 6,
  },
  albumBtnText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  disabledCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 32,
    alignItems: "center",
    gap: 10,
    marginTop: 8,
  },
  disabledTitle: {
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
  },
  disabledSub: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 19,
  },
});
