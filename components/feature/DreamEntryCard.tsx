import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { DreamEntry } from '@/types';
import { Colors, Typography, Spacing, Radius, DREAM_TAGS } from '@/constants/theme';
import { TagChip } from '@/components/ui/TagChip';
import { useTheme } from '@/hooks/useTheme';

interface DreamEntryCardProps {
  dream: DreamEntry;
  onEdit: () => void;
  onDelete: () => void;
}

export function DreamEntryCard({ dream, onEdit, onDelete }: DreamEntryCardProps) {
  const { accent } = useTheme();
  const isLucid = dream.tags.includes('lucid');
  const isNightmare = dream.tags.includes('nightmare');
  const cardColor = isNightmare ? '#FF5080' : isLucid ? '#40D8FF' : accent.primary;

  return (
    <View style={[styles.card, { borderColor: cardColor + '35', shadowColor: cardColor }]}>
      {/* Top highlight — liquid glass */}
      <View style={[styles.topHighlight, { backgroundColor: cardColor + '30' }]} />

      <View style={[styles.indicator, { backgroundColor: cardColor, shadowColor: cardColor }]} />

      <View style={styles.inner}>
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Text style={styles.title} numberOfLines={1}>
              {dream.title || 'Untitled Dream'}
            </Text>
          </View>
          <View style={styles.actions}>
            <Pressable
              onPress={onEdit}
              hitSlop={8}
              style={({ pressed }) => [styles.actionBtn, pressed && { opacity: 0.6 }]}
            >
              <MaterialIcons name="edit-note" size={20} color={Colors.textSecondary} />
            </Pressable>
            <Pressable
              onPress={onDelete}
              hitSlop={8}
              style={({ pressed }) => [styles.actionBtn, styles.actionBtnDelete, pressed && { opacity: 0.6 }]}
            >
              <MaterialIcons name="delete-outline" size={20} color={Colors.error} />
            </Pressable>
          </View>
        </View>

        {dream.description ? (
          <Text style={styles.description} numberOfLines={3}>{dream.description}</Text>
        ) : (
          <Text style={styles.emptyDesc}>No description written.</Text>
        )}

        {dream.tags.length > 0 ? (
          <View style={styles.tags}>
            {dream.tags.map((tagId) => {
              const tag = DREAM_TAGS.find((t) => t.id === tagId);
              if (!tag) return null;
              return <TagChip key={tagId} label={tag.label} color={tag.color} selected size="sm" />;
            })}
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.xl,
    borderWidth: 1,
    marginBottom: Spacing.md,
    overflow: 'hidden',
    flexDirection: 'row',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.30,
    shadowRadius: 14,
    elevation: 8,
  },
  topHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
  },
  indicator: {
    width: 3,
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 8,
    elevation: 4,
  },
  inner: {
    flex: 1,
    padding: Spacing.base,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  titleRow: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  title: {
    fontSize: Typography.base,
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
    letterSpacing: 0.1,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  actionBtn: {
    padding: Spacing.xs + 1,
    borderRadius: Radius.sm,
    backgroundColor: Colors.glass,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  actionBtnDelete: {
    backgroundColor: 'rgba(255,96,112,0.10)',
    borderColor: 'rgba(255,96,112,0.25)',
  },
  description: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    lineHeight: Typography.sm * 1.65,
    marginBottom: Spacing.md,
  },
  emptyDesc: {
    fontSize: Typography.sm,
    color: Colors.textMuted,
    fontStyle: 'italic',
    marginBottom: Spacing.md,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
});
