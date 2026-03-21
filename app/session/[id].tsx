import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useSessions } from '@/hooks/useSessions';
import { useTheme } from '@/hooks/useTheme';
import { StorageService } from '@/services/storage';
import { Colors, Typography, Spacing, Radius, WAKE_MOODS } from '@/constants/theme';
import { StarRating } from '@/components/ui/StarRating';
import { DreamEntryCard } from '@/components/feature/DreamEntryCard';
import { useAlert } from '@/template';

export default function SessionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { sessions, updateSession, deleteSession } = useSessions();
  const { showAlert } = useAlert();
  const { accent } = useTheme();

  const session = useMemo(() => sessions.find((s) => s.id === id), [sessions, id]);
  const mood = WAKE_MOODS.find((m) => m.id === session?.wakeMood);

  if (!session) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.centered}>
          <Text style={styles.notFound}>Session not found.</Text>
          <Pressable onPress={() => router.back()} style={[styles.backLink, { backgroundColor: accent.primary }]}>
            <Text style={styles.backLinkText}>Go back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const handleDeleteSession = () => {
    showAlert('Delete Session', 'This will permanently delete this sleep session and all its dreams.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteSession(session.id);
          router.back();
        },
      },
    ]);
  };

  const handleDeleteDream = (dreamId: string) => {
    showAlert('Delete Dream', 'Remove this dream entry?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await updateSession({ ...session, dreams: session.dreams.filter((d) => d.id !== dreamId) });
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Radial glow */}
      <View style={[styles.glow, { backgroundColor: accent.primary + '1A' }]} pointerEvents="none" />

      {/* Nav */}
      <View style={styles.nav}>
        <Pressable onPress={() => router.back()} hitSlop={8} style={styles.navBtn}>
          <BlurView intensity={55} tint="dark" style={[StyleSheet.absoluteFill, { borderRadius: Radius.full }]} />
          <View style={[StyleSheet.absoluteFill, styles.navBtnFill, { borderRadius: Radius.full }]} />
          <View style={styles.navBtnTopLine} />
          <MaterialIcons name="arrow-back" size={22} color={Colors.textPrimary} />
        </Pressable>
        <View style={styles.navCenter}>
          <Text style={styles.navTitle}>{StorageService.formatDate(session.bedtime)}</Text>
          <Text style={styles.navSub}>{StorageService.formatDuration(session.durationMinutes)} sleep</Text>
        </View>
        <Pressable onPress={handleDeleteSession} hitSlop={8} style={[styles.navBtn, styles.navBtnDelete]}>
          <BlurView intensity={55} tint="dark" style={[StyleSheet.absoluteFill, { borderRadius: Radius.full }]} />
          <View style={[StyleSheet.absoluteFill, styles.navBtnDeleteFill, { borderRadius: Radius.full }]} />
          <View style={styles.navBtnTopLine} />
          <MaterialIcons name="delete-outline" size={22} color={Colors.error} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* ── Sleep summary card — liquid glass ── */}
        <View
          style={[styles.summaryOuter, { borderColor: accent.primary + '38', shadowColor: accent.primary }]}
        >
          <BlurView intensity={70} tint="dark" style={[StyleSheet.absoluteFill, { borderRadius: Radius.xxl }]} />
          <View style={[StyleSheet.absoluteFill, styles.summaryFill]} />
          <LinearGradient
            colors={[accent.primary + '18', 'transparent']}
            style={[StyleSheet.absoluteFill, { borderRadius: Radius.xxl }]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0.7 }}
            pointerEvents="none"
          />
          <LinearGradient
            colors={['rgba(255,255,255,0.32)', 'rgba(255,255,255,0.00)']}
            style={[styles.summaryShimmer, { borderTopLeftRadius: Radius.xxl, borderTopRightRadius: Radius.xxl }]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            pointerEvents="none"
          />
          <View style={styles.summaryTopLine} />

          <View style={styles.summaryContent}>
            <View style={styles.timesRow}>
              <View style={styles.timeBlock}>
                <View style={[styles.timeIcon, { backgroundColor: accent.primary + '22', borderColor: accent.primary + '38' }]}>
                  <MaterialIcons name="bedtime" size={18} color={accent.light} />
                </View>
                <Text style={styles.timeLabel}>Bedtime</Text>
                <Text style={styles.timeValue}>{StorageService.formatTime(session.bedtime)}</Text>
              </View>
              <View style={styles.durationCenter}>
                <Text style={[styles.durationBig, { color: accent.light }]}>
                  {StorageService.formatDuration(session.durationMinutes)}
                </Text>
                <Text style={styles.durationLabel}>total sleep</Text>
              </View>
              <View style={styles.timeBlock}>
                <View style={[styles.timeIcon, { backgroundColor: Colors.accent + '22', borderColor: Colors.accent + '38' }]}>
                  <MaterialIcons name="wb-sunny" size={18} color={Colors.accent} />
                </View>
                <Text style={styles.timeLabel}>Wake up</Text>
                <Text style={styles.timeValue}>{StorageService.formatTime(session.wakeTime)}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.ratingRow}>
              <StarRating value={session.qualityRating} readonly size={24} />
              {mood ? (
                <View style={[styles.moodBadge, { backgroundColor: accent.primary + '18', borderColor: accent.primary + '40' }]}>
                  <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                  <Text style={styles.moodLabel}>{mood.label}</Text>
                </View>
              ) : null}
            </View>
          </View>
        </View>

        {/* ── Dreams header ── */}
        <View style={styles.dreamsHeader}>
          <View>
            <Text style={styles.sectionTitle}>Dreams</Text>
            <Text style={styles.sectionSub}>{session.dreams.length} recorded this night</Text>
          </View>
          <Pressable
            onPress={() => router.push({ pathname: '/dream/edit', params: { sessionId: session.id } })}
            style={({ pressed }) => [
              styles.addDreamBtn,
              { backgroundColor: accent.primary, shadowColor: accent.primary },
              pressed && { opacity: 0.8 },
            ]}
          >
            <LinearGradient
              colors={['rgba(255,255,255,0.28)', 'rgba(255,255,255,0.00)']}
              style={[StyleSheet.absoluteFill, { borderRadius: Radius.lg }]}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 0.55 }}
              pointerEvents="none"
            />
            <MaterialIcons name="add" size={18} color={Colors.textOnPrimary} />
            <Text style={styles.addDreamText}>Add Dream</Text>
          </Pressable>
        </View>

        {session.dreams.length === 0 ? (
          <Pressable
            onPress={() => router.push({ pathname: '/dream/edit', params: { sessionId: session.id } })}
            style={({ pressed }) => [
              styles.emptyDreamsOuter,
              { borderColor: accent.primary + '38', shadowColor: accent.primary },
              pressed && { opacity: 0.8 },
            ]}
          >
            <BlurView intensity={55} tint="dark" style={[StyleSheet.absoluteFill, { borderRadius: Radius.xxl }]} />
            <View style={[StyleSheet.absoluteFill, styles.emptyFill]} />
            <LinearGradient
              colors={['rgba(255,255,255,0.22)', 'rgba(255,255,255,0.00)']}
              style={[styles.emptyShimmer, { borderTopLeftRadius: Radius.xxl, borderTopRightRadius: Radius.xxl }]}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              pointerEvents="none"
            />
            <View style={styles.emptyTopLine} />
            <View style={styles.emptyContent}>
              <View style={[styles.emptyDreamIcon, { backgroundColor: accent.primary + '18', borderColor: accent.primary + '35' }]}>
                <MaterialIcons name="cloud" size={32} color={accent.primary} />
              </View>
              <Text style={styles.emptyDreamsTitle}>No dreams logged yet</Text>
              <Text style={styles.emptyDreamsText}>Tap to write about the dreams you remember from this night.</Text>
            </View>
          </Pressable>
        ) : (
          session.dreams.map((dream) => (
            <DreamEntryCard
              key={dream.id}
              dream={dream}
              onEdit={() => router.push({ pathname: '/dream/edit', params: { sessionId: session.id, dreamId: dream.id } })}
              onDelete={() => handleDeleteDream(dream.id)}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  glow: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    top: -90,
    right: -70,
  },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
  },
  navBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  navBtnFill: { backgroundColor: 'rgba(255,255,255,0.07)' },
  navBtnDelete: { borderColor: 'rgba(255,96,112,0.28)' },
  navBtnDeleteFill: { backgroundColor: 'rgba(255,96,112,0.08)' },
  navBtnTopLine: {
    position: 'absolute',
    top: 0,
    left: 8,
    right: 8,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.45)',
  },
  navCenter: { alignItems: 'center' },
  navTitle: { fontSize: Typography.base, fontWeight: Typography.bold, color: Colors.textPrimary },
  navSub: { fontSize: Typography.xs, color: Colors.textMuted, marginTop: 1 },
  content: { paddingHorizontal: Spacing.base, paddingBottom: Spacing.xxxl },

  // Summary card
  summaryOuter: {
    borderRadius: Radius.xxl,
    borderWidth: 1,
    marginBottom: Spacing.xl,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.45,
    shadowRadius: 30,
    elevation: 16,
  },
  summaryFill: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: Radius.xxl },
  summaryShimmer: { position: 'absolute', top: 0, left: 0, right: 0, height: 60 },
  summaryTopLine: {
    position: 'absolute',
    top: 0,
    left: Radius.xxl * 0.5,
    right: Radius.xxl * 0.5,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.52)',
  },
  summaryContent: { padding: Spacing.base },
  timesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: Spacing.base,
    paddingTop: Spacing.sm,
  },
  timeBlock: { alignItems: 'center', gap: Spacing.sm, flex: 1 },
  timeIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  timeLabel: { fontSize: Typography.xs, color: Colors.textMuted, fontWeight: Typography.medium },
  timeValue: { fontSize: Typography.md, fontWeight: Typography.extraBold, color: Colors.textPrimary },
  durationCenter: { alignItems: 'center', flex: 1 },
  durationBig: { fontSize: Typography.xxl, fontWeight: Typography.extraBold, letterSpacing: -0.5 },
  durationLabel: { fontSize: Typography.xs, color: Colors.textMuted, marginTop: 2 },
  divider: { height: 1, backgroundColor: Colors.glassBorder, marginVertical: Spacing.md },
  ratingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  moodBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  moodEmoji: { fontSize: Typography.base },
  moodLabel: { fontSize: Typography.sm, color: Colors.textSecondary, fontWeight: Typography.medium },

  // Dreams
  dreamsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  sectionTitle: { fontSize: Typography.base, fontWeight: Typography.extraBold, color: Colors.textPrimary, letterSpacing: -0.2 },
  sectionSub: { fontSize: Typography.xs, color: Colors.textMuted, marginTop: 2 },
  addDreamBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 8,
  },
  addDreamText: { fontSize: Typography.sm, fontWeight: Typography.semiBold, color: Colors.textOnPrimary },

  // Empty dreams
  emptyDreamsOuter: {
    borderRadius: Radius.xxl,
    borderWidth: 1,
    borderStyle: 'dashed',
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.30,
    shadowRadius: 18,
    elevation: 8,
  },
  emptyFill: { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: Radius.xxl },
  emptyShimmer: { position: 'absolute', top: 0, left: 0, right: 0, height: 50 },
  emptyTopLine: {
    position: 'absolute',
    top: 0,
    left: Radius.xxl * 0.5,
    right: Radius.xxl * 0.5,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.38)',
  },
  emptyContent: { padding: Spacing.xxl, alignItems: 'center', gap: Spacing.md },
  emptyDreamIcon: {
    width: 64,
    height: 64,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  emptyDreamsTitle: { fontSize: Typography.base, fontWeight: Typography.bold, color: Colors.textSecondary },
  emptyDreamsText: {
    fontSize: Typography.sm,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: Typography.sm * 1.65,
  },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md },
  notFound: { fontSize: Typography.base, color: Colors.textSecondary },
  backLink: { paddingHorizontal: Spacing.base, paddingVertical: Spacing.sm, borderRadius: Radius.md },
  backLinkText: { color: Colors.textOnPrimary, fontWeight: Typography.medium },
});
