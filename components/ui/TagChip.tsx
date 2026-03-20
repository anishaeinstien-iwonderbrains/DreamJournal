import React from 'react';
import { Pressable, Text, StyleSheet, View } from 'react-native';
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
          backgroundColor: selected ? color + '20' : Colors.glass,
          borderColor: selected ? color + 'BB' : Colors.glassBorder,
          // Inner highlight
          shadowColor: selected ? color : 'transparent',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: selected ? 0.4 : 0,
          shadowRadius: 6,
          elevation: selected ? 3 : 0,
        },
        pressed && { opacity: 0.7, transform: [{ scale: 0.96 }] },
      ]}
    >
      {/* Top shimmer highlight */}
      {selected && (
        <View style={[styles.shimmer, { backgroundColor: color + '30' }]} pointerEvents="none" />
      )}
      {selected && !isSmall && (
        <View style={[styles.dot, { backgroundColor: color }]} />
      )}
      <Text
        style={[
          styles.label,
          isSmall && styles.labelSm,
          { color: selected ? color : Colors.textMuted },
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
    height: '50%',
    borderTopLeftRadius: Radius.full,
    borderTopRightRadius: Radius.full,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  label: {
    fontSize: Typography.sm,
    fontWeight: Typography.medium,
  },
  labelSm: {
    fontSize: Typography.xs,
    fontWeight: Typography.semiBold,
  },
});
