import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
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

interface Props {
  imageUri: string | null;
  onPick: () => void;
  opacity: number;
  blur: number;
  label?: string;
}

export default function ImagePreviewBox({
  imageUri,
  onPick,
  opacity,
  blur,
  label = "Background Preview",
}: Props) {
  const colors = useColors();

  const handlePress = () => {
    if (Platform.OS !== "web") Haptics.selectionAsync();
    onPick();
  };

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity
        style={[
          styles.box,
          {
            backgroundColor: colors.cardElevated,
            borderColor: imageUri ? colors.primary : colors.border,
            borderStyle: imageUri ? "solid" : "dashed",
          },
        ]}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        {imageUri ? (
          <>
            <Image
              source={{ uri: imageUri }}
              style={styles.image}
              resizeMode="cover"
            />
            <View
              style={[
                styles.overlayPreview,
                { backgroundColor: `rgba(0,0,0,${opacity})` },
              ]}
            />
            <View style={styles.editBadge}>
              <View
                style={[
                  styles.editBadgeInner,
                  { backgroundColor: colors.primary },
                ]}
              >
                <Feather name="edit-2" size={12} color={colors.primaryForeground} />
              </View>
            </View>
            <View style={styles.infoOverlay}>
              <View
                style={[
                  styles.infoPill,
                  { backgroundColor: "rgba(13,15,20,0.75)" },
                ]}
              >
                <Feather name="eye" size={11} color={colors.accent} />
                <Text style={[styles.infoText, { color: colors.text }]}>
                  {Math.round(opacity * 100)}%
                </Text>
                <View
                  style={[
                    styles.infoDivider,
                    { backgroundColor: colors.border },
                  ]}
                />
                <Feather name="wind" size={11} color={colors.accent} />
                <Text style={[styles.infoText, { color: colors.text }]}>
                  {blur}px
                </Text>
              </View>
            </View>
          </>
        ) : (
          <View style={styles.placeholder}>
            <View
              style={[
                styles.iconCircle,
                { backgroundColor: colors.primaryGlow, borderColor: colors.primary },
              ]}
            >
              <Feather name="image" size={28} color={colors.primary} />
            </View>
            <Text style={[styles.placeholderTitle, { color: colors.text }]}>
              Tap to select photo
            </Text>
            <Text
              style={[styles.placeholderSub, { color: colors.mutedForeground }]}
            >
              Choose from your gallery
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 20,
  },
  box: {
    height: 200,
    borderRadius: 16,
    borderWidth: 1.5,
    overflow: "hidden",
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  overlayPreview: {
    ...StyleSheet.absoluteFillObject,
  },
  editBadge: {
    position: "absolute",
    top: 12,
    right: 12,
  },
  editBadgeInner: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  infoOverlay: {
    position: "absolute",
    bottom: 12,
    left: 12,
  },
  infoPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  infoText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  infoDivider: {
    width: 1,
    height: 12,
  },
  placeholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  placeholderTitle: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  placeholderSub: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
});
