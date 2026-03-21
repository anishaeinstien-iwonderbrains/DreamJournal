import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useSessions } from '@/hooks/useSessions';
import { useTheme } from '@/hooks/useTheme';
import { SessionCard } from '@/components/feature/SessionCard';
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';

const MOON_PHASES = ['🌑', '🌒', '🌓', '🌔', '🌕', '🌖', '🌗', '🌘'];
function getMoonPhase(): string {
  return MOON_PHASES[Math.floor((new Date().getDate() / 30) * 8) % 8];
}

export default function JournalHome() {
  const router = useRouter();
  const { sessions, loading } = useSessions();
  const { accent, settings } = useTheme();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Deep radial glows */}
      <View style={[styles.glow1, { backgroundColor: accent.primary + '22' }]} pointerEvents="none" />
      <View style={[styles.glow2, { backgroundColor: accent.accent + '0E' }]} pointerEvents="none" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.titleRow}>
            {settings.showMoonPhase && <Text style={styles.moonEmoji}>{getMoonPhase()}</Text>}
            <Text style={styles.appTitle}>
              {settings.userName ? `${settings.userName}'s Dreams` : 'Dream Journal'}
            </Text>
          </View>
          <Text style={styles.subtitle}>
            {sessions.length === 0
              ? 'Start recording your dreams'
              : `${sessions.length} night${sessions.length !== 1 ? 's' : ''} · ${sessions.reduce((a, s) => a + s.dreams.length, 0)} dreams`}
          </Text>
        </View>
        <Pressable
          onPress={() => router.push('/session/new')}
          style={({ pressed }) => [
            styles.addBtn,
            { backgroundColor: accent.primary, shadowColor: accent.primary },
            pressed && { opacity: 0.82, transform: [{ scale: 0.90 }] },
          ]}
        >
          {/* Glass reflection on button */}
          <LinearGradient
            colors={['rgba(255,255,255,0.30)', 'rgba(255,255,255,0.00)']}
            style={[StyleSheet.absoluteFill, { borderRadius: Radius.full }]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 0.5 }}
            pointerEvents="none"
          />
          <MaterialIcons name="add" size={28} color={Colors.textOnPrimary} />
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={accent.light} size="large" />
        </View>
      ) : sessions.length === 0 ? (
        <View style={styles.emptyState}>
          <Image
            source={require('@/assets/images/empty-dreams.png')}
            style={styles.emptyImage}
            contentFit="contain"
            transition={300}
          />
          <Text style={styles.emptyTitle}>No dreams yet</Text>
          <Text style={styles.emptyText}>
            Tap the + button to log your first sleep session and start your dream journal.
          </Text>
          <Pressable
            onPress={() => router.push('/session/new')}
            style={({ pressed }) => [
              styles.emptyBtn,
              { backgroundColor: accent.primary, shadowColor: accent.primary },
              pressed && { opacity: 0.8 },
            ]}
          >
            <LinearGradient
              colors={['rgba(255,255,255,0.25)', 'rgba(255,255,255,0.00)']}
              style={[StyleSheet.absoluteFill, { borderRadius: Radius.lg }]}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 0.55 }}
              pointerEvents="none"
            />
            <MaterialIcons name="bedtime" size={20} color={Colors.textOnPrimary} />
            <Text style={styles.emptyBtnText}>Log Sleep Session</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={sessions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <SessionCard
              session={item}
              onPress={() => router.push({ pathname: '/session/[id]', params: { id: item.id } })}
            />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            /* Stats bar — true glass */
            <View
              style={[
                styles.statsOuter,
                { borderColor: accent.primary + '28', shadowColor: accent.primary },
              ]}
            >
              <BlurView intensity={60} tint="dark" style={[StyleSheet.absoluteFill, { borderRadius: Radius.xl }]} />
              <View style={[StyleSheet.absoluteFill, styles.statsFill]} />
              <LinearGradient
                colors={[accent.primary + '14', 'transparent']}
                style={[StyleSheet.absoluteFill, { borderRadius: Radius.xl }]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                pointerEvents="none"
              />
              <LinearGradient
                colors={['rgba(255,255,255,0.26)', 'rgba(255,255,255,0.00)']}
                style={[styles.statsShimmer, { borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl }]}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                pointerEvents="none"
              />
              <View style={styles.statsTopLine} />

              <View style={styles.statsContent}>
                <View style={styles.statItem}>
                  <Text style={[styles.statNum, { color: accent.light }]}>{sessions.length}</Text>
                  <Text style={styles.statLabel}>nights</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={[styles.statNum, { color: accent.light }]}>
                    {sessions.reduce((a, s) => a + s.dreams.length, 0)}
                  </Text>
                  <Text style={styles.statLabel}>dreams</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={[styles.statNum, { color: accent.light }]}>
                    {sessions.length > 0
                      ? (sessions.reduce((a, s) => a + s.qualityRating, 0) / sessions.length).toFixed(1)
                      : '—'}
                  </Text>
                  <Text style={styles.statLabel}>avg quality</Text>
                </View>
              </View>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  glow1: {
    position: 'absolute',
    width: 340,
    height: 340,
    borderRadius: 170,
    top: -100,
    right: -80,
  },
  glow2: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    bottom: 120,
    left: -70,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.base,
  },
  headerLeft: { flex: 1, marginRight: Spacing.base },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  moonEmoji: { fontSize: 22 },
  appTitle: {
    fontSize: Typography.xl,
    fontWeight: Typography.extraBold,
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: Typography.xs,
    color: Colors.textMuted,
    marginTop: 3,
    fontWeight: Typography.medium,
  },
  addBtn: {
    width: 52,
    height: 52,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.55,
    shadowRadius: 18,
    elevation: 12,
  },
  list: {
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.xxxl,
    paddingTop: Spacing.sm,
  },
  // Stats bar
  statsOuter: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    marginBottom: Spacing.base,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.40,
    shadowRadius: 20,
    elevation: 10,
  },
  statsFill: {
    backgroundColor: 'rgba(255,255,255,0.055)',
    borderRadius: Radius.xl,
  },
  statsShimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 46,
  },
  statsTopLine: {
    position: 'absolute',
    top: 0,
    left: Radius.xl * 0.5,
    right: Radius.xl * 0.5,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.50)',
  },
  statsContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.base,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statNum: { fontSize: Typography.xl, fontWeight: Typography.extraBold, letterSpacing: -0.5 },
  statLabel: { fontSize: Typography.xs, color: Colors.textMuted, fontWeight: Typography.medium, marginTop: 1 },
  statDivider: { width: 1, height: 28, backgroundColor: Colors.glassBorder },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xxl,
    gap: Spacing.base,
  },
  emptyImage: { width: 200, height: 200, marginBottom: Spacing.md },
  emptyTitle: { fontSize: Typography.xl, fontWeight: Typography.extraBold, color: Colors.textPrimary },
  emptyText: {
    fontSize: Typography.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: Typography.base * 1.65,
  },
  emptyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
    marginTop: Spacing.sm,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.50,
    shadowRadius: 16,
    elevation: 10,
  },
  emptyBtnText: { color: Colors.textOnPrimary, fontSize: Typography.base, fontWeight: Typography.semiBold },
});
