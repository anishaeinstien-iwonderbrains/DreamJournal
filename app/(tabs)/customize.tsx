import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, TextInput, Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { LiquidGlass } from '@/components/ui/LiquidGlass';
import { useTheme } from '@/hooks/useTheme';
import { Colors, Typography, Spacing, Radius, ACCENT_COLORS } from '@/constants/theme';
import { useAlert } from '@/template';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSessions } from '@/hooks/useSessions';

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
      <View style={[styles.blob, { backgroundColor: accent.primary + '1A' }]} pointerEvents="none" />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>Settings</Text>
        <Text style={styles.pageSubtitle}>Personalize your dream journal</Text>

        {/* ── Profile ── */}
        <Text style={styles.sectionLabel}>Profile</Text>
        <LiquidGlass radius={Radius.xl} tint={accent.primary} glowColor={accent.primary} intensity={85} style={styles.section}>
          <View style={styles.avatarRow}>
            <LiquidGlass radius={Radius.full} tint={accent.primary} glowColor={accent.primary} intensity={90} style={styles.avatarCircle}>
              <LinearGradient
                colors={[accent.primary + 'AA', accent.primaryDark + '88']}
                style={[StyleSheet.absoluteFill, { borderRadius: Radius.full }]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                pointerEvents="none"
              />
              <View style={{ padding: 18 }}>
                <Text style={{ fontSize: 28 }}>🌙</Text>
              </View>
            </LiquidGlass>
          </View>
          <Text style={styles.fieldLabel}>Your Name</Text>
          <View style={styles.nameInputRow}>
            <LiquidGlass radius={Radius.md} intensity={75} style={styles.nameInputGlass}>
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
            </LiquidGlass>
            <Pressable onPress={handleSaveName} style={styles.saveNameWrap}>
              {({ pressed }) => (
                <LiquidGlass radius={Radius.md} tint={accent.primary} glowColor={accent.primary} intensity={90} pressed={pressed} style={styles.saveNameBtn}>
                  <LinearGradient
                    colors={[accent.primary + 'CC', accent.primaryDark + 'AA']}
                    style={[StyleSheet.absoluteFill, { borderRadius: Radius.md }]}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                    pointerEvents="none"
                  />
                  <MaterialIcons name="check" size={18} color="#fff" />
                </LiquidGlass>
              )}
            </Pressable>
          </View>
          <Text style={styles.fieldHint}>Shown on your journal home screen</Text>
        </LiquidGlass>

        {/* ── Theme Color ── */}
        <Text style={styles.sectionLabel}>Theme Color</Text>
        <LiquidGlass radius={Radius.xl} tint={accent.primary} glowColor={accent.primary} intensity={85} style={styles.section}>
          <Text style={styles.themeDesc}>Choose your accent colour</Text>
          {ACCENT_COLORS.map((a) => {
            const isSelected = settings.accentId === a.id;
            return (
              <Pressable key={a.id} onPress={() => updateSettings({ accentId: a.id })}>
                {({ pressed }) => (
                  <LiquidGlass
                    radius={Radius.lg}
                    tint={isSelected ? a.primary : undefined}
                    glowColor={isSelected ? a.primary : 'transparent'}
                    intensity={isSelected ? 82 : 60}
                    pressed={pressed}
                    style={styles.accentRow}
                  >
                    {isSelected && (
                      <LinearGradient
                        colors={[a.primary + '30', 'transparent']}
                        style={[StyleSheet.absoluteFill, { borderRadius: Radius.lg }]}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                        pointerEvents="none"
                      />
                    )}
                    {/* Swatch */}
                    <View style={[styles.swatch, { backgroundColor: a.primary, shadowColor: a.primary }]}>
                      <LinearGradient
                        colors={['rgba(255,255,255,0.40)', 'rgba(255,255,255,0.00)']}
                        style={[StyleSheet.absoluteFill, { borderRadius: Radius.md }]}
                        start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 0.65 }}
                        pointerEvents="none"
                      />
                      <View style={[styles.swatchDot, { backgroundColor: a.accent }]} />
                    </View>
                    <Text style={[styles.accentLabel, { color: isSelected ? a.light : Colors.textSecondary }]}>{a.label}</Text>
                    {isSelected ? <MaterialIcons name="check-circle" size={18} color={a.light} /> : null}
                  </LiquidGlass>
                )}
              </Pressable>
            );
          })}
        </LiquidGlass>

        {/* ── Display ── */}
        <Text style={styles.sectionLabel}>Display</Text>
        <LiquidGlass radius={Radius.xl} tint={accent.primary} glowColor={accent.primary} intensity={85} style={styles.section}>
          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <LiquidGlass radius={Radius.md} tint={accent.primary} intensity={75} style={styles.toggleIcon}>
                <View style={{ padding: 10 }}>
                  <Text style={{ fontSize: 16 }}>🌕</Text>
                </View>
              </LiquidGlass>
              <View>
                <Text style={styles.toggleLabel}>Moon Phase</Text>
                <Text style={styles.toggleSub}>Show on home screen</Text>
              </View>
            </View>
            <Switch
              value={settings.showMoonPhase}
              onValueChange={(v) => updateSettings({ showMoonPhase: v })}
              trackColor={{ false: Colors.surface, true: accent.primary + '90' }}
              thumbColor={settings.showMoonPhase ? accent.light : Colors.textMuted}
            />
          </View>
        </LiquidGlass>

        {/* ── Live Preview ── */}
        <Text style={styles.sectionLabel}>Preview</Text>
        <LiquidGlass radius={Radius.xl} tint={accent.primary} glowColor={accent.primary} intensity={88} style={styles.previewOuter}>
          {/* Left stripe */}
          <View style={[styles.previewStripe, { backgroundColor: accent.primary, shadowColor: accent.primary }]} />
          <View style={styles.previewInner}>
            <View style={styles.previewHeader}>
              <Text style={styles.previewDate}>Tonight, Jan 15</Text>
              <LiquidGlass radius={Radius.full} tint={accent.accent} glowColor={accent.accent} intensity={75} style={styles.previewBadgeGlass}>
                <Text style={[styles.previewBadgeText, { color: accent.accent }]}>7h 30m</Text>
              </LiquidGlass>
            </View>
            <LiquidGlass radius={Radius.md} tint={accent.primary} intensity={70} style={styles.previewTimeBar}>
              <Text style={[styles.previewTime, { color: accent.light }]}>11:00 PM → 6:30 AM</Text>
            </LiquidGlass>
            <View style={styles.previewTags}>
              {['Lucid', 'Vivid'].map((t) => (
                <LiquidGlass key={t} radius={Radius.full} tint={accent.primary} intensity={72} style={styles.previewTag}>
                  <Text style={[styles.previewTagText, { color: accent.light }]}>{t}</Text>
                </LiquidGlass>
              ))}
            </View>
          </View>
        </LiquidGlass>

        {/* ── Data ── */}
        <Text style={styles.sectionLabel}>Data</Text>
        <LiquidGlass radius={Radius.xl} tint={Colors.error} glowColor={Colors.error} intensity={80} style={styles.section}>
          <Pressable onPress={handleClearData} style={({ pressed }) => [styles.dangerBtn, pressed && { opacity: 0.75 }]}>
            <MaterialIcons name="delete-forever" size={20} color={Colors.error} />
            <Text style={styles.dangerText}>Clear All Journal Data</Text>
          </Pressable>
          <Text style={styles.dangerHint}>Permanently deletes all sleep sessions and dreams</Text>
        </LiquidGlass>

        <Text style={styles.version}>Dream Journal v1.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  blob: { position: 'absolute', width: 280, height: 280, borderRadius: 140, top: -60, left: -60 },
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

  section: { marginBottom: Spacing.xl, padding: Spacing.base, gap: Spacing.md },

  // Profile
  avatarRow: { alignItems: 'center', marginBottom: Spacing.xs },
  avatarCircle: { alignItems: 'center', justifyContent: 'center' },
  fieldLabel: { fontSize: Typography.sm, fontWeight: Typography.semiBold, color: Colors.textSecondary },
  nameInputRow: { flexDirection: 'row', gap: Spacing.sm },
  nameInputGlass: { flex: 1 },
  nameInput: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, fontSize: Typography.base, color: Colors.textPrimary },
  saveNameWrap: {},
  saveNameBtn: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  fieldHint: { fontSize: Typography.xs, color: Colors.textMuted },

  // Theme
  themeDesc: { fontSize: Typography.sm, color: Colors.textSecondary },
  accentRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: Spacing.md, marginBottom: Spacing.xs },
  swatch: {
    width: 36, height: 36, borderRadius: Radius.md, alignItems: 'flex-end', justifyContent: 'flex-end',
    padding: 4, overflow: 'hidden',
    shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.70, shadowRadius: 8, elevation: 5,
  },
  swatchDot: { width: 12, height: 12, borderRadius: 6 },
  accentLabel: { flex: 1, fontSize: Typography.base, fontWeight: Typography.semiBold },

  // Toggle
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.base },
  toggleInfo: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, flex: 1 },
  toggleIcon: {},
  toggleLabel: { fontSize: Typography.base, fontWeight: Typography.semiBold, color: Colors.textPrimary },
  toggleSub: { fontSize: Typography.xs, color: Colors.textMuted, marginTop: 2 },

  // Preview
  previewOuter: { flexDirection: 'row', marginBottom: Spacing.xl },
  previewStripe: {
    width: 3, borderTopLeftRadius: Radius.xl, borderBottomLeftRadius: Radius.xl,
    shadowOffset: { width: 3, height: 0 }, shadowOpacity: 1, shadowRadius: 10, elevation: 5,
  },
  previewInner: { flex: 1, padding: Spacing.base, gap: Spacing.sm },
  previewHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  previewDate: { fontSize: Typography.base, fontWeight: Typography.bold, color: Colors.textPrimary },
  previewBadgeGlass: {},
  previewBadgeText: { paddingHorizontal: Spacing.sm + 2, paddingVertical: 4, fontSize: Typography.xs, fontWeight: Typography.bold },
  previewTimeBar: {},
  previewTime: { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md, fontSize: Typography.sm, fontWeight: Typography.semiBold },
  previewTags: { flexDirection: 'row', gap: Spacing.xs },
  previewTag: {},
  previewTagText: { paddingHorizontal: Spacing.sm + 2, paddingVertical: 3, fontSize: Typography.xs, fontWeight: Typography.semiBold },

  // Danger
  dangerBtn: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.sm },
  dangerText: { fontSize: Typography.base, fontWeight: Typography.semiBold, color: Colors.error },
  dangerHint: { fontSize: Typography.xs, color: Colors.textMuted },
  version: { textAlign: 'center', fontSize: Typography.xs, color: Colors.textMuted, marginTop: Spacing.xl },
});
