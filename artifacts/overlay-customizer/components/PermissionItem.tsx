import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useColors } from "@/hooks/useColors";

interface Props {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  description: string;
  granted: boolean;
  onPress: () => void;
  required?: boolean;
}

export default function PermissionItem({
  icon,
  title,
  description,
  granted,
  onPress,
  required = true,
}: Props) {
  const colors = useColors();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.card,
          borderColor: granted ? colors.success : colors.border,
          borderWidth: granted ? 1.5 : 1,
        },
      ]}
    >
      <View
        style={[
          styles.iconWrap,
          {
            backgroundColor: granted ? colors.successGlow : colors.primaryGlow,
            borderColor: granted ? colors.success : colors.primary,
          },
        ]}
      >
        <Feather
          name={icon}
          size={20}
          color={granted ? colors.success : colors.primary}
        />
      </View>

      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          {required && (
            <View
              style={[
                styles.badge,
                { backgroundColor: colors.primaryGlow, borderColor: colors.primary },
              ]}
            >
              <Text style={[styles.badgeText, { color: colors.primary }]}>
                Required
              </Text>
            </View>
          )}
        </View>
        <Text style={[styles.desc, { color: colors.mutedForeground }]}>
          {description}
        </Text>
      </View>

      {granted ? (
        <View
          style={[
            styles.checkCircle,
            { backgroundColor: colors.successGlow, borderColor: colors.success },
          ]}
        >
          <Feather name="check" size={14} color={colors.success} />
        </View>
      ) : (
        <TouchableOpacity
          style={[styles.grantBtn, { backgroundColor: colors.primary }]}
          onPress={onPress}
          activeOpacity={0.8}
        >
          <Text style={[styles.grantText, { color: colors.primaryForeground }]}>
            Grant
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 14,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 10,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
    gap: 3,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  badge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 20,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
  },
  desc: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    lineHeight: 17,
  },
  grantBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  grantText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  checkCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
});
