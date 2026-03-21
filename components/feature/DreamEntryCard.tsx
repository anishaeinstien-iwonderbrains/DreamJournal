import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
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
    <View
      style={[
        styles.outer,
        { borderColor: cardColor + '32', shadowColor: cardColor },
      ]}
    >
      {/* ── Blur ── */}
      <BlurView intensity={65} tint="dark" style={[StyleSheet.absoluteFill, { borderRadius: Radius.xl }]} />

      {/* ── Base fill ── */}
      <View style={[StyleSheet.absoluteFill, styles.fill]} />

      {/* ── Colour-tinted top gradient ── */}
      <LinearGradient
        colors={[cardColor + '18', 'transparent']}
        style={[StyleSheet.absoluteFill, { borderRadius: Radius.xl }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0.65 }}
        pointerEvents="none"
      />

      {/* ── Specular shimmer ── */}
      <LinearGradient
        colors={['rgba(255,255,255,0.26)', 'rgba(255,255,255,0.00)']}
        style={[styles.shimmer, { borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl }]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        pointerEvents="none"
      />

      {/* ── Top-edge line ── */}
      <View style={[styles.topLine, { backgroundColor: cardColor + '70' }]} pointerEvents="none" />

      {/* ── Left glow stripe ── */}
      <View style={[styles.indicator, { backgroundColor: cardColor, shadowColor: cardColor }]} />

      {/* ── Content ── */}
      <View style={styles.inner}>
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={1}>
            {dream.title || 'Untitled Dream'}
          </Text>
          <View style={styles.actions}>
            <Pressable
              onPress={onEdit}
              hitSlop={8}
              style={({ pressed }) => [styles.actionBtn, pressed && { opacity: 0.6 }]}
            >
              <BlurView intensity={40} tint="dark" style={[StyleSheet.absoluteFill, { borderRadius: Radius.sm }]} />
              <MaterialIcons name="edit-note" size={20} color={Colors.textSecondary} />
            </Pressable>
            <Pressable
              onPress={onDelete}
              hitSlop={8}
              style={({ pressed }) => [styles.actionBtn, styles.actionBtnDelete, pressed && { opacity: 0.6 }]}
            >
              <BlurView intensity={40} tint="dark" style={[StyleSheet.absoluteFill, { borderRadius: Radius.sm }]} />
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
  outer: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    marginBottom: Spacing.md,
    overflow: 'hidden',
    flexDirection: 'row',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.40,
    shadowRadius: 20,
    elevation: 10,
  },
  fill: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: Radius.xl,
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 48,
  },
  topLine: {
    position: 'absolute',
    top: 0,
    left: Radius.xl * 0.5,
    right: Radius.xl * 0.5,
    height: 1,
  },
  indicator: {
    width: 3,
    shadowOffset: { width: 3, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 5,
  },
  inner: { flex: 1, padding: Spacing.base },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  title: {
    flex: 1,
    fontSize: Typography.base,
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
    letterSpacing: 0.1,
    marginRight: Spacing.sm,
  },
  actions: { flexDirection: 'row', gap: Spacing.xs },
  actionBtn: {
    padding: Spacing.xs + 1,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnDelete: {
    borderColor: 'rgba(255,96,112,0.30)',
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
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
});
