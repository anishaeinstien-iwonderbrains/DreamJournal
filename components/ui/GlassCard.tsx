/**
 * GlassCard — true liquid glass card using expo-blur BlurView.
 * Drop this in place of any plain View you want to glass-ify.
 */
import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Radius } from '@/constants/theme';

interface GlassCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Border colour — defaults to white at 18% */
  borderColor?: string;
  /** Glow / shadow colour */
  glowColor?: string;
  /** Blur intensity 0-100, default 55 */
  intensity?: number;
  /** Corner radius override */
  radius?: number;
  /** Extra inner gradient tint on top half — use accent+08 */
  tintTop?: string;
  /** Disable border */
  noBorder?: boolean;
  /** Press feedback — pass pressed bool */
  pressed?: boolean;
}

export function GlassCard({
  children,
  style,
  borderColor = 'rgba(255,255,255,0.18)',
  glowColor = 'transparent',
  intensity = 55,
  radius = Radius.xl,
  tintTop,
  noBorder = false,
  pressed = false,
}: GlassCardProps) {
  return (
    <View
      style={[
        styles.outer,
        {
          borderRadius: radius,
          borderColor: noBorder ? 'transparent' : borderColor,
          shadowColor: glowColor,
        },
        pressed && styles.pressed,
        style,
      ]}
    >
      {/* ── Blur layer ── */}
      <BlurView
        intensity={intensity}
        tint="dark"
        style={[StyleSheet.absoluteFill, { borderRadius: radius }]}
      />

      {/* ── Base translucent fill so blur has something to composite ── */}
      <View style={[StyleSheet.absoluteFill, styles.fill, { borderRadius: radius }]} />

      {/* ── Optional tinted gradient wash (accent colour, very faint) ── */}
      {tintTop ? (
        <LinearGradient
          colors={[tintTop, 'transparent']}
          style={[StyleSheet.absoluteFill, { borderRadius: radius }]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 0.6 }}
          pointerEvents="none"
        />
      ) : null}

      {/* ── Specular top-edge shimmer (the "glass reflection") ── */}
      <View
        style={[styles.shimmerOuter, { borderTopLeftRadius: radius, borderTopRightRadius: radius }]}
        pointerEvents="none"
      >
        <LinearGradient
          colors={['rgba(255,255,255,0.30)', 'rgba(255,255,255,0.00)']}
          style={[StyleSheet.absoluteFill, { borderTopLeftRadius: radius, borderTopRightRadius: radius }]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />
      </View>

      {/* ── 1px bright top border line ── */}
      <View
        style={[
          styles.topLine,
          { left: radius * 0.4, right: radius * 0.4, borderTopLeftRadius: radius, borderTopRightRadius: radius },
        ]}
        pointerEvents="none"
      />

      {/* ── Content ── */}
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    borderWidth: 1,
    overflow: 'hidden',
    // Outer glow
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.40,
    shadowRadius: 24,
    elevation: 12,
  },
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.982 }],
  },
  fill: {
    backgroundColor: 'rgba(255,255,255,0.055)',
  },
  shimmerOuter: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 44,
  },
  topLine: {
    position: 'absolute',
    top: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.45)',
  },
  content: {
    // sits above all absolute layers
  },
});
