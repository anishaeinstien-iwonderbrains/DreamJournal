import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LiquidGlass } from '@/components/ui/LiquidGlass';
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
  const uniqueTags = [...new Set(allTags)].slice(0, 4);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.pressable, pressed && styles.pressed]}
    >
      {({ pressed }) => (
        <LiquidGlass
          radius={Radius.xl}
          tint={accent.primary}
          glowColor={accent.primary}
          intensity={90}
          pressed={pressed}
          style={styles.glass}
        >
          {/* Left accent bar */}
          <View style={[styles.accentBar, { backgroundColor: accent.primary, shadowColor: accent.primary }]} />

          <View style={styles.content}>
            {/* Header row */}
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
                <View style={[styles.durationBadge, { backgroundColor: accent.accent + '22', borderColor: accent.accent + '60' }]}>
                  <MaterialIcons name="nightlight-round" size={10} color={accent.accent} />
                  <Text style={[styles.duration, { color: accent.accent }]}>
                    {StorageService.formatDuration(session.durationMinutes)}
                  </Text>
                </View>
                {mood ? <Text style={styles.moodEmoji}>{mood.emoji}</Text> : null}
              </View>
            </View>

            {/* Time strip */}
            <View style={[styles.timeStrip, { borderColor: 'rgba(255,255,255,0.10)' }]}>
              <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: Radius.md }]} />
              <View style={styles.timeGroup}>
                <MaterialIcons name="bedtime" size={11} color={accent.light + 'CC'} />
                <Text style={[styles.timeText, { color: accent.light }]}>{StorageService.formatTime(session.bedtime)}</Text>
              </View>
              <View style={styles.timeArrow}>
                <View style={[styles.timeDash, { backgroundColor: accent.primary + '50' }]} />
                <MaterialIcons name="arrow-forward-ios" size={8} color={Colors.textMuted} />
              </View>
              <View style={styles.timeGroup}>
                <MaterialIcons name="wb-sunny" size={11} color={Colors.accent + 'CC'} />
                <Text style={[styles.timeText, { color: Colors.accentSoft }]}>{StorageService.formatTime(session.wakeTime)}</Text>
              </View>
              <View style={styles.stars}>
                <StarRating value={session.qualityRating} readonly size={12} />
              </View>
            </View>

            {/* Tags */}
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
        </LiquidGlass>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: { marginBottom: Spacing.md },
  pressed: {},
  glass: { flexDirection: 'row' },
  accentBar: {
    width: 3,
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 6,
    borderTopLeftRadius: Radius.xl,
    borderBottomLeftRadius: Radius.xl,
  },
  content: { flex: 1, padding: Spacing.base, paddingLeft: Spacing.md },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  headerLeft: { flex: 1 },
  date: { fontSize: Typography.base, fontWeight: Typography.bold, color: Colors.textPrimary, letterSpacing: 0.1 },
  dreamsCount: { fontSize: Typography.xs, color: Colors.textMuted, marginTop: 2, fontWeight: Typography.medium },
  rightCol: { alignItems: 'flex-end', gap: Spacing.xs },
  durationBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    paddingHorizontal: Spacing.sm + 2, paddingVertical: 3,
    borderRadius: Radius.full, borderWidth: 1,
  },
  duration: { fontSize: Typography.xs, fontWeight: Typography.bold, letterSpacing: 0.3 },
  moodEmoji: { fontSize: 16 },
  timeStrip: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    borderRadius: Radius.md, paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md,
    borderWidth: 1, marginBottom: Spacing.md, overflow: 'hidden',
  },
  timeGroup: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  timeText: { fontSize: Typography.sm, fontWeight: Typography.semiBold },
  timeArrow: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 4 },
  timeDash: { flex: 1, height: 1 },
  stars: { marginLeft: 'auto' as any },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
});
