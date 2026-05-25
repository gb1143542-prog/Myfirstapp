import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React from "react";
import {
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useColors } from "@/hooks/useColors";
import type { AppConfig } from "@/context/OverlayContext";

interface Props {
  config: AppConfig;
  onToggle: (enabled: boolean) => void;
}

export default function AppConfigCard({ config, onToggle }: Props) {
  const colors = useColors();
  const router = useRouter();

  const handlePress = () => {
    if (Platform.OS !== "web") Haptics.selectionAsync();
    router.push(`/app-config/${config.packageName}`);
  };

  const handleToggle = () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onToggle(!config.enabled);
  };

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: config.enabled ? colors.primary : colors.border,
          borderWidth: config.enabled ? 1.5 : 1,
        },
      ]}
      onPress={handlePress}
      activeOpacity={0.75}
    >
      <View style={styles.previewArea}>
        {config.imageUri ? (
          <Image
            source={{ uri: config.imageUri }}
            style={styles.previewImage}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.previewPlaceholder, { backgroundColor: colors.cardElevated }]}>
            <Feather name="image" size={22} color={colors.inactiveForeground} />
          </View>
        )}

        {config.enabled && (
          <View style={[styles.activePill, { backgroundColor: colors.primaryGlow, borderColor: colors.primary }]}>
            <View style={[styles.activeDot, { backgroundColor: colors.primary }]} />
          </View>
        )}
      </View>

      <View style={styles.info}>
        <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
          {config.displayName}
        </Text>
        <Text style={[styles.sub, { color: colors.mutedForeground }]} numberOfLines={1}>
          {config.imageUri
            ? `${Math.round(config.opacity * 100)}% opacity · ${config.blur}px blur`
            : "No background set"}
        </Text>
      </View>

      <TouchableOpacity
        style={[
          styles.toggle,
          {
            backgroundColor: config.enabled ? colors.primary : colors.cardElevated,
            borderColor: config.enabled ? colors.primary : colors.border,
          },
        ]}
        onPress={handleToggle}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <View
          style={[
            styles.knob,
            {
              backgroundColor: config.enabled ? colors.primaryForeground : colors.mutedForeground,
              transform: [{ translateX: config.enabled ? 16 : 2 }],
            },
          ]}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    gap: 12,
  },
  previewArea: {
    width: 52,
    height: 52,
    borderRadius: 10,
    overflow: "hidden",
    position: "relative",
  },
  previewImage: {
    width: "100%",
    height: "100%",
  },
  previewPlaceholder: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  activePill: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  activeDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  info: {
    flex: 1,
    gap: 3,
  },
  name: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  sub: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  toggle: {
    width: 40,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    justifyContent: "center",
  },
  knob: {
    width: 18,
    height: 18,
    borderRadius: 9,
  },
});
