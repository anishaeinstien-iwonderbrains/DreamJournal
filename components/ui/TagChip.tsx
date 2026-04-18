/**
 * TagChip — liquid glass pill with vibrancy + specular highlights
 */
import React from 'react';
import { Pressable, Text, StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';

interface TagChipProps {
  label: string;
  color: string;
  selected?: boolean;
  onPress?: () => void;
  size?: 'sm' | 'md';
}

export function TagChip({ label, color, selected = false, onPress, size = 'md' }: TagChipProps) {
  const isSmall = size === 'sm';
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        isSmall && styles.chipSm,
        {
          borderColor: selected ? color + 'C0' : 'rgba(255,255,255,0.14)',
          shadowColor: selected ? color : 'transparent',
          shadowOpacity: selected ? 0.55 : 0,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 2 },
          elevation: selected ? 4 : 0,
        },
        pressed && { opacity: 0.72, transform: [{ scale: 0.95 }] },
      ]}
    >
      {/* Vibrancy blur */}
      <BlurView
        intensity={selected ? 80 : 55}
        tint="dark"
        style={[StyleSheet.absoluteFill, { borderRadius: Radius.full }]}
      />

      {/* Surface fill */}
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            borderRadius: Radius.full,
            backgroundColor: selected ? color + '1E' : 'rgba(255,255,255,0.055)',
          },
        ]}
      />

      {/* Specular top shimmer */}
      <LinearGradient
        colors={[
          selected ? color + '35' : 'rgba(255,255,255,0.22)',
          'rgba(255,255,255,0.00)',
        ]}
        style={[styles.shimmer, { borderTopLeftRadius: Radius.full, borderTopRightRadius: Radius.full }]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        pointerEvents="none"
      />

      {/* 1px bright top edge */}
      <View
        style={[
          styles.topLine,
          { backgroundColor: selected ? color + '80' : 'rgba(255,255,255,0.50)' },
        ]}
        pointerEvents="none"
      />

      {selected && !isSmall && (
        <View style={[styles.dot, { backgroundColor: color, shadowColor: color }]} />
      )}

      <Text
        style={[
          styles.label,
          isSmall && styles.labelSm,
          { color: selected ? color : Colors.textMuted, fontWeight: selected ? Typography.semiBold : Typography.medium },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: Radius.full,
    borderWidth: 1,
    gap: Spacing.xs,
    overflow: 'hidden',
  },
  chipSm: {
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 3,
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '55%',
  },
  topLine: {
    position: 'absolute',
    top: 0,
    left: 8,
    right: 8,
    height: 1,
    borderTopLeftRadius: Radius.full,
    borderTopRightRadius: Radius.full,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 4,
    elevation: 2,
  },
  label: {
    fontSize: Typography.sm,
  },
  labelSm: {
    fontSize: Typography.xs,
    fontWeight: Typography.semiBold,
  },
});
