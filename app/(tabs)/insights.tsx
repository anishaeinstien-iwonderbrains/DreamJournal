import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useSessions } from '@/hooks/useSessions';
import { useTheme } from '@/hooks/useTheme';
import { Colors, Typography, Spacing, Radius, DREAM_TAGS, WAKE_MOODS } from '@/constants/theme';
import { StarRating } from '@/components/ui/StarRating';

// Reusable liquid-glass panel
function GlassPanel({
  children,
  accentColor,
  style,
}: {
  children: React.ReactNode;
  accentColor: string;
  style?: any;
}) {
  return (
    <View
      style={[
        glassStyles.outer,
        { borderColor: accentColor + '28', shadowColor: accentColor },
        style,
      ]}
    >
      <BlurView intensity={60} tint="dark" style={[StyleSheet.absoluteFill, { borderRadius: Radius.xl }]} />
      <View style={[StyleSheet.absoluteFill, glassStyles.fill]} />
      <LinearGradient
        colors={[accentColor + '10', 'transparent']}
        style={[StyleSheet.absoluteFill, { borderRadius: Radius.xl }]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.6 }}
        pointerEvents="none"
      />
      <LinearGradient
        colors={['rgba(255,255,255,0.26)', 'rgba(255,255,255,0.00)']}
        style={[glassStyles.shimmer, { borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl }]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        pointerEvents="none"
      />
      <View style={glassStyles.topLine} />
      <View style={glassStyles.content}>{children}</View>
    </View>
  );
}

