import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { LiquidGlass } from '@/components/ui/LiquidGlass';
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
          <Pressable onPress={() => router.back()}>
            {({ pressed }) => (
              <LiquidGlass radius={Radius.md} tint={accent.primary} glowColor={accent.primary} intensity={85} pressed={pressed}>
                <Text style={[styles.backLinkText, { padding: Spacing.md, paddingHorizontal: Spacing.xl }]}>Go back</Text>
              </LiquidGlass>
            )}
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
        onPress: async () => { await deleteSession(session.id); router.back(); },
      },
    ]);
  };

  const handleDeleteDream = (dreamId: string) => {
    showAlert('Delete Dream', 'Remove this dream entry?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => { await updateSession({ ...session, dreams: session.dreams.filter((d) => d.id !== dreamId) }); },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={[styles.glow, { backgroundColor: accent.primary + '1C' }]} pointerEvents="none" />

      {/* Nav */}
      <View style={styles.nav}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          {({ pressed }) => (
            <LiquidGlass radius={Radius.full} intensity={85} pressed={pressed} style={styles.navBtn}>
              <MaterialIcons name="arrow-back" size={22} color={Colors.textPrimary} />
            </LiquidGlass>
          )}
        </Pressable>
        <View style={styles.navCenter}>
          <Text style={styles.navTitle}>{StorageService.formatDate(session.bedtime)}</Text>
          <Text style={styles.navSub}>{StorageService.formatDuration(session.durationMinutes)} sleep</Text>
        </View>
        <Pressable onPress={handleDeleteSession} hitSlop={8}>
          {({ pressed }) => (
            <LiquidGlass radius={Radius.full} tint={Colors.error} glowColor={Colors.error} intensity={75} pressed={pressed} style={styles.navBtn}>
              <MaterialIcons name="delete-outline" size={22} color={Colors.error} />
            </LiquidGlass>
          )}
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Sleep summary */}
        <LiquidGlass
          radius={Radius.xxl}
          tint={accent.primary}
          glowColor={accent.primary}
          intensity={92}
          style={styles.summaryCard}
        >
          <View style={styles.summaryContent}>
            <View style={styles.timesRow}>
              <View style={styles.timeBlock}>
                <LiquidGlass radius={Radius.md} tint={accent.primary} glowColor={accent.primary} intensity={80} style={styles.timeIcon}>
                  <View style={{ padding: 10 }}>
                    <MaterialIcons name="bedtime" size={18} color={accent.light} />
                  </View>
                </LiquidGlass>
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
                <LiquidGlass radius={Radius.md} tint={Colors.accent} glowColor={Colors.accent} intensity={80} style={styles.timeIcon}>
                  <View style={{ padding: 10 }}>
                    <MaterialIcons name="wb-sunny" size={18} color={Colors.accent} />
                  </View>
                </LiquidGlass>
                <Text style={styles.timeLabel}>Wake up</Text>
                <Text style={styles.timeValue}>{StorageService.formatTime(session.wakeTime)}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.ratingRow}>
              <StarRating value={session.qualityRating} readonly size={24} />
              {mood ? (
                <LiquidGlass radius={Radius.full} tint={accent.primary} intensity={75} style={styles.moodBadge}>
                  <View style={styles.moodBadgeContent}>
                    <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                    <Text style={styles.moodLabel}>{mood.label}</Text>
                  </View>
                </LiquidGlass>
              ) : null}
            </View>
          </View>
        </LiquidGlass>

        {/* Dreams header */}
        <View style={styles.dreamsHeader}>
          <View>
            <Text style={styles.sectionTitle}>Dreams</Text>
            <Text style={styles.sectionSub}>{session.dreams.length} recorded this night</Text>
          </View>
          <Pressable onPress={() => router.push({ pathname: '/dream/edit', params: { sessionId: session.id } })}>
            {({ pressed }) => (
              <LiquidGlass radius={Radius.lg} tint={accent.primary} glowColor={accent.primary} intensity={88} pressed={pressed} style={styles.addDreamBtn}>
                <LinearGradient
                  colors={[accent.primary + 'BB', accent.primaryDark + '99']}
                  style={[StyleSheet.absoluteFill, { borderRadius: Radius.lg }]}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                  pointerEvents="none"
                />
                <MaterialIcons name="add" size={18} color="#fff" />
                <Text style={styles.addDreamText}>Add Dream</Text>
              </LiquidGlass>
            )}
          </Pressable>
        </View>

        {session.dreams.length === 0 ? (
          <Pressable onPress={() => router.push({ pathname: '/dream/edit', params: { sessionId: session.id } })}>
            {({ pressed }) => (
              <LiquidGlass radius={Radius.xxl} tint={accent.primary} glowColor={accent.primary} intensity={82} pressed={pressed} style={styles.emptyDreams}>
                <View style={styles.emptyContent}>
                  <LiquidGlass radius={Radius.full} tint={accent.primary} intensity={80} style={styles.emptyIcon}>
                    <View style={{ padding: Spacing.xl }}>
                      <MaterialIcons name="cloud" size={32} color={accent.primary} />
                    </View>
                  </LiquidGlass>
                  <Text style={styles.emptyDreamsTitle}>No dreams logged yet</Text>
                  <Text style={styles.emptyDreamsText}>Tap to write about the dreams you remember from this night.</Text>
                </View>
              </LiquidGlass>
            )}
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
  glow: { position: 'absolute', width: 320, height: 320, borderRadius: 160, top: -90, right: -70 },
  nav: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.base, paddingVertical: Spacing.md,
  },
  navBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  navCenter: { alignItems: 'center' },
  navTitle: { fontSize: Typography.base, fontWeight: Typography.bold, color: Colors.textPrimary },
  navSub: { fontSize: Typography.xs, color: Colors.textMuted, marginTop: 1 },
  content: { paddingHorizontal: Spacing.base, paddingBottom: Spacing.xxxl },

  summaryCard: { marginBottom: Spacing.xl },
  summaryContent: { padding: Spacing.base },
  timesRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: Spacing.sm },
  timeBlock: { alignItems: 'center', gap: Spacing.sm, flex: 1 },
  timeIcon: { alignItems: 'center', justifyContent: 'center' },
  timeLabel: { fontSize: Typography.xs, color: Colors.textMuted, fontWeight: Typography.medium },
  timeValue: { fontSize: Typography.md, fontWeight: Typography.extraBold, color: Colors.textPrimary },
  durationCenter: { alignItems: 'center', flex: 1 },
  durationBig: { fontSize: Typography.xxl, fontWeight: Typography.extraBold, letterSpacing: -0.5 },
  durationLabel: { fontSize: Typography.xs, color: Colors.textMuted, marginTop: 2 },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.08)', marginVertical: Spacing.md },
  ratingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  moodBadge: {},
  moodBadgeContent: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs + 2 },
  moodEmoji: { fontSize: Typography.base },
  moodLabel: { fontSize: Typography.sm, color: Colors.textSecondary, fontWeight: Typography.medium },

  dreamsHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.md },
  sectionTitle: { fontSize: Typography.base, fontWeight: Typography.extraBold, color: Colors.textPrimary, letterSpacing: -0.2 },
  sectionSub: { fontSize: Typography.xs, color: Colors.textMuted, marginTop: 2 },
  addDreamBtn: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  addDreamText: { fontSize: Typography.sm, fontWeight: Typography.semiBold, color: '#fff' },

  emptyDreams: { borderStyle: 'dashed' },
  emptyContent: { padding: Spacing.xxl, alignItems: 'center', gap: Spacing.md },
  emptyIcon: {},
  emptyDreamsTitle: { fontSize: Typography.base, fontWeight: Typography.bold, color: Colors.textSecondary },
  emptyDreamsText: { fontSize: Typography.sm, color: Colors.textMuted, textAlign: 'center', lineHeight: Typography.sm * 1.65 },

  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md },
  notFound: { fontSize: Typography.base, color: Colors.textSecondary },
  backLinkText: { color: Colors.textPrimary, fontWeight: Typography.medium },
});
