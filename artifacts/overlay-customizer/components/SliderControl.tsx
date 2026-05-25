import React from "react";
import {
  StyleSheet,
  Text,
  View,
  PanResponder,
  Animated,
  Platform,
} from "react-native";
import { useColors } from "@/hooks/useColors";

interface Props {
  label: string;
  value: number;
  min: number;
  max: number;
  unit?: string;
  onChange: (v: number) => void;
  icon?: React.ReactNode;
}

export default function SliderControl({
  label,
  value,
  min,
  max,
  unit = "",
  onChange,
  icon,
}: Props) {
  const colors = useColors();
  const trackWidth = React.useRef(0);
  const currentValue = React.useRef(value);

  React.useEffect(() => {
    currentValue.current = value;
  }, [value]);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {},
    onPanResponderMove: (_, gs) => {
      if (trackWidth.current === 0) return;
      const pct = Math.max(0, Math.min(1, gs.moveX / trackWidth.current));
      const newVal = Math.round(min + pct * (max - min));
      if (newVal !== currentValue.current) {
        currentValue.current = newVal;
        onChange(newVal);
      }
    },
  });

  const fillPct = ((value - min) / (max - min)) * 100;

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <View style={styles.labelLeft}>
          {icon}
          <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
        </View>
        <View style={[styles.valuePill, { backgroundColor: colors.primaryGlow, borderColor: colors.primary }]}>
          <Text style={[styles.valueText, { color: colors.primary }]}>
            {value}{unit}
          </Text>
        </View>
      </View>

      <View
        style={[styles.track, { backgroundColor: colors.cardElevated }]}
        onLayout={(e) => {
          trackWidth.current = e.nativeEvent.layout.width;
        }}
        {...panResponder.panHandlers}
      >
        <View
          style={[
            styles.fill,
            {
              width: `${fillPct}%` as any,
              backgroundColor: colors.primary,
            },
          ]}
        />
        <View
          style={[
            styles.thumb,
            {
              left: `${fillPct}%` as any,
              backgroundColor: colors.primary,
              borderColor: colors.background,
              shadowColor: colors.primary,
              ...Platform.select({ ios: { shadowOpacity: 0.6, shadowRadius: 8, shadowOffset: { width: 0, height: 0 } } }),
            },
          ]}
        />
      </View>

      <View style={styles.rangeRow}>
        <Text style={[styles.rangeText, { color: colors.inactiveForeground }]}>{min}{unit}</Text>
        <Text style={[styles.rangeText, { color: colors.inactiveForeground }]}>{max}{unit}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  labelLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  label: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  valuePill: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
    borderWidth: 1,
  },
  valueText: {
    fontSize: 13,
    fontFamily: "Inter_700Bold",
  },
  track: {
    height: 6,
    borderRadius: 3,
    position: "relative",
    justifyContent: "center",
  },
  fill: {
    height: "100%",
    borderRadius: 3,
    position: "absolute",
    left: 0,
  },
  thumb: {
    position: "absolute",
    width: 20,
    height: 20,
    borderRadius: 10,
    marginLeft: -10,
    borderWidth: 2,
    elevation: 4,
  },
  rangeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },
  rangeText: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
});
