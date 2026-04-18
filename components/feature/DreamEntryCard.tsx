import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { LiquidGlass } from '@/components/ui/LiquidGlass';
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
    <LiquidGlass
      radius={Radius.xl}
      tint={cardColor}
      glowColor={cardColor}
      intensity={88}
      style={styles.glass}
    >
      {/* Left accent stripe */}
      <View style={[styles.stripe, { backgroundColor: cardColor, shadowColor: cardColor }]} />

      {/* Content */}
      <View style={styles.inner}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={1}>
            {dream.title || 'Untitled Dream'}
          </Text>
          <View style={styles.actions}>
            <Pressable onPress={onEdit} hitSlop={8} style={({ pressed }) => [styles.actionBtn, pressed && { opacity: 0.6 }]}>
              <BlurView intensity={50} tint="dark" style={[StyleSheet.absoluteFill, { borderRadius: Radius.sm }]} />
              <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: Radius.sm }]} />
              <LinearGradient
                colors={['rgba(255,255,255,0.15)', 'transparent']}
                style={[StyleSheet.absoluteFill, { borderRadius: Radius.sm }]}
                start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 0.6 }}
                pointerEvents="none"
              />
              <MaterialIcons name="edit-note" size={18} color={Colors.textSecondary} />
            </Pressable>
            <Pressable onPress={onDelete} hitSlop={8} style={({ pressed }) => [styles.actionBtn, styles.actionBtnDelete, pressed && { opacity: 0.6 }]}>
              <BlurView intensity={50} tint="dark" style={[StyleSheet.absoluteFill, { borderRadius: Radius.sm }]} />
              <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(255,80,112,0.08)', borderRadius: Radius.sm }]} />
              <LinearGradient
                colors={['rgba(255,255,255,0.12)', 'transparent']}
                style={[StyleSheet.absoluteFill, { borderRadius: Radius.sm }]}
                start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 0.6 }}
                pointerEvents="none"
              />
              <MaterialIcons name="delete-outline" size={18} color={Colors.error} />
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
    </LiquidGlass>
  );
}

const styles = StyleSheet.create({
  glass: { flexDirection: 'row', marginBottom: Spacing.md },
  stripe: {
    width: 3,
    borderTopLeftRadius: Radius.xl,
    borderBottomLeftRadius: Radius.xl,
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 6,
  },
  inner: { flex: 1, padding: Spacing.base, paddingLeft: Spacing.md },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.sm },
  title: {
    flex: 1, fontSize: Typography.base, fontWeight: Typography.bold,
    color: Colors.textPrimary, letterSpacing: 0.1, marginRight: Spacing.sm,
  },
  actions: { flexDirection: 'row', gap: Spacing.xs },
  actionBtn: {
    width: 32, height: 32, borderRadius: Radius.sm, borderWidth: 1,
    borderColor: Colors.glassBorder, overflow: 'hidden',
    alignItems: 'center', justifyContent: 'center',
  },
  actionBtnDelete: { borderColor: 'rgba(255,96,112,0.30)' },
  description: {
    fontSize: Typography.sm, color: Colors.textSecondary,
    lineHeight: Typography.sm * 1.65, marginBottom: Spacing.md,
  },
  emptyDesc: { fontSize: Typography.sm, color: Colors.textMuted, fontStyle: 'italic', marginBottom: Spacing.md },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
});
