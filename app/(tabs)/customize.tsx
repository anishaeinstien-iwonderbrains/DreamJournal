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
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { Colors, Typography, Spacing, Radius, Shadows, ACCENT_COLORS } from '@/constants/theme';
import { useAlert } from '@/template';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSessions } from '@/hooks/useSessions';

export default function CustomizeScreen() {
  const { settings, accent, updateSettings } = useTheme();
  const { refresh } = useSessions();
  const { showAlert } = useAlert();
  const [nameInput, setNameInput] = useState(settings.userName);

  const handleSaveName = () => {
    updateSettings({ userName: nameInput.trim() });
  };

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
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>Settings</Text>
        <Text style={styles.pageSubtitle}>Personalize your dream journal</Text>

        {/* ── Profile ─────────────────────────────────────────── */}
        <Text style={styles.sectionLabel}>Profile</Text>
        <View style={styles.card}>
          <View style={[styles.avatarCircle, { backgroundColor: accent.primary + '40', borderColor: accent.primary }]}>
            <Text style={styles.avatarEmoji}>🌙</Text>
          </View>
          <View style={styles.nameRow}>
            <Text style={styles.fieldLabel}>Your Name</Text>
            <View style={styles.nameInputRow}>
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
              <Pressable
                onPress={handleSaveName}
                style={({ pressed }) => [
                  styles.saveNameBtn,
                  { backgroundColor: accent.primary },
                  pressed && { opacity: 0.8 },
                ]}
              >
                <MaterialIcons name="check" size={18} color={Colors.textOnPrimary} />
              </Pressable>
            </View>
            <Text style={styles.fieldHint}>Shown on your journal home screen</Text>
          </View>
        </View>

        {/* ── Theme ───────────────────────────────────────────── */}
        <Text style={styles.sectionLabel}>Theme Color</Text>
        <View style={styles.card}>
          <Text style={styles.themeDesc}>Choose your journal's accent color palette</Text>
          <View style={styles.accentGrid}>
            {ACCENT_COLORS.map((a) => {
              const isSelected = settings.accentId === a.id;
              return (
                <Pressable
                  key={a.id}
                  onPress={() => updateSettings({ accentId: a.id })}
                  style={({ pressed }) => [
                    styles.accentBtn,
                    isSelected && [styles.accentBtnSel, { borderColor: a.light }],
                    pressed && { opacity: 0.8, transform: [{ scale: 0.95 }] },
                  ]}
                >
                  <View style={[styles.accentSwatch, { backgroundColor: a.primary }]}>
                    <View style={[styles.accentSwatchInner, { backgroundColor: a.accent }]} />
                  </View>
                  <Text style={[styles.accentLabel, isSelected && { color: a.light }]}>{a.label}</Text>
                  {isSelected ? (
                    <MaterialIcons name="check-circle" size={16} color={a.light} />
                  ) : null}
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* ── Display ─────────────────────────────────────────── */}
        <Text style={styles.sectionLabel}>Display</Text>
        <View style={styles.card}>
          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <View style={[styles.toggleIcon, { backgroundColor: accent.primary + '20' }]}>
                <Text style={{ fontSize: 16 }}>🌕</Text>
              </View>
              <View>
                <Text style={styles.toggleLabel}>Moon Phase</Text>
                <Text style={styles.toggleSub}>Show current moon phase on home screen</Text>
              </View>
            </View>
            <Switch
              value={settings.showMoonPhase}
              onValueChange={(v) => updateSettings({ showMoonPhase: v })}
              trackColor={{ false: Colors.surface, true: accent.primary + '80' }}
              thumbColor={settings.showMoonPhase ? accent.light : Colors.textMuted}
            />
          </View>
        </View>

        {/* ── Preview ─────────────────────────────────────────── */}
        <Text style={styles.sectionLabel}>Preview</Text>
        <View style={[styles.previewCard, { borderColor: accent.primary + '40' }]}>
          <View style={[styles.previewStripe, { backgroundColor: accent.primary }]} />
          <View style={styles.previewInner}>
            <View style={styles.previewHeader}>
              <Text style={styles.previewDate}>Tonight, Jan 15</Text>
              <View style={[styles.previewBadge, { backgroundColor: accent.accent + '25', borderColor: accent.accent + '50' }]}>
                <Text style={[styles.previewBadgeText, { color: accent.accent }]}>7h 30m</Text>
              </View>
            </View>
            <View style={[styles.previewBar, { backgroundColor: accent.primary + '15', borderColor: accent.primary + '25' }]}>
              <Text style={[styles.previewTime, { color: accent.light }]}>11:00 PM → 6:30 AM</Text>
            </View>
            <View style={styles.previewTags}>
              {['Lucid', 'Vivid'].map((t) => (
                <View key={t} style={[styles.previewTag, { backgroundColor: accent.primary + '25', borderColor: accent.primary + '60' }]}>
                  <Text style={[styles.previewTagText, { color: accent.light }]}>{t}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* ── Danger ──────────────────────────────────────────── */}
        <Text style={styles.sectionLabel}>Data</Text>
        <View style={styles.card}>
          <Pressable
            onPress={handleClearData}
            style={({ pressed }) => [styles.dangerBtn, pressed && { opacity: 0.8 }]}
          >
            <MaterialIcons name="delete-forever" size={20} color={Colors.error} />
            <Text style={styles.dangerText}>Clear All Journal Data</Text>
          </Pressable>
          <Text style={styles.dangerHint}>Permanently deletes all sleep sessions and dreams</Text>
        </View>

        <Text style={styles.version}>Dream Journal v1.0</Text>
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
  sectionLabel: {
    fontSize: Typography.xs,
    fontWeight: Typography.bold,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.sm,
    marginLeft: Spacing.xs,
  },
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.xl,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    marginBottom: Spacing.xl,
    gap: Spacing.md,
  },

  // Avatar + name
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    alignSelf: 'center',
    marginBottom: Spacing.xs,
  },
  avatarEmoji: { fontSize: 28 },
  nameRow: { gap: Spacing.sm },
  fieldLabel: {
    fontSize: Typography.sm,
    fontWeight: Typography.semiBold,
    color: Colors.textSecondary,
  },
  nameInputRow: { flexDirection: 'row', gap: Spacing.sm },
  nameInput: {
    flex: 1,
    backgroundColor: Colors.glass,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: Typography.base,
    color: Colors.textPrimary,
  },
  saveNameBtn: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fieldHint: {
    fontSize: Typography.xs,
    color: Colors.textMuted,
  },

  // Theme
  themeDesc: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
  },
  accentGrid: {
    gap: Spacing.sm,
  },
  accentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    backgroundColor: Colors.glass,
  },
  accentBtnSel: {
    backgroundColor: Colors.bgCardAlt,
    borderWidth: 1.5,
  },
  accentSwatch: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    padding: 4,
  },
  accentSwatchInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  accentLabel: {
    flex: 1,
    fontSize: Typography.base,
    fontWeight: Typography.semiBold,
    color: Colors.textSecondary,
  },

  // Toggle
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.base,
  },
  toggleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  toggleIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleLabel: {
    fontSize: Typography.base,
    fontWeight: Typography.semiBold,
    color: Colors.textPrimary,
  },
  toggleSub: {
    fontSize: Typography.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },

  // Preview card
  previewCard: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    backgroundColor: Colors.bgCard,
    overflow: 'hidden',
    flexDirection: 'row',
    marginBottom: Spacing.xl,
  },
  previewStripe: { width: 3 },
  previewInner: { flex: 1, padding: Spacing.base, gap: Spacing.sm },
  previewHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  previewDate: { fontSize: Typography.base, fontWeight: Typography.bold, color: Colors.textPrimary },
  previewBadge: {
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 4,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  previewBadgeText: { fontSize: Typography.xs, fontWeight: Typography.bold },
  previewBar: {
    borderRadius: Radius.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  previewTime: { fontSize: Typography.sm, fontWeight: Typography.semiBold },
  previewTags: { flexDirection: 'row', gap: Spacing.xs },
  previewTag: {
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 3,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  previewTagText: { fontSize: Typography.xs, fontWeight: Typography.semiBold },

  // Danger
  dangerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  dangerText: {
    fontSize: Typography.base,
    fontWeight: Typography.semiBold,
    color: Colors.error,
  },
  dangerHint: {
    fontSize: Typography.xs,
    color: Colors.textMuted,
  },
  version: {
    textAlign: 'center',
    fontSize: Typography.xs,
    color: Colors.textMuted,
    marginTop: Spacing.xl,
  },
});
