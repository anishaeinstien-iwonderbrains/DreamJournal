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
          backgroundColor: selected ? color + '28' : Colors.glass,
          borderColor: selected ? color + 'AA' : Colors.glassBorder,
        },
        pressed && { opacity: 0.7, transform: [{ scale: 0.97 }] },
      ]}
    >
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
  },
  chipSm: {
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 3,
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
