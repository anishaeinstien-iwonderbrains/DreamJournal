import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SleepSession } from '@/types';
import { Colors, Typography, Spacing, Radius, Shadows } from '@/constants/theme';
import { StorageService } from '@/services/storage';
import { StarRating } from '@/components/ui/StarRating';
import { WAKE_MOODS, DREAM_TAGS } from '@/constants/theme';
import { TagChip } from '@/components/ui/TagChip';
import { useTheme } from '@/hooks/useTheme';

interface SessionCardProps {
  session: SleepSession;
  onPress: () => void;
}

const QUALITY_LABEL = ['', 'Poor', 'Fair', 'Okay', 'Good', 'Great'];

export function SessionCard({ session, onPress }: SessionCardProps) {
  const { accent } = useTheme();
  const mood = WAKE_MOODS.find((m) => m.id === session.wakeMood);
  const allTags = session.dreams.flatMap((d) => d.tags);
  const uniqueTags = [...new Set(allTags)].slice(0, 3);
  const hasLucid = allTags.includes('lucid');
  const hasNightmare = allTags.includes('nightmare');

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      {/* Glow accent stripe */}
      <View style={[styles.stripe, { backgroundColor: accent.primary }]} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.date}>{StorageService.formatDate(session.bedtime)}</Text>
          <Text style={styles.dreamsCount}>
            {session.dreams.length > 0
              ? `${session.dreams.length} dream${session.dreams.length !== 1 ? 's' : ''}`
              : 'No dreams logged'}
          </Text>
        </View>
        <View style={styles.rightCol}>
          <View style={[styles.durationBadge, { backgroundColor: accent.accent + '20', borderColor: accent.accent + '50' }]}>
            <MaterialIcons name="nightlight-round" size={12} color={accent.accent} />
            <Text style={[styles.duration, { color: accent.accent }]}>
              {StorageService.formatDuration(session.durationMinutes)}
            </Text>
          </View>
          {mood ? (
            <Text style={styles.moodEmoji}>{mood.emoji}</Text>
          ) : null}
        </View>
      </View>

      {/* Time row */}
      <View style={styles.timeRow}>
        <View style={styles.timeGroup}>
          <MaterialIcons name="bedtime" size={13} color={accent.light + 'AA'} />
          <Text style={styles.timeSmall}>{StorageService.formatTime(session.bedtime)}</Text>
        </View>
        <View style={styles.timeArrow}>
          <View style={[styles.timeLine, { backgroundColor: accent.primary + '40' }]} />
          <MaterialIcons name="arrow-forward-ios" size={10} color={Colors.textMuted} />
        </View>
        <View style={styles.timeGroup}>
          <MaterialIcons name="wb-sunny" size={13} color={Colors.accent + 'AA'} />
          <Text style={styles.timeSmall}>{StorageService.formatTime(session.wakeTime)}</Text>
        </View>
        <View style={styles.qualityRight}>
          <StarRating value={session.qualityRating} readonly size={14} />
        </View>
      </View>

      {/* Footer tags */}
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
    ...Shadows.md,
    marginBottom: Spacing.md,
    overflow: 'hidden',
  },
  cardPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.985 }],
  },
  stripe: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 3,
    bottom: 0,
    borderTopLeftRadius: Radius.xl,
    borderBottomLeftRadius: Radius.xl,
    opacity: 0.8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
    paddingLeft: Spacing.sm,
  },
  date: {
    fontSize: Typography.base,
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
    letterSpacing: 0.2,
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
  moodEmoji: {
    fontSize: 18,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.glass,
    borderRadius: Radius.md,
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
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
  qualityRight: {
    marginLeft: 'auto',
  },
  tagsRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    flexWrap: 'wrap',
    paddingLeft: Spacing.sm,
  },
});