const glassStyles = StyleSheet.create({
  outer: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 10,
  },
  fill: { backgroundColor: 'rgba(255,255,255,0.055)', borderRadius: Radius.xl },
  shimmer: { position: 'absolute', top: 0, left: 0, right: 0, height: 48 },
  topLine: {
    position: 'absolute',
    top: 0,
    left: Radius.xl * 0.5,
    right: Radius.xl * 0.5,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.48)',
  },
  content: { padding: Spacing.xl },
});

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
    <View
      style={[
        styles.statCard,
        { borderColor: accentColor + '30', shadowColor: accentColor },
      ]}
    >
      <BlurView intensity={60} tint="dark" style={[StyleSheet.absoluteFill, { borderRadius: Radius.xl }]} />
      <View style={[StyleSheet.absoluteFill, styles.statFill]} />
      <LinearGradient
        colors={[accentColor + '18', 'transparent']}
        style={[StyleSheet.absoluteFill, { borderRadius: Radius.xl }]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.65 }}
        pointerEvents="none"
      />
      <LinearGradient
        colors={['rgba(255,255,255,0.26)', 'rgba(255,255,255,0.00)']}
        style={[styles.statShimmer, { borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl }]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        pointerEvents="none"
      />
      <View style={styles.statTopLine} />
      <View style={styles.statContent}>
        <View style={[styles.statIconWrap, { backgroundColor: accentColor + '20' }]}>
          <MaterialIcons name={icon as any} size={22} color={accentColor} />
        </View>
        <Text style={[styles.statValue, { color: accentColor }]}>{value}</Text>
        {sub ? <Text style={styles.statSub}>{sub}</Text> : null}
        <Text style={styles.statLabel}>{label}</Text>
      </View>
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
    const h = Math.floor(avgDuration / 60);
    const m = Math.round(avgDuration % 60);
    const durationStr = h > 0 ? `${h}h ${m}m` : `${m}m`;
    return { totalDreams, avgDuration, avgQuality, durationStr };
  }, [sessions]);

  const tagFrequency = useMemo(() => {
    const tagCount: Record<string, number> = {};
    sessions.forEach((s) =>
      s.dreams.forEach((d) => d.tags.forEach((t) => { tagCount[t] = (tagCount[t] || 0) + 1; }))
    );
    return Object.entries(tagCount).sort((a, b) => b[1] - a[1]).slice(0, 6);
  }, [sessions]);

  const maxTagCount = tagFrequency[0]?.[1] ?? 1;

  if (sessions.length === 0) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={[styles.glow, { backgroundColor: accent.primary + '18' }]} pointerEvents="none" />
        <View style={styles.emptyState}>
          <View style={[styles.emptyIconWrap, { backgroundColor: accent.primary + '15', borderColor: accent.primary + '35' }]}>
            <MaterialIcons name="insights" size={48} color={accent.primary} />
          </View>
          <Text style={styles.emptyTitle}>No insights yet</Text>
          <Text style={styles.emptyText}>Log some sleep sessions to see patterns and statistics.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={[styles.glow, { backgroundColor: accent.primary + '18' }]} pointerEvents="none" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>Insights</Text>
        <Text style={styles.pageSubtitle}>Based on {sessions.length} night{sessions.length !== 1 ? 's' : ''} of data</Text>

        {/* Stat grid */}
        <View style={styles.statsGrid}>
          <StatCard icon="bedtime" label="Nights logged" value={String(sessions.length)} accentColor={accent.light} />
          <StatCard icon="cloud" label="Total dreams" value={String(stats?.totalDreams ?? 0)} accentColor="#40D8FF" />
          <StatCard icon="schedule" label="Avg sleep" value={stats?.durationStr ?? '--'} accentColor={Colors.accent} />
          <StatCard icon="star" label="Avg quality" value={stats ? stats.avgQuality.toFixed(1) : '--'} sub="out of 5" accentColor={Colors.accentSoft} />
        </View>

        {/* Quality */}
        {stats ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sleep Quality</Text>
            <GlassPanel accentColor={accent.primary}>
              <StarRating value={Math.round(stats.avgQuality)} readonly size={34} />
              <View style={styles.qualityMeta}>
                <Text style={[styles.qualityBig, { color: accent.light }]}>{stats.avgQuality.toFixed(1)}</Text>
                <Text style={styles.qualityOf}>/ 5.0 average</Text>
              </View>
            </GlassPanel>
          </View>
        ) : null}

        {/* Dream tags */}
        {tagFrequency.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Dream Tags</Text>
            <GlassPanel accentColor={Colors.glassBorder}>
              {tagFrequency.map(([tagId, count]) => {
                const tag = DREAM_TAGS.find((t) => t.id === tagId);
                if (!tag) return null;
                const pct = (count / maxTagCount) * 100;
                return (
                  <View key={tagId} style={styles.tagRow}>
                    <View style={[styles.tagDot, { backgroundColor: tag.color, shadowColor: tag.color }]} />
                    <Text style={[styles.tagName, { color: tag.color }]}>{tag.label}</Text>
                    <View style={styles.barTrack}>
                      <View style={[styles.barFill, { width: `${pct}%` as any, backgroundColor: tag.color }]} />
                    </View>
                    <Text style={styles.tagCount}>{count}</Text>
                  </View>
                );
              })}
            </GlassPanel>
          </View>
        ) : null}

        {/* Moods */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Wake-up Moods</Text>
          <View style={styles.moodGrid}>
            {WAKE_MOODS.map((mood) => {
              const count = sessions.filter((s) => s.wakeMood === mood.id).length;
              if (count === 0) return null;
              const pct = Math.round((count / sessions.length) * 100);
              return (
                <View
                  key={mood.id}
                  style={[styles.moodItem, { borderColor: accent.primary + '28', shadowColor: accent.primary }]}
                >
                  <BlurView intensity={55} tint="dark" style={[StyleSheet.absoluteFill, { borderRadius: Radius.xl }]} />
                  <View style={[StyleSheet.absoluteFill, styles.moodFill]} />
                  <LinearGradient
                    colors={['rgba(255,255,255,0.22)', 'rgba(255,255,255,0.00)']}
                    style={[styles.moodShimmer, { borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl }]}
                    start={{ x: 0.5, y: 0 }}
                    end={{ x: 0.5, y: 1 }}
                    pointerEvents="none"
                  />
                  <View style={styles.moodTopLine} />
                  <View style={styles.moodContent}>
                    <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                    <Text style={[styles.moodCount, { color: accent.light }]}>{count}x</Text>
                    <Text style={styles.moodLabel}>{mood.label}</Text>
                    <Text style={styles.moodPct}>{pct}%</Text>
                  </View>
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
  glow: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    top: -70,
    right: -70,
  },
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
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md, marginBottom: Spacing.xl },
  statCard: {
    flex: 1,
    minWidth: '45%',
    borderRadius: Radius.xl,
    borderWidth: 1,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.40,
    shadowRadius: 20,
    elevation: 10,
  },
  statFill: { backgroundColor: 'rgba(255,255,255,0.055)', borderRadius: Radius.xl },
  statShimmer: { position: 'absolute', top: 0, left: 0, right: 0, height: 46 },
  statTopLine: {
    position: 'absolute',
    top: 0,
    left: Radius.xl * 0.5,
    right: Radius.xl * 0.5,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.46)',
  },
  statContent: { padding: Spacing.base, alignItems: 'center', gap: Spacing.xs },
  statIconWrap: {
    width: 44,
    height: 44,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  statValue: { fontSize: Typography.xxl, fontWeight: Typography.extraBold, letterSpacing: -0.5 },
  statSub: { fontSize: Typography.xs, color: Colors.textMuted, fontWeight: Typography.medium },
  statLabel: { fontSize: Typography.xs, color: Colors.textMuted, textAlign: 'center', fontWeight: Typography.medium },
  section: { marginBottom: Spacing.xl },
  sectionTitle: {
    fontSize: Typography.xs,
    fontWeight: Typography.bold,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  qualityMeta: { flexDirection: 'row', alignItems: 'baseline', gap: Spacing.sm, marginTop: Spacing.sm },
  qualityBig: { fontSize: Typography.xxl, fontWeight: Typography.extraBold },
  qualityOf: { fontSize: Typography.sm, color: Colors.textMuted },
  tagRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, width: '100%', marginBottom: Spacing.sm },
  tagDot: {
    width: 8, height: 8, borderRadius: 4,
    shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.9, shadowRadius: 4, elevation: 2,
  },
  tagName: { fontSize: Typography.sm, fontWeight: Typography.semiBold, width: 76 },
  barTrack: {
    flex: 1, height: 6, backgroundColor: Colors.glass, borderRadius: Radius.full,
    overflow: 'hidden', borderWidth: 1, borderColor: Colors.glassBorder,
  },
  barFill: { height: '100%', borderRadius: Radius.full, opacity: 0.80 },
  tagCount: { fontSize: Typography.sm, fontWeight: Typography.bold, color: Colors.textSecondary, width: 20, textAlign: 'right' },
  moodGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md },
  moodItem: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    minWidth: 80,
    flex: 1,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.30,
    shadowRadius: 14,
    elevation: 8,
  },
  moodFill: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: Radius.xl },
  moodShimmer: { position: 'absolute', top: 0, left: 0, right: 0, height: 40 },
  moodTopLine: {
    position: 'absolute', top: 0,
    left: Radius.xl * 0.35, right: Radius.xl * 0.35,
    height: 1, backgroundColor: 'rgba(255,255,255,0.42)',
  },
  moodContent: { padding: Spacing.md, alignItems: 'center', gap: 3 },
  moodEmoji: { fontSize: Typography.xl },
  moodCount: { fontSize: Typography.base, fontWeight: Typography.bold },
  moodLabel: { fontSize: Typography.xs, color: Colors.textMuted, fontWeight: Typography.medium },
  moodPct: { fontSize: Typography.xs, color: Colors.textMuted },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.xxl, gap: Spacing.base },
  emptyIconWrap: { width: 96, height: 96, borderRadius: Radius.xxl, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md, borderWidth: 1 },
  emptyTitle: { fontSize: Typography.xl, fontWeight: Typography.extraBold, color: Colors.textPrimary },
  emptyText: { fontSize: Typography.base, color: Colors.textSecondary, textAlign: 'center', lineHeight: Typography.base * 1.65 },
});
