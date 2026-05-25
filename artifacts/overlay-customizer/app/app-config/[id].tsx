import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ImagePreviewBox from "@/components/ImagePreviewBox";
import SliderControl from "@/components/SliderControl";
import SectionHeader from "@/components/SectionHeader";
import { useOverlay } from "@/context/OverlayContext";
import { useColors } from "@/hooks/useColors";

export default function AppConfigScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { appConfigs, updateAppConfig } = useOverlay();

  const config = appConfigs.find((a) => a.packageName === id);

  const [localOpacity, setLocalOpacity] = useState(
    config ? Math.round(config.opacity * 100) : 35,
  );
  const [localBlur, setLocalBlur] = useState(config ? config.blur : 10);

  if (!config) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <Text style={[styles.notFound, { color: colors.text }]}>App not found</Text>
      </View>
    );
  }

  const handlePickImage = async () => {
    if (Platform.OS === "web") {
      Alert.alert(
        "Web Preview",
        "On a real Android device, this opens your photo gallery. Simulating a selection.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Simulate",
            onPress: () => {
              updateAppConfig(config.packageName, {
                imageUri: `https://picsum.photos/seed/${config.packageName}/800/600`,
              });
            },
          },
        ],
      );
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Storage permission is needed to pick a photo.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      updateAppConfig(config.packageName, {
        imageUri: result.assets[0].uri,
      });
    }
  };

  const handleRemoveImage = () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    updateAppConfig(config.packageName, { imageUri: null });
  };

  const handleSave = () => {
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    updateAppConfig(config.packageName, {
      opacity: localOpacity / 100,
      blur: localBlur,
    });
    router.back();
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
            paddingTop: insets.top + (Platform.OS === "web" ? 67 : 12),
          },
        ]}
      >
        <TouchableOpacity
          style={[styles.backBtn, { backgroundColor: colors.card }]}
          onPress={() => router.back()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Feather name="arrow-left" size={18} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {config.displayName}
        </Text>
        <View style={[styles.enableBadge, {
          backgroundColor: config.enabled ? colors.successGlow : colors.card,
          borderColor: config.enabled ? colors.success : colors.border,
        }]}>
          <Text style={[styles.enableText, { color: config.enabled ? colors.success : colors.mutedForeground }]}>
            {config.enabled ? "Active" : "Off"}
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 + 90 : 100),
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <SectionHeader title="Background Photo" />
        <ImagePreviewBox
          imageUri={config.imageUri}
          onPick={handlePickImage}
          opacity={localOpacity / 100}
          blur={localBlur}
        />

        {config.imageUri && (
          <TouchableOpacity
            style={[styles.removeBtn, { borderColor: colors.destructive }]}
            onPress={handleRemoveImage}
            activeOpacity={0.8}
          >
            <Feather name="trash-2" size={14} color={colors.destructive} />
            <Text style={[styles.removeBtnText, { color: colors.destructive }]}>
              Remove photo
            </Text>
          </TouchableOpacity>
        )}

        <View style={[styles.sliderCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <SectionHeader title="Overlay Settings" />
          <SliderControl
            label="Opacity"
            value={localOpacity}
            min={0}
            max={100}
            unit="%"
            onChange={setLocalOpacity}
            icon={<Feather name="eye" size={14} color={colors.mutedForeground} />}
          />
          <SliderControl
            label="Blur"
            value={localBlur}
            min={0}
            max={40}
            unit="px"
            onChange={setLocalBlur}
            icon={<Feather name="wind" size={14} color={colors.mutedForeground} />}
          />
        </View>

        <View style={[styles.previewHint, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="info" size={14} color={colors.primary} />
          <Text style={[styles.previewHintText, { color: colors.mutedForeground }]}>
            Higher opacity dims the photo more. Blur softens it so text remains readable. Try 30-40% opacity with 10-15px blur for best results.
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
        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: colors.primary }]}
          onPress={handleSave}
          activeOpacity={0.85}
        >
          <Feather name="check" size={18} color={colors.primaryForeground} />
          <Text style={[styles.saveBtnText, { color: colors.primaryForeground }]}>
            Save Settings
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  notFound: { padding: 24, fontSize: 16, fontFamily: "Inter_500Medium" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    gap: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontFamily: "Inter_700Bold",
  },
  enableBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
  },
  enableText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  content: { padding: 16 },
  removeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 20,
    marginTop: -10,
  },
  removeBtnText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  sliderCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,
  },
  previewHint: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
  },
  previewHintText: {
    flex: 1,
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    lineHeight: 18,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  saveBtn: {
    height: 54,
    borderRadius: 27,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  saveBtnText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
});
