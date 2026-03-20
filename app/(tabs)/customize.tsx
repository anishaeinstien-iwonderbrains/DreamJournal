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
      {/* Background glow */}
      <View style={[styles.glowBlob, { backgroundColor: accent.primary + '15' }]} pointerEvents="none" />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>Settings</Text>
        <Text style={styles.pageSubtitle}>Personalize your dream journal</Text>

        {/* ── Profile ─── */}
        <Text style={styles.sectionLabel}>Profile</Text>
        <View style={styles.glassCard}>
          <View style={styles.glassCardHighlight} />
          <View style={[styles.avatarCircle, { backgroundColor: accent.primary + '30', borderColor: accent.primary + '60', shadowColor: accent.primary }]}>
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
                  { backgroundColor: accent.primary, shadowColor: accent.primary },
                  pressed && { opacity: 0.8 },
                ]}
              >
                <View style={styles.btnHighlight} />
                <MaterialIcons name="check" size={18} color={Colors.textOnPrimary} />
              </Pressable>
            </View>
            <Text style={styles.fieldHint}>Shown on your journal home screen</Text>
          </View>
        </View>

        {/* ── Theme ─── */}
        <Text style={styles.sectionLabel}>Theme Color</Text>
        <View style={styles.glassCard}>
          <View style={styles.glassCardHighlight} />
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
                    isSelected && [styles.accentBtnSel, { borderColor: a.light + '70', backgroundColor: a.primary + '15', shadowColor: a.primary }],
                    pressed && { opacity: 0.8, transform: [{ scale: 0.97 }] },
                  ]}
                >
                  {isSelected && <View style={styles.accentBtnHighlight} />}
                  <View style={[styles.accentSwatch, { backgroundColor: a.primary, shadowColor: a.primary }]}>
                    <View style={[styles.accentSwatchInner, { backgroundColor: a.accent }]} />
                  </View>
                  <Text style={[styles.accentLabel, isSelected && { color: a.light }]}>{a.label}</Text>
                  {isSelected ? <MaterialIcons name="check-circle" size={16} color={a.light} /> : null}
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* ── Display ─── */}
        <Text style={styles.sectionLabel}>Display</Text>
        <View style={styles.glassCard}>
          <View style={styles.glassCardHighlight} />
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
        </View>

        {/* ── Live Preview ─── */}
        <Text style={styles.sectionLabel}>Preview</Text>
        <View style={[styles.previewCard, { borderColor: accent.primary + '40', shadowColor: accent.primary }]}>
          <View style={styles.previewCardHighlight} />
          <View style={[styles.previewStripe, { backgroundColor: accent.primary, shadowColor: accent.primary }]} />
          <View style={styles.previewInner}>
            <View style={styles.previewHeader}>
              <Text style={styles.previewDate}>Tonight, Jan 15</Text>
              <View style={[styles.previewBadge, { backgroundColor: accent.accent + '22', borderColor: accent.accent + '55' }]}>
                <Text style={[styles.previewBadgeText, { color: accent.accent }]}>7h 30m</Text>
              </View>
            </View>
            <View style={[styles.previewBar, { backgroundColor: accent.primary + '12', borderColor: accent.primary + '30' }]}>
              <Text style={[styles.previewTime, { color: accent.light }]}>11:00 PM → 6:30 AM</Text>
            </View>
            <View style={styles.previewTags}>
              {['Lucid', 'Vivid'].map((t) => (
                <View key={t} style={[styles.previewTag, { backgroundColor: accent.primary + '22', borderColor: accent.primary + '55' }]}>
                  <Text style={[styles.previewTagText, { color: accent.light }]}>{t}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* ── Data ─── */}
        <Text style={styles.sectionLabel}>Data</Text>
        <View style={styles.glassCard}>
          <View style={styles.glassCardHighlight} />
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
  glowBlob: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    top: -50,
    left: -50,
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
  sectionLabel: {
    fontSize: Typography.xs,
    fontWeight: Typography.bold,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.sm,
    marginLeft: Spacing.xs,
  },
  glassCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.xl,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    marginBottom: Spacing.xl,
    gap: Spacing.md,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 8,
  },
  glassCardHighlight: {
    position: 'absolute',
    top: 0,
    left: 14,
    right: 14,
    height: 1,
    backgroundColor: Colors.glassHighlight,
  },

  // Avatar
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    alignSelf: 'center',
    marginBottom: Spacing.xs,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 6,
  },
  avatarEmoji: { fontSize: 28 },
  nameRow: { gap: Spacing.sm },
  fieldLabel: { fontSize: Typography.sm, fontWeight: Typography.semiBold, color: Colors.textSecondary },
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
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  btnHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '45%',
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderTopLeftRadius: Radius.md,
    borderTopRightRadius: Radius.md,
  },
  fieldHint: { fontSize: Typography.xs, color: Colors.textMuted },

  // Theme
  themeDesc: { fontSize: Typography.sm, color: Colors.textSecondary },
  accentGrid: { gap: Spacing.sm },
  accentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    backgroundColor: Colors.glass,
    overflow: 'hidden',
  },
  accentBtnSel: {
    borderWidth: 1.5,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 5,
  },
  accentBtnHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '40%',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderTopLeftRadius: Radius.lg,
    borderTopRightRadius: Radius.lg,
  },
  accentSwatch: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    padding: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 4,
  },
  accentSwatchInner: { width: 12, height: 12, borderRadius: 6 },
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
  toggleInfo: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, flex: 1 },
  toggleIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleLabel: { fontSize: Typography.base, fontWeight: Typography.semiBold, color: Colors.textPrimary },
  toggleSub: { fontSize: Typography.xs, color: Colors.textMuted, marginTop: 2 },

  // Preview card
  previewCard: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    backgroundColor: Colors.bgCard,
    overflow: 'hidden',
    flexDirection: 'row',
    marginBottom: Spacing.xl,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.30,
    shadowRadius: 16,
    elevation: 10,
  },
  previewCardHighlight: {
    position: 'absolute',
    top: 0,
    left: 12,
    right: 12,
    height: 1,
    backgroundColor: Colors.glassHighlight,
    zIndex: 1,
  },
  previewStripe: {
    width: 3,
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 3,
  },
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
  dangerBtn: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.sm },
  dangerText: { fontSize: Typography.base, fontWeight: Typography.semiBold, color: Colors.error },
  dangerHint: { fontSize: Typography.xs, color: Colors.textMuted },

  version: { textAlign: 'center', fontSize: Typography.xs, color: Colors.textMuted, marginTop: Spacing.xl },
});
