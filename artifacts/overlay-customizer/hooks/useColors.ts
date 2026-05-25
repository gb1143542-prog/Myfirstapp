import colors from "@/constants/colors";

/**
 * Returns the dark design tokens for Overlay Customizer.
 * This app is always dark — it's a system utility app with a premium dark UI.
 */
export function useColors() {
  return { ...colors.dark, radius: colors.radius };
}
