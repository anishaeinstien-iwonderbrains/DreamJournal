import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';

interface StarRatingProps {
  value: number;
  onChange?: (v: number) => void;
  size?: number;
  readonly?: boolean;
}

export function StarRating({ value, onChange, size = 28, readonly = false }: StarRatingProps) {
  const { accent } = useTheme();
  return (
    <View style={styles.row}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Pressable
          key={star}
          onPress={() => !readonly && onChange?.(star)}
          hitSlop={8}
          style={styles.star}
        >
          <MaterialIcons
            name={star <= value ? 'star' : 'star-border'}
            size={size}
            color={star <= value ? accent.accent : Colors.textMuted}
          />
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  star: {
    padding: Spacing.xs,
  },
});
