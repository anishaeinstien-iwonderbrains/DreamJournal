import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SleepSession } from '@/types';
import { Colors, Typography, Spacing, Radius, Shadows, WAKE_MOODS, DREAM_TAGS } from '@/constants/theme';
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
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      {/* Top highlight line — liquid glass effect */}
      <View style={styles.topHighlight} />

      {/* Accent glow stripe */}
      <View style={[styles.stripe, { backgroundColor: accent.primary, shadowColor: accent.primary }]} />

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
          <View style={[styles.durationBadge, { backgroundColor: accent.accent + '22', borderColor: accent.accent + '55' }]}>
            <MaterialIcons name="nightlight-round" size={11} color={accent.accent} />
            <Text style={[styles.duration, { color: accent.accent }]}>
              {StorageService.formatDuration(session.durationMinutes)}
            </Text>
          </View>
          {mood ? <Text style={styles.moodEmoji}>{mood.emoji}</Text> : null}
        </View>
      </View>

      {/* Time row — frosted inner panel */}
      <View style={[styles.timeRow, { borderColor: accent.primary + '25' }]}>
        <View style={styles.timeGroup}>
          <MaterialIcons name="bedtime" size={12} color={accent.light + 'BB'} />
          <Text style={styles.timeSmall}>{StorageService.formatTime(session.bedtime)}</Text>
        </View>
        <View style={styles.timeArrow}>
          <View style={[styles.timeLine, { backgroundColor: accent.primary + '35' }]} />
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
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.xl,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    marginBottom: Spacing.md,
    overflow: 'hidden',
    // Liquid glass shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 10,
  },
  cardPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.982 }],
  },
  topHighlight: {
    position: 'absolute',
    top: 0,
    left: 12,
    right: 12,
    height: 1,
    backgroundColor: Colors.glassHighlight,
    borderRadius: Radius.full,
  },
  stripe: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 3,
    bottom: 0,
    borderTopLeftRadius: Radius.xl,
    borderBottomLeftRadius: Radius.xl,
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
    paddingLeft: Spacing.sm,
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
  rightCol: {
    alignItems: 'flex-end',
    gap: Spacing.xs,
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 4,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  duration: {
    fontSize: Typography.xs,
    fontWeight: Typography.bold,
    letterSpacing: 0.3,
  },
  moodEmoji: { fontSize: 17 },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.glassInner,
    borderRadius: Radius.md,
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
    marginLeft: Spacing.sm,
    gap: Spacing.sm,
  },
  timeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  timeSmall: {
    fontSize: Typography.sm,
    fontWeight: Typography.semiBold,
    color: Colors.textSecondary,
  },
  timeArrow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  timeLine: {
    flex: 1,
    height: 1,
  },
  tagsRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    flexWrap: 'wrap',
    paddingLeft: Spacing.sm,
  },
});
