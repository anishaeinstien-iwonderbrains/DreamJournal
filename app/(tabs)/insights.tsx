import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useSessions } from '@/hooks/useSessions';
import { useTheme } from '@/hooks/useTheme';
import { Colors, Typography, Spacing, Radius, Shadows, DREAM_TAGS, WAKE_MOODS } from '@/constants/theme';
import { StarRating } from '@/components/ui/StarRating';

function StatCard({
  icon,
  label,
  value,
  sub,
  accentColor,
}: {
  icon: string;
  label: string;
  value: string;
  sub?: string;
  accentColor: string;
}) {
  return (
    <View style={[styles.statCard, { borderColor: accentColor + '30' }]}>
      <View style={[styles.statIconWrap, { backgroundColor: accentColor + '20' }]}>
        <MaterialIcons name={icon as any} size={22} color={accentColor} />
      </View>
      <Text style={[styles.statValue, { color: accentColor }]}>{value}</Text>
      {sub ? <Text style={styles.statSub}>{sub}</Text> : null}
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function InsightsScreen() {
  const { sessions } = useSessions();
  const { accent } = useTheme();

  const stats = useMemo(() => {
    if (sessions.length === 0) return null;
    const totalDreams = sessions.reduce((acc, s) => acc + s.dreams.length, 0);
    const avgDuration = sessions.reduce((acc, s) => acc + s.durationMinutes, 0) / sessions.length;
    const avgQuality = sessions.reduce((acc, s) => acc + s.qualityRating, 0) / sessions.length;
    const tagCount: Record<string, number> = {};
    sessions.forEach((s) => s.dreams.forEach((d) => d.tags.forEach((t) => { tagCount[t] = (tagCount[t] || 0) + 1; })));
    const h = Math.floor(avgDuration / 60);
    const m = Math.round(avgDuration % 60);
    const durationStr = h > 0 ? `${h}h ${m}m` : `${m}m`;
    return { totalDreams, avgDuration, avgQuality, durationStr };
  }, [sessions]);

  const tagFrequency = useMemo(() => {
    const tagCount: Record<string, number> = {};
    sessions.forEach((s) => s.dreams.forEach((d) => d.tags.forEach((t) => { tagCount[t] = (tagCount[t] || 0) + 1; })));
    return Object.entries(tagCount).sort((a, b) => b[1] - a[1]).slice(0, 6);
  }, [sessions]);

  const maxTagCount = tagFrequency[0]?.[1] ?? 1;

  if (sessions.length === 0) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.emptyState}>
          <View style={[styles.emptyIcon, { backgroundColor: accent.primary + '20' }]}>
            <MaterialIcons name="insights" size={48} color={accent.primary} />
          </View>
          <Text style={styles.emptyTitle}>No insights yet</Text>
          <Text style={styles.emptyText}>Log some sleep sessions to see patterns and statistics about your dreams.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>Insights</Text>
        <Text style={styles.pageSubtitle}>Based on {sessions.length} night{sessions.length !== 1 ? 's' : ''} of data</Text>

        {/* Stat grid */}
        <View style={styles.statsGrid}>
          <StatCard icon="bedtime" label="Nights logged" value={String(sessions.length)} accentColor={accent.light} />
          <StatCard icon="cloud" label="Total dreams" value={String(stats?.totalDreams ?? 0)} accentColor={Colors.primaryLight} />
          <StatCard icon="schedule" label="Avg sleep" value={stats?.durationStr ?? '--'} accentColor={Colors.accent} />
          <StatCard icon="star" label="Avg quality" value={stats ? stats.avgQuality.toFixed(1) : '--'} sub="out of 5" accentColor={Colors.accentSoft} />
        </View>

        {/* Average quality */}
        {stats ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sleep Quality</Text>
            <View style={[styles.qualityCard, { borderColor: accent.primary + '30' }]}>
              <StarRating value={Math.round(stats.avgQuality)} readonly size={34} />
              <View style={styles.qualityMeta}>
                <Text style={[styles.qualityBig, { color: accent.light }]}>{stats.avgQuality.toFixed(1)}</Text>
                <Text style={styles.qualityOf}>/ 5.0 average</Text>
              </View>
            </View>
          </View>
        ) : null}

        {/* Dream tag breakdown */}
        {tagFrequency.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Dream Tags</Text>
            <View style={styles.tagBreakdown}>
              {tagFrequency.map(([tagId, count], i) => {
                const tag = DREAM_TAGS.find((t) => t.id === tagId);
                if (!tag) return null;
                const pct = (count / maxTagCount) * 100;
                return (
                  <View key={tagId} style={styles.tagRow}>
                    <View style={[styles.tagDot, { backgroundColor: tag.color }]} />
                    <Text style={[styles.tagName, { color: tag.color }]}>{tag.label}</Text>
                    <View style={styles.barTrack}>
                      <View
                        style={[
                          styles.barFill,
                          {
                            width: `${pct}%` as any,
                            backgroundColor: tag.color,
                            opacity: 0.7,
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.tagCount}>{count}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        ) : null}

        {/* Wake moods */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Wake-up Moods</Text>
          <View style={styles.moodGrid}>
            {WAKE_MOODS.map((mood) => {
              const count = sessions.filter((s) => s.wakeMood === mood.id).length;
              if (count === 0) return null;
              const pct = Math.round((count / sessions.length) * 100);
              return (
                <View key={mood.id} style={[styles.moodItem, { borderColor: accent.primary + '30' }]}>
                  <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                  <Text style={[styles.moodCount, { color: accent.light }]}>{count}x</Text>
                  <Text style={styles.moodLabel}>{mood.label}</Text>
                  <Text style={styles.moodPct}>{pct}%</Text>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  content: { paddingHorizontal: Spacing.base, paddingBottom: Spacing.xxxl },
  pageTitle: {
    fontSize: Typography.xxl,
    fontWeight: Typography.extraBold,
    color: Colors.textPrimary,
    paddingTop: Spacing.md,
    marginBottom: 2,
    letterSpacing: -0.5,
  },
  pageSubtitle: {
    fontSize: Typography.sm,
    color: Colors.textMuted,
    marginBottom: Spacing.xl,
    fontWeight: Typography.medium,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.xl,
    padding: Spacing.base,
    alignItems: 'center',
    gap: Spacing.xs,
    borderWidth: 1,
    ...Shadows.sm,
  },
  statIconWrap: {
    width: 44,
    height: 44,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  statValue: {
    fontSize: Typography.xxl,
    fontWeight: Typography.extraBold,
    letterSpacing: -0.5,
  },
  statSub: {
    fontSize: Typography.xs,
    color: Colors.textMuted,
    fontWeight: Typography.medium,
  },
  statLabel: {
    fontSize: Typography.xs,
    color: Colors.textMuted,
    textAlign: 'center',
    fontWeight: Typography.medium,
  },
  section: { marginBottom: Spacing.xl },
  sectionTitle: {
    fontSize: Typography.base,
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontSize: Typography.xs,
    color: Colors.textSecondary,
  },
  qualityCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.md,
    borderWidth: 1,
  },
  qualityMeta: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.sm,
  },
  qualityBig: {
    fontSize: Typography.xxl,
    fontWeight: Typography.extraBold,
  },
  qualityOf: {
    fontSize: Typography.sm,
    color: Colors.textMuted,
  },
  tagBreakdown: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.xl,
    padding: Spacing.base,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  tagDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  tagName: {
    fontSize: Typography.sm,
    fontWeight: Typography.semiBold,
    width: 76,
  },
  barTrack: {
    flex: 1,
    height: 6,
    backgroundColor: Colors.glass,
    borderRadius: Radius.full,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  barFill: {
    height: '100%',
    borderRadius: Radius.full,
  },
  tagCount: {
    fontSize: Typography.sm,
    fontWeight: Typography.bold,
    color: Colors.textSecondary,
    width: 20,
    textAlign: 'right',
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  moodItem: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.xl,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    gap: 3,
    borderWidth: 1,
    minWidth: 80,
    flex: 1,
  },
  moodEmoji: { fontSize: Typography.xl },
  moodCount: { fontSize: Typography.base, fontWeight: Typography.bold },
  moodLabel: { fontSize: Typography.xs, color: Colors.textMuted, fontWeight: Typography.medium },
  moodPct: { fontSize: Typography.xs, color: Colors.textMuted },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xxl,
    gap: Spacing.base,
  },
  emptyIcon: {
    width: 96,
    height: 96,
    borderRadius: Radius.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    fontSize: Typography.xl,
    fontWeight: Typography.extraBold,
    color: Colors.textPrimary,
  },
  emptyText: {
    fontSize: Typography.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: Typography.base * 1.65,
  },
});
