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
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useSessions } from '@/hooks/useSessions';
import { useTheme } from '@/hooks/useTheme';
import { SessionCard } from '@/components/feature/SessionCard';
import { LiquidGlass } from '@/components/ui/LiquidGlass';
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
      {/* Ambient background blobs */}
      <View style={[styles.blob1, { backgroundColor: accent.primary + '28' }]} pointerEvents="none" />
      <View style={[styles.blob2, { backgroundColor: accent.accent + '12' }]} pointerEvents="none" />
      <View style={[styles.blob3, { backgroundColor: '#40D8FF14' }]} pointerEvents="none" />

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

        {/* Add button — liquid glass pill */}
        <Pressable onPress={() => router.push('/session/new')} style={styles.addBtnWrap}>
          {({ pressed }) => (
            <LiquidGlass
              radius={Radius.full}
              tint={accent.primary}
              glowColor={accent.primary}
              intensity={90}
              pressed={pressed}
              style={styles.addBtn}
            >
              <LinearGradient
                colors={[accent.primary + 'CC', accent.primary + '99']}
                style={[StyleSheet.absoluteFill, { borderRadius: Radius.full }]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                pointerEvents="none"
              />
              <MaterialIcons name="add" size={28} color="#fff" />
            </LiquidGlass>
          )}
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
          <Pressable onPress={() => router.push('/session/new')} style={styles.emptyBtnWrap}>
            {({ pressed }) => (
              <LiquidGlass
                radius={Radius.lg}
                tint={accent.primary}
                glowColor={accent.primary}
                intensity={90}
                pressed={pressed}
                style={styles.emptyBtn}
              >
                <LinearGradient
                  colors={[accent.primary + 'CC', accent.primaryDark + 'BB']}
                  style={[StyleSheet.absoluteFill, { borderRadius: Radius.lg }]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  pointerEvents="none"
                />
                <MaterialIcons name="bedtime" size={20} color="#fff" />
                <Text style={styles.emptyBtnText}>Log Sleep Session</Text>
              </LiquidGlass>
            )}
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
            <LiquidGlass
              radius={Radius.xl}
              tint={accent.primary}
              glowColor={accent.primary}
              intensity={85}
              style={styles.statsCard}
            >
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
            </LiquidGlass>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },

  blob1: {
    position: 'absolute', width: 380, height: 380, borderRadius: 190, top: -130, right: -100,
  },
  blob2: {
    position: 'absolute', width: 260, height: 260, borderRadius: 130, bottom: 160, left: -90,
  },
  blob3: {
    position: 'absolute', width: 200, height: 200, borderRadius: 100, bottom: 80, right: 20,
  },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.base, paddingTop: Spacing.sm, paddingBottom: Spacing.base,
  },
  headerLeft: { flex: 1, marginRight: Spacing.base },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  moonEmoji: { fontSize: 22 },
  appTitle: {
    fontSize: Typography.xl, fontWeight: Typography.extraBold,
    color: Colors.textPrimary, letterSpacing: -0.3,
  },
  subtitle: { fontSize: Typography.xs, color: Colors.textMuted, marginTop: 3, fontWeight: Typography.medium },

  addBtnWrap: {},
  addBtn: { width: 52, height: 52, alignItems: 'center', justifyContent: 'center' },

  list: { paddingHorizontal: Spacing.base, paddingBottom: Spacing.xxxl, paddingTop: Spacing.sm },

  statsCard: { marginBottom: Spacing.base },
  statsContent: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.md, paddingHorizontal: Spacing.base,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statNum: { fontSize: Typography.xl, fontWeight: Typography.extraBold, letterSpacing: -0.5 },
  statLabel: { fontSize: Typography.xs, color: Colors.textMuted, fontWeight: Typography.medium, marginTop: 1 },
  statDivider: { width: 1, height: 28, backgroundColor: 'rgba(255,255,255,0.12)' },

  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyState: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: Spacing.xxl, gap: Spacing.base,
  },
  emptyImage: { width: 200, height: 200, marginBottom: Spacing.md },
  emptyTitle: { fontSize: Typography.xl, fontWeight: Typography.extraBold, color: Colors.textPrimary },
  emptyText: {
    fontSize: Typography.base, color: Colors.textSecondary,
    textAlign: 'center', lineHeight: Typography.base * 1.65,
  },
  emptyBtnWrap: {},
  emptyBtn: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md },
  emptyBtnText: { color: '#fff', fontSize: Typography.base, fontWeight: Typography.semiBold },
});
