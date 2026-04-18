/**
 * LiquidGlass — authentic liquid glass surface for React Native.
 *
 * Inspired by the visual principles of the AndroidLiquidGlass / Backdrop library:
 *   • vibrancy  — high-intensity blur to boost saturation of what's behind
 *   • lens      — subtle outer glow halo simulating refractive bending
 *   • specular  — multi-edge highlight: strong top, medium sides, faint bottom
 *   • inner shadow — dark vignette around the inner perimeter
 *   • surface   — barely-there white tint for readability
 *   • tint wash — optional accent colour blended in Hue mode (faint overlay)
 */
import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

interface LiquidGlassProps {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Border-radius of the pill/card */
  radius?: number;
  /** Blur intensity — 70–100 for strong vibrancy */
  intensity?: number;
  /** Accent hue tint applied as a very faint colour wash */
  tint?: string;
  /** Show the outer lens-halo glow ring */
  lensHalo?: boolean;
  /** Override border colour */
  borderColor?: string;
  /** Outer glow colour for drop-shadow */
  glowColor?: string;
  /** Dark background for the inner shadow vignette */
  innerDark?: boolean;
  /** Disable the border entirely */
  noBorder?: boolean;
  /** Pressed state — shrinks + dims slightly */
  pressed?: boolean;
}

export function LiquidGlass({
  children,
  style,
  radius = 24,
  intensity = 85,
  tint,
  lensHalo = true,
  borderColor,
  glowColor = 'rgba(255,255,255,0.15)',
  innerDark = true,
  noBorder = false,
  pressed = false,
}: LiquidGlassProps) {
  const br = radius;
  const bc = borderColor ?? 'rgba(255,255,255,0.20)';

  return (
    <View
      style={[
        styles.wrapper,
        {
          borderRadius: br,
          shadowColor: glowColor,
          transform: pressed ? [{ scale: 0.975 }] : undefined,
          opacity: pressed ? 0.82 : 1,
        },
        style,
      ]}
    >
      {/* ── LENS HALO: outer refraction ring ── */}
      {lensHalo && (
        <View
          style={[
            StyleSheet.absoluteFill,
            styles.lensHalo,
            { borderRadius: br + 2, borderColor: 'rgba(255,255,255,0.12)' },
          ]}
          pointerEvents="none"
        />
      )}

      {/* ── VIBRANCY: high-intensity blur captures backdrop colour ── */}
      <BlurView
        intensity={intensity}
        tint="dark"
        style={[StyleSheet.absoluteFill, { borderRadius: br }]}
      />

      {/* ── SURFACE: barely-there white fill for readability ── */}
      <View
        style={[StyleSheet.absoluteFill, styles.surface, { borderRadius: br }]}
      />

      {/* ── TINT WASH: accent hue, very faint (like BlendMode.Hue) ── */}
      {tint ? (
        <LinearGradient
          colors={[tint + '1A', tint + '0A', 'transparent']}
          style={[StyleSheet.absoluteFill, { borderRadius: br }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          pointerEvents="none"
        />
      ) : null}

      {/* ── INNER SHADOW: dark vignette ring inside border ── */}
      {innerDark && (
        <View
          style={[
            StyleSheet.absoluteFill,
            styles.innerShadow,
            { borderRadius: br },
          ]}
          pointerEvents="none"
        />
      )}

      {/* ── SPECULAR TOP: strongest reflection at top edge ── */}
      <LinearGradient
        colors={[
          'rgba(255,255,255,0.55)',
          'rgba(255,255,255,0.18)',
          'rgba(255,255,255,0.00)',
        ]}
        style={[
          styles.specularTop,
          { borderTopLeftRadius: br, borderTopRightRadius: br },
        ]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        pointerEvents="none"
      />

      {/* ── SPECULAR LEFT: side reflection ── */}
      <LinearGradient
        colors={[
          'rgba(255,255,255,0.20)',
          'rgba(255,255,255,0.05)',
          'rgba(255,255,255,0.00)',
        ]}
        style={[
          styles.specularLeft,
          { borderTopLeftRadius: br, borderBottomLeftRadius: br },
        ]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        pointerEvents="none"
      />

      {/* ── SPECULAR RIGHT: side reflection (mirror) ── */}
      <LinearGradient
        colors={[
          'rgba(255,255,255,0.00)',
          'rgba(255,255,255,0.05)',
          'rgba(255,255,255,0.12)',
        ]}
        style={[
          styles.specularRight,
          { borderTopRightRadius: br, borderBottomRightRadius: br },
        ]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        pointerEvents="none"
      />

      {/* ── BORDER: 1px bright perimeter line ── */}
      {!noBorder && (
        <View
          style={[
            StyleSheet.absoluteFill,
            styles.border,
            { borderRadius: br, borderColor: bc },
          ]}
          pointerEvents="none"
        />
      )}

      {/* ── TOP HIGHLIGHT LINE: razor-bright 1px at very top ── */}
      <View
        style={[
          styles.topLine,
          {
            left: br * 0.35,
            right: br * 0.35,
            borderTopLeftRadius: br,
            borderTopRightRadius: br,
          },
        ]}
        pointerEvents="none"
      />

      {/* ── CONTENT ── */}
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    // Outer drop shadow — acts as the "lens glow"
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 1,
    shadowRadius: 28,
    elevation: 16,
    overflow: 'hidden',
  },
  lensHalo: {
    // Sits just outside the glass, creates refraction ring illusion
    position: 'absolute',
    top: -1,
    left: -1,
    right: -1,
    bottom: -1,
    borderWidth: 1,
  },
  surface: {
    // Barely-there white fill for readability over dark blurred content
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  innerShadow: {
    // Vignette: dark ring 3px inside border — mimics inner shadow
    borderWidth: 3,
    borderColor: 'rgba(0,0,0,0.22)',
  },
  specularTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 52,
  },
  specularLeft: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: 40,
  },
  specularRight: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: 40,
  },
  border: {
    borderWidth: 1,
  },
  topLine: {
    position: 'absolute',
    top: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.70)',
  },
  content: {
    // Above all absolute layers
  },
});
