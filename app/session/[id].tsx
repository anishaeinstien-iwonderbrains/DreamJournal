import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useSessions } from '@/hooks/useSessions';
import { useTheme } from '@/hooks/useTheme';
import { StorageService } from '@/services/storage';
import { Colors, Typography, Spacing, Radius, Shadows, WAKE_MOODS } from '@/constants/theme';
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
          const updated = { ...session, dreams: session.dreams.filter((d) => d.id !== dreamId) };
          await updateSession(updated);
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Nav */}
      <View style={styles.nav}>
        <Pressable onPress={() => router.back()} hitSlop={8} style={styles.navBtn}>
          <MaterialIcons name="arrow-back" size={22} color={Colors.textPrimary} />
        </Pressable>
        <View style={styles.navCenter}>
          <Text style={styles.navTitle}>{StorageService.formatDate(session.bedtime)}</Text>
          <Text style={styles.navSub}>{StorageService.formatDuration(session.durationMinutes)} sleep</Text>
        </View>
        <Pressable onPress={handleDeleteSession} hitSlop={8} style={styles.navBtn}>
          <MaterialIcons name="delete-outline" size={22} color={Colors.error + 'CC'} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Sleep summary card */}
        <View style={[styles.summaryCard, { borderColor: accent.primary + '40' }]}>
          {/* Ambient glow top */}
          <View style={[styles.glowTop, { backgroundColor: accent.primary + '15' }]} />

          <View style={styles.timesRow}>
            <View style={styles.timeBlock}>
              <View style={[styles.timeIcon, { backgroundColor: accent.primary + '20' }]}>
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
              <View style={[styles.timeIcon, { backgroundColor: Colors.accent + '20' }]}>
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
              <View style={[styles.moodBadge, { backgroundColor: accent.primary + '20', borderColor: accent.primary + '40' }]}>
                <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                <Text style={styles.moodLabel}>{mood.label}</Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* Dreams section header */}
        <View style={styles.dreamsHeader}>
          <View>
            <Text style={styles.sectionTitle}>Dreams</Text>
            <Text style={styles.sectionSub}>{session.dreams.length} recorded this night</Text>
          </View>
          <Pressable
            onPress={() => router.push({ pathname: '/dream/edit', params: { sessionId: session.id } })}
            style={({ pressed }) => [styles.addDreamBtn, { backgroundColor: accent.primary }, pressed && { opacity: 0.8 }]}
          >
            <MaterialIcons name="add" size={18} color={Colors.textOnPrimary} />
            <Text style={styles.addDreamText}>Add Dream</Text>
          </Pressable>
        </View>

        {session.dreams.length === 0 ? (
          <Pressable
            onPress={() => router.push({ pathname: '/dream/edit', params: { sessionId: session.id } })}
            style={({ pressed }) => [styles.emptyDreams, { borderColor: accent.primary + '40' }, pressed && { opacity: 0.8 }]}
          >
            <View style={[styles.emptyDreamIcon, { backgroundColor: accent.primary + '15' }]}>
              <MaterialIcons name="cloud" size={32} color={accent.primary} />
            </View>
            <Text style={styles.emptyDreamsTitle}>No dreams logged yet</Text>
            <Text style={styles.emptyDreamsText}>Tap to write about the dreams you remember from this night.</Text>
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
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
  },
  navBtn: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  navCenter: { alignItems: 'center' },
  navTitle: {
    fontSize: Typography.base,
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
  },
  navSub: {
    fontSize: Typography.xs,
    color: Colors.textMuted,
    marginTop: 1,
  },
  content: { paddingHorizontal: Spacing.base, paddingBottom: Spacing.xxxl },
  summaryCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.xxl,
    padding: Spacing.base,
    borderWidth: 1,
    marginBottom: Spacing.xl,
    overflow: 'hidden',
    ...Shadows.lg,
  },
  glowTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 60,
    borderTopLeftRadius: Radius.xxl,
    borderTopRightRadius: Radius.xxl,
  },
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
  },
  timeLabel: { fontSize: Typography.xs, color: Colors.textMuted, fontWeight: Typography.medium },
  timeValue: {
    fontSize: Typography.md,
    fontWeight: Typography.extraBold,
    color: Colors.textPrimary,
  },
  durationCenter: { alignItems: 'center', flex: 1 },
  durationBig: {
    fontSize: Typography.xxl,
    fontWeight: Typography.extraBold,
    letterSpacing: -0.5,
  },
  durationLabel: { fontSize: Typography.xs, color: Colors.textMuted, marginTop: 2 },
  divider: { height: 1, backgroundColor: Colors.glassBorder, marginVertical: Spacing.md },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
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
  dreamsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.base,
    fontWeight: Typography.extraBold,
    color: Colors.textPrimary,
    letterSpacing: -0.2,
  },
  sectionSub: { fontSize: Typography.xs, color: Colors.textMuted, marginTop: 2 },
  addDreamBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.lg,
    ...Shadows.sm,
  },
  addDreamText: {
    fontSize: Typography.sm,
    fontWeight: Typography.semiBold,
    color: Colors.textOnPrimary,
  },
  emptyDreams: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.xxl,
    padding: Spacing.xxl,
    alignItems: 'center',
    gap: Spacing.md,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  emptyDreamIcon: {
    width: 64,
    height: 64,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyDreamsTitle: {
    fontSize: Typography.base,
    fontWeight: Typography.bold,
    color: Colors.textSecondary,
  },
  emptyDreamsText: {
    fontSize: Typography.sm,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: Typography.sm * 1.65,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
  },
  notFound: { fontSize: Typography.base, color: Colors.textSecondary },
  backLink: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
  },
  backLinkText: { color: Colors.textOnPrimary, fontWeight: Typography.medium },
});
