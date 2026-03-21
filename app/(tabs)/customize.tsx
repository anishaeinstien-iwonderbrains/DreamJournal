import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { Colors, Typography, Spacing, Radius, ACCENT_COLORS } from '@/constants/theme';
import { useAlert } from '@/template';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSessions } from '@/hooks/useSessions';

/** Reusable glass section card */
function GlassSection({ children, accentColor }: { children: React.ReactNode; accentColor: string }) {
  return (
    <View style={[sec.outer, { borderColor: accentColor + '25', shadowColor: accentColor }]}>
      <BlurView intensity={60} tint="dark" style={[StyleSheet.absoluteFill, { borderRadius: Radius.xl }]} />
      <View style={[StyleSheet.absoluteFill, sec.fill]} />
      <LinearGradient
        colors={[accentColor + '0E', 'transparent']}
        style={[StyleSheet.absoluteFill, { borderRadius: Radius.xl }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0.65 }}
        pointerEvents="none"
      />
      <LinearGradient
        colors={['rgba(255,255,255,0.26)', 'rgba(255,255,255,0.00)']}
        style={[sec.shimmer, { borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl }]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        pointerEvents="none"
      />
      <View style={sec.topLine} />
      <View style={sec.content}>{children}</View>
    </View>
  );
}

const sec = StyleSheet.create({
  outer: {
    borderRadius: Radius.xl, borderWidth: 1, overflow: 'hidden', marginBottom: Spacing.xl,
    shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.32, shadowRadius: 18, elevation: 10,
  },
  fill: { backgroundColor: 'rgba(255,255,255,0.055)', borderRadius: Radius.xl },
  shimmer: { position: 'absolute', top: 0, left: 0, right: 0, height: 48 },
  topLine: {
    position: 'absolute', top: 0, left: Radius.xl * 0.5, right: Radius.xl * 0.5,
    height: 1, backgroundColor: 'rgba(255,255,255,0.48)',
  },
  content: { padding: Spacing.base, gap: Spacing.md },
});

export default function CustomizeScreen() {
  const { settings, accent, updateSettings } = useTheme();
  const { refresh } = useSessions();
  const { showAlert } = useAlert();
  const [nameInput, setNameInput] = useState(settings.userName);

  const handleSaveName = () => updateSettings({ userName: nameInput.trim() });

  const handleClearData = () => {
    showAlert(
      'Clear All Data',
      'This will permanently delete all your sleep sessions and dreams. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('dream_journal_sessions');
            await refresh();
            showAlert('Cleared', 'All data has been removed.');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={[styles.glow, { backgroundColor: accent.primary + '18' }]} pointerEvents="none" />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>Settings</Text>
        <Text style={styles.pageSubtitle}>Personalize your dream journal</Text>

        {/* ── Profile ── */}
        <Text style={styles.sectionLabel}>Profile</Text>
        <GlassSection accentColor={accent.primary}>
          <View style={styles.avatarRow}>
            <View style={[styles.avatarCircle, { backgroundColor: accent.primary + '28', borderColor: accent.primary + '55', shadowColor: accent.primary }]}>
              <LinearGradient
                colors={['rgba(255,255,255,0.28)', 'rgba(255,255,255,0.00)']}
                style={[StyleSheet.absoluteFill, { borderRadius: Radius.full }]}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 0.55 }}
                pointerEvents="none"
              />
              <Text style={styles.avatarEmoji}>🌙</Text>
            </View>
          </View>
          <Text style={styles.fieldLabel}>Your Name</Text>
          <View style={styles.nameInputRow}>
            <View style={[styles.nameInputOuter, { borderColor: Colors.glassBorder }]}>
              <BlurView intensity={45} tint="dark" style={[StyleSheet.absoluteFill, { borderRadius: Radius.md }]} />
              <View style={[StyleSheet.absoluteFill, styles.inputFill, { borderRadius: Radius.md }]} />
              <TextInput
                style={styles.nameInput}
                value={nameInput}
                onChangeText={setNameInput}
                placeholder="Enter your name..."
                placeholderTextColor={Colors.textMuted}
                returnKeyType="done"
                onSubmitEditing={handleSaveName}
                maxLength={24}
              />
            </View>
            <Pressable
              onPress={handleSaveName}
              style={({ pressed }) => [
                styles.saveNameBtn,
                { backgroundColor: accent.primary, shadowColor: accent.primary },
                pressed && { opacity: 0.8 },
              ]}
            >
              <LinearGradient
                colors={['rgba(255,255,255,0.28)', 'rgba(255,255,255,0.00)']}
                style={[StyleSheet.absoluteFill, { borderRadius: Radius.md }]}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 0.55 }}
                pointerEvents="none"
              />
              <MaterialIcons name="check" size={18} color={Colors.textOnPrimary} />
            </Pressable>
          </View>
          <Text style={styles.fieldHint}>Shown on your journal home screen</Text>
        </GlassSection>

        {/* ── Theme ── */}
        <Text style={styles.sectionLabel}>Theme Color</Text>
        <GlassSection accentColor={accent.primary}>
          <Text style={styles.themeDesc}>Choose your journal's accent colour</Text>
          {ACCENT_COLORS.map((a) => {
            const isSelected = settings.accentId === a.id;
            return (
              <Pressable
                key={a.id}
                onPress={() => updateSettings({ accentId: a.id })}
                style={({ pressed }) => [
                  styles.accentRowOuter,
                  isSelected
                    ? { borderColor: a.light + '60', shadowColor: a.primary }
                    : { borderColor: Colors.glassBorder },
                  pressed && { opacity: 0.8 },
                ]}
              >
                {/* mini blur per-row */}
                <BlurView intensity={isSelected ? 55 : 35} tint="dark" style={[StyleSheet.absoluteFill, { borderRadius: Radius.lg }]} />
                <View style={[StyleSheet.absoluteFill, styles.inputFill, { borderRadius: Radius.lg }]} />
                {isSelected ? (
                  <LinearGradient
                    colors={[a.primary + '22', 'transparent']}
                    style={[StyleSheet.absoluteFill, { borderRadius: Radius.lg }]}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                    pointerEvents="none"
                  />
                ) : null}
                <LinearGradient
                  colors={['rgba(255,255,255,0.18)', 'rgba(255,255,255,0.00)']}
                  style={[styles.rowShimmer, { borderTopLeftRadius: Radius.lg, borderTopRightRadius: Radius.lg }]}
                  start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }}
                  pointerEvents="none"
                />
                {isSelected ? (
                  <View style={[styles.rowTopLine, { backgroundColor: a.light + '55' }]} />
                ) : null}
                <View style={[styles.accentSwatch, { backgroundColor: a.primary, shadowColor: a.primary }]}>
                  <LinearGradient
                    colors={['rgba(255,255,255,0.35)', 'rgba(255,255,255,0.00)']}
                    style={[StyleSheet.absoluteFill, { borderRadius: Radius.md }]}
                    start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 0.6 }}
                    pointerEvents="none"
                  />
                  <View style={[styles.accentSwatchDot, { backgroundColor: a.accent }]} />
                </View>
                <Text style={[styles.accentLabel, isSelected && { color: a.light }]}>{a.label}</Text>
                {isSelected ? <MaterialIcons name="check-circle" size={18} color={a.light} /> : null}
              </Pressable>
            );
          })}
        </GlassSection>

        {/* ── Display ── */}
        <Text style={styles.sectionLabel}>Display</Text>
        <GlassSection accentColor={accent.primary}>
          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <View style={[styles.toggleIcon, { backgroundColor: accent.primary + '20' }]}>
                <Text style={{ fontSize: 16 }}>🌕</Text>
              </View>
              <View>
                <Text style={styles.toggleLabel}>Moon Phase</Text>
                <Text style={styles.toggleSub}>Show current moon phase on home</Text>
              </View>
            </View>
            <Switch
              value={settings.showMoonPhase}
              onValueChange={(v) => updateSettings({ showMoonPhase: v })}
              trackColor={{ false: Colors.surface, true: accent.primary + '90' }}
              thumbColor={settings.showMoonPhase ? accent.light : Colors.textMuted}
            />
          </View>
        </GlassSection>

        {/* ── Live Preview ── */}
        <Text style={styles.sectionLabel}>Preview</Text>
        <View style={[styles.previewOuter, { borderColor: accent.primary + '38', shadowColor: accent.primary }]}>
          <BlurView intensity={65} tint="dark" style={[StyleSheet.absoluteFill, { borderRadius: Radius.xl }]} />
          <View style={[StyleSheet.absoluteFill, styles.inputFill, { borderRadius: Radius.xl }]} />
          <LinearGradient
            colors={[accent.primary + '16', 'transparent']}
            style={[StyleSheet.absoluteFill, { borderRadius: Radius.xl }]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0.7 }}
            pointerEvents="none"
          />
          <LinearGradient
            colors={['rgba(255,255,255,0.30)', 'rgba(255,255,255,0.00)']}
            style={[styles.previewShimmer, { borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl }]}
            start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }}
            pointerEvents="none"
          />
          <View style={styles.previewTopLine} />
          {/* Left glow stripe */}
          <View style={[styles.previewStripe, { backgroundColor: accent.primary, shadowColor: accent.primary }]} />
          <View style={styles.previewInner}>
            <View style={styles.previewHeader}>
              <Text style={styles.previewDate}>Tonight, Jan 15</Text>
              <View style={[styles.previewBadge, { backgroundColor: accent.accent + '22', borderColor: accent.accent + '55' }]}>
                <Text style={[styles.previewBadgeText, { color: accent.accent }]}>7h 30m</Text>
              </View>
            </View>
            <View style={[styles.previewBar, { backgroundColor: accent.primary + '10', borderColor: accent.primary + '30' }]}>
              <Text style={[styles.previewTime, { color: accent.light }]}>11:00 PM → 6:30 AM</Text>
            </View>
            <View style={styles.previewTags}>
              {['Lucid', 'Vivid'].map((t) => (
                <View key={t} style={[styles.previewTag, { backgroundColor: accent.primary + '20', borderColor: accent.primary + '50' }]}>
                  <Text style={[styles.previewTagText, { color: accent.light }]}>{t}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* ── Data ── */}
        <Text style={styles.sectionLabel}>Data</Text>
        <GlassSection accentColor={Colors.error}>
          <Pressable
            onPress={handleClearData}
            style={({ pressed }) => [styles.dangerBtn, pressed && { opacity: 0.8 }]}
          >
            <MaterialIcons name="delete-forever" size={20} color={Colors.error} />
            <Text style={styles.dangerText}>Clear All Journal Data</Text>
          </Pressable>
          <Text style={styles.dangerHint}>Permanently deletes all sleep sessions and dreams</Text>
        </GlassSection>

        <Text style={styles.version}>Dream Journal v1.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  glow: {
    position: 'absolute', width: 280, height: 280, borderRadius: 140, top: -60, left: -60,
  },
  content: { paddingHorizontal: Spacing.base, paddingBottom: Spacing.xxxl },
  pageTitle: {
    fontSize: Typography.xxl, fontWeight: Typography.extraBold, color: Colors.textPrimary,
    paddingTop: Spacing.md, marginBottom: 2, letterSpacing: -0.5,
  },
  pageSubtitle: { fontSize: Typography.sm, color: Colors.textMuted, marginBottom: Spacing.xl, fontWeight: Typography.medium },
  sectionLabel: {
    fontSize: Typography.xs, fontWeight: Typography.bold, color: Colors.textMuted,
    textTransform: 'uppercase', letterSpacing: 1, marginBottom: Spacing.sm, marginLeft: Spacing.xs,
  },

  // Profile
  avatarRow: { alignItems: 'center', marginBottom: Spacing.xs },
  avatarCircle: {
    width: 64, height: 64, borderRadius: Radius.full, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, overflow: 'hidden',
    shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.55, shadowRadius: 14, elevation: 8,
  },
  avatarEmoji: { fontSize: 28 },
  fieldLabel: { fontSize: Typography.sm, fontWeight: Typography.semiBold, color: Colors.textSecondary },
  nameInputRow: { flexDirection: 'row', gap: Spacing.sm },
  nameInputOuter: {
    flex: 1, borderRadius: Radius.md, borderWidth: 1, overflow: 'hidden',
  },
  inputFill: { backgroundColor: 'rgba(255,255,255,0.055)' },
  nameInput: {
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.md,
    fontSize: Typography.base, color: Colors.textPrimary,
  },
  saveNameBtn: {
    width: 48, height: 48, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.50, shadowRadius: 12, elevation: 8,
  },
  fieldHint: { fontSize: Typography.xs, color: Colors.textMuted },

  // Theme accent rows
  themeDesc: { fontSize: Typography.sm, color: Colors.textSecondary },
  accentRowOuter: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    padding: Spacing.md, borderRadius: Radius.lg, borderWidth: 1, overflow: 'hidden',
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 10, elevation: 5,
  },
  rowShimmer: { position: 'absolute', top: 0, left: 0, right: 0, height: 36 },
  rowTopLine: { position: 'absolute', top: 0, left: Radius.lg * 0.5, right: Radius.lg * 0.5, height: 1 },
  accentSwatch: {
    width: 36, height: 36, borderRadius: Radius.md, alignItems: 'flex-end', justifyContent: 'flex-end',
    padding: 4, overflow: 'hidden',
    shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.60, shadowRadius: 8, elevation: 5,
  },
  accentSwatchDot: { width: 12, height: 12, borderRadius: 6 },
  accentLabel: { flex: 1, fontSize: Typography.base, fontWeight: Typography.semiBold, color: Colors.textSecondary },

  // Toggle
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.base },
  toggleInfo: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, flex: 1 },
  toggleIcon: { width: 40, height: 40, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  toggleLabel: { fontSize: Typography.base, fontWeight: Typography.semiBold, color: Colors.textPrimary },
  toggleSub: { fontSize: Typography.xs, color: Colors.textMuted, marginTop: 2 },

  // Preview card
  previewOuter: {
    borderRadius: Radius.xl, borderWidth: 1, overflow: 'hidden', flexDirection: 'row', marginBottom: Spacing.xl,
    shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.40, shadowRadius: 22, elevation: 12,
  },
  previewShimmer: { position: 'absolute', top: 0, left: 0, right: 0, height: 50 },
  previewTopLine: {
    position: 'absolute', top: 0, left: Radius.xl * 0.5, right: Radius.xl * 0.5,
    height: 1, backgroundColor: 'rgba(255,255,255,0.50)',
  },
  previewStripe: {
    width: 3,
    shadowOffset: { width: 3, height: 0 }, shadowOpacity: 0.90, shadowRadius: 10, elevation: 5,
  },
  previewInner: { flex: 1, padding: Spacing.base, gap: Spacing.sm },
  previewHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  previewDate: { fontSize: Typography.base, fontWeight: Typography.bold, color: Colors.textPrimary },
  previewBadge: {
    paddingHorizontal: Spacing.sm + 2, paddingVertical: 4, borderRadius: Radius.full, borderWidth: 1,
  },
  previewBadgeText: { fontSize: Typography.xs, fontWeight: Typography.bold },
  previewBar: {
    borderRadius: Radius.md, paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md,
    borderWidth: 1, alignItems: 'center',
  },
  previewTime: { fontSize: Typography.sm, fontWeight: Typography.semiBold },
  previewTags: { flexDirection: 'row', gap: Spacing.xs },
  previewTag: { paddingHorizontal: Spacing.sm + 2, paddingVertical: 3, borderRadius: Radius.full, borderWidth: 1 },
  previewTagText: { fontSize: Typography.xs, fontWeight: Typography.semiBold },

  // Danger
  dangerBtn: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.sm },
  dangerText: { fontSize: Typography.base, fontWeight: Typography.semiBold, color: Colors.error },
  dangerHint: { fontSize: Typography.xs, color: Colors.textMuted },
  version: { textAlign: 'center', fontSize: Typography.xs, color: Colors.textMuted, marginTop: Spacing.xl },
});
