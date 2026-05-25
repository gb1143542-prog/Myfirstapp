import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useColors } from "@/hooks/useColors";

interface Props {
  active: boolean;
  onToggle: (v: boolean) => void;
  enabledCount: number;
}

export default function ServiceStatusCard({
  active,
  onToggle,
  enabledCount,
}: Props) {
  const colors = useColors();
  const glowAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (active) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1800,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 1800,
            useNativeDriver: true,
          }),
        ]),
      ).start();
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.08,
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1200,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    } else {
      glowAnim.stopAnimation();
      pulseAnim.stopAnimation();
      glowAnim.setValue(0);
      pulseAnim.setValue(1);
    }
  }, [active, glowAnim, pulseAnim]);

  const handleToggle = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onToggle(!active);
  };

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.9],
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.topRow}>
        <View>
          <Text style={[styles.label, { color: colors.mutedForeground }]}>
            OVERLAY SERVICE
          </Text>
          <Text
            style={[
              styles.status,
              { color: active ? colors.success : colors.mutedForeground },
            ]}
          >
            {active ? "Active" : "Inactive"}
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleToggle}
          activeOpacity={0.8}
          style={[
            styles.toggle,
            {
              backgroundColor: active ? colors.primary : colors.cardElevated,
              borderColor: active ? colors.primary : colors.border,
            },
          ]}
        >
          <View
            style={[
              styles.toggleKnob,
              {
                backgroundColor: active ? colors.primaryForeground : colors.mutedForeground,
                transform: [{ translateX: active ? 22 : 2 }],
              },
            ]}
          />
        </TouchableOpacity>
      </View>

      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Animated.View
            style={[
              styles.dot,
              {
                backgroundColor: active ? colors.success : colors.inactive,
                opacity: active ? glowOpacity : 1,
              },
            ]}
          />
          <Text style={[styles.statText, { color: colors.mutedForeground }]}>
            {active ? "Running" : "Stopped"}
          </Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
        <View style={styles.stat}>
          <Feather name="layers" size={13} color={colors.primary} />
          <Text style={[styles.statText, { color: colors.mutedForeground }]}>
            {enabledCount} app{enabledCount !== 1 ? "s" : ""} monitored
          </Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
        <View style={styles.stat}>
          <Feather name="shield" size={13} color={colors.primary} />
          <Text style={[styles.statText, { color: colors.mutedForeground }]}>
            Foreground
          </Text>
        </View>
      </View>

      {active && (
        <Animated.View
          style={[
            styles.activeBanner,
            {
              backgroundColor: colors.successGlow,
              opacity: glowOpacity,
            },
          ]}
        >
          <Text style={[styles.activeBannerText, { color: colors.success }]}>
            Overlay service is running in the background
          </Text>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    marginBottom: 16,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  status: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
  },
  toggle: {
    width: 52,
    height: 30,
    borderRadius: 15,
    borderWidth: 1.5,
    justifyContent: "center",
  },
  toggleKnob: {
    width: 22,
    height: 22,
    borderRadius: 11,
  },
  divider: {
    height: 1,
    marginVertical: 16,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  stat: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    justifyContent: "center",
  },
  statDivider: {
    width: 1,
    height: 14,
  },
  statText: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  activeBanner: {
    marginTop: 14,
    borderRadius: 8,
    padding: 10,
    alignItems: "center",
  },
  activeBannerText: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
});
