import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { SleepSession } from '@/types';
import { Colors, Typography, Spacing, Radius, WAKE_MOODS, DREAM_TAGS } from '@/constants/theme';
import { StorageService } from '@/services/storage';
import { StarRating } from '@/components/ui/StarRating';
import { TagChip } from '@/components/ui/TagChip';
import { useTheme } from '@/hooks/useTheme';

interface SessionCardProps {
  session: SleepSession;
  onPress: () => void;
}

export function SessionCard({ session, onPress }: SessionCardProps) {
  const { accent } = useTheme();
  const mood = WAKE_MOODS.find((m) => m.id === session.wakeMood);
  const allTags = session.dreams.flatMap((d) => d.tags);
  const uniqueTags = [...new Set(allTags)].slice(0, 3);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.outer,
        {
          borderColor: accent.primary + '28',
          shadowColor: accent.primary,
        },
        pressed && styles.pressed,
      ]}
    >
      {/* ── True blur layer ── */}
      <BlurView intensity={60} tint="dark" style={[StyleSheet.absoluteFill, { borderRadius: Radius.xl }]} />

      {/* ── Translucent base fill ── */}
      <View style={[StyleSheet.absoluteFill, styles.fill]} />

      {/* ── Accent-tinted top gradient wash ── */}
      <LinearGradient
        colors={[accent.primary + '14', 'transparent']}
        style={[StyleSheet.absoluteFill, { borderRadius: Radius.xl }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0.7 }}
        pointerEvents="none"
      />

      {/* ── Specular top shimmer ── */}
      <LinearGradient
        colors={['rgba(255,255,255,0.28)', 'rgba(255,255,255,0.00)']}
        style={[styles.shimmer, { borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl }]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        pointerEvents="none"
      />

      {/* ── 1 px bright top-edge line ── */}
      <View style={styles.topLine} pointerEvents="none" />

      {/* ── Left accent stripe (glowing) ── */}
      <View style={[styles.stripe, { backgroundColor: accent.primary, shadowColor: accent.primary }]} />

      {/* ── Content ── */}
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.date}>{StorageService.formatDate(session.bedtime)}</Text>
            <Text style={styles.dreamsCount}>
              {session.dreams.length > 0
                ? `${session.dreams.length} dream${session.dreams.length !== 1 ? 's' : ''}`
                : 'No dreams logged'}
            </Text>
          </View>
          <View style={styles.rightCol}>
            <View style={[styles.durationBadge, { backgroundColor: accent.accent + '20', borderColor: accent.accent + '55' }]}>
              <MaterialIcons name="nightlight-round" size={11} color={accent.accent} />
              <Text style={[styles.duration, { color: accent.accent }]}>
                {StorageService.formatDuration(session.durationMinutes)}
              </Text>
            </View>
            {mood ? <Text style={styles.moodEmoji}>{mood.emoji}</Text> : null}
          </View>
        </View>

        {/* Time row */}
        <View style={[styles.timeRow, { borderColor: accent.primary + '22', backgroundColor: 'rgba(255,255,255,0.04)' }]}>
          <View style={styles.timeGroup}>
            <MaterialIcons name="bedtime" size={12} color={accent.light + 'BB'} />
            <Text style={styles.timeSmall}>{StorageService.formatTime(session.bedtime)}</Text>
          </View>
          <View style={styles.timeArrow}>
            <View style={[styles.timeLine, { backgroundColor: accent.primary + '40' }]} />
            <MaterialIcons name="arrow-forward-ios" size={9} color={Colors.textMuted} />
          </View>
          <View style={styles.timeGroup}>
            <MaterialIcons name="wb-sunny" size={12} color={Colors.accent + 'BB'} />
            <Text style={styles.timeSmall}>{StorageService.formatTime(session.wakeTime)}</Text>
          </View>
          <View style={{ marginLeft: 'auto' }}>
            <StarRating value={session.qualityRating} readonly size={13} />
          </View>
        </View>

        {uniqueTags.length > 0 ? (
          <View style={styles.tagsRow}>
            {uniqueTags.map((tagId) => {
              const tag = DREAM_TAGS.find((t) => t.id === tagId);
              if (!tag) return null;
              return <TagChip key={tagId} label={tag.label} color={tag.color} selected size="sm" />;
            })}
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  outer: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    marginBottom: Spacing.md,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.45,
    shadowRadius: 24,
    elevation: 12,
  },
  pressed: {
    opacity: 0.80,
    transform: [{ scale: 0.980 }],
  },
  fill: {
    backgroundColor: 'rgba(255,255,255,0.055)',
    borderRadius: Radius.xl,
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 50,
  },
  topLine: {
    position: 'absolute',
    top: 0,
    left: Radius.xl * 0.5,
    right: Radius.xl * 0.5,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.50)',
  },
  stripe: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 3,
    bottom: 0,
    borderTopLeftRadius: Radius.xl,
    borderBottomLeftRadius: Radius.xl,
    shadowOffset: { width: 3, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 5,
  },
  content: {
    padding: Spacing.base,
    paddingLeft: Spacing.base + 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  headerLeft: { flex: 1 },
  date: {
    fontSize: Typography.base,
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
    letterSpacing: 0.1,
  },
  dreamsCount: {
    fontSize: Typography.xs,
    color: Colors.textMuted,
    marginTop: 2,
    fontWeight: Typography.medium,
  },
  rightCol: { alignItems: 'flex-end', gap: Spacing.xs },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 4,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  duration: { fontSize: Typography.xs, fontWeight: Typography.bold, letterSpacing: 0.3 },
  moodEmoji: { fontSize: 17 },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.md,
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  timeGroup: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  timeSmall: { fontSize: Typography.sm, fontWeight: Typography.semiBold, color: Colors.textSecondary },
  timeArrow: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  timeLine: { flex: 1, height: 1 },
  tagsRow: { flexDirection: 'row', gap: Spacing.xs, flexWrap: 'wrap' },
});
