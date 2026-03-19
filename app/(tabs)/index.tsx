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
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useSessions } from '@/hooks/useSessions';
import { useTheme } from '@/hooks/useTheme';
import { SessionCard } from '@/components/feature/SessionCard';
import { Colors, Typography, Spacing, Radius, Shadows } from '@/constants/theme';

const MOON_PHASES = ['🌑', '🌒', '🌓', '🌔', '🌕', '🌖', '🌗', '🌘'];

function getMoonPhase(): string {
  const now = new Date();
  const idx = Math.floor((now.getDate() / 30) * 8) % 8;
  return MOON_PHASES[idx];
}

export default function JournalHome() {
  const router = useRouter();
  const { sessions, loading } = useSessions();
  const { accent, settings } = useTheme();
  const moonPhase = getMoonPhase();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.titleRow}>
            {settings.showMoonPhase && <Text style={styles.moonEmoji}>{moonPhase}</Text>}
            <Text style={styles.appTitle}>
              {settings.userName ? `${settings.userName}'s Dreams` : 'Dream Journal'}
            </Text>
          </View>
          <Text style={styles.subtitle}>
            {sessions.length === 0
              ? 'Start recording your dreams'
              : `${sessions.length} night${sessions.length !== 1 ? 's' : ''} • ${sessions.reduce((a, s) => a + s.dreams.length, 0)} dreams`}
          </Text>
        </View>
        <Pressable
          onPress={() => router.push('/session/new')}
          style={({ pressed }) => [
            styles.addBtn,
            { backgroundColor: accent.primary },
            pressed && { opacity: 0.85, transform: [{ scale: 0.94 }] },
          ]}
        >
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
              { backgroundColor: accent.primary },
              pressed && { opacity: 0.8 },
            ]}
          >
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
            <View style={[styles.statsBar, { borderColor: accent.primary + '30' }]}>
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
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.base,
  },
  headerLeft: {
    flex: 1,
    marginRight: Spacing.base,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  moonEmoji: {
    fontSize: 22,
  },
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
    ...Shadows.lg,
  },
  list: {
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.xxxl,
    paddingTop: Spacing.sm,
  },
  statsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.xl,
    borderWidth: 1,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.base,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNum: {
    fontSize: Typography.xl,
    fontWeight: Typography.extraBold,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: Typography.xs,
    color: Colors.textMuted,
    fontWeight: Typography.medium,
    marginTop: 1,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: Colors.glassBorder,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xxl,
    gap: Spacing.base,
  },
  emptyImage: {
    width: 200,
    height: 200,
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
  emptyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
    marginTop: Spacing.sm,
    ...Shadows.md,
  },
  emptyBtnText: {
    color: Colors.textOnPrimary,
    fontSize: Typography.base,
    fontWeight: Typography.semiBold,
  },
});
