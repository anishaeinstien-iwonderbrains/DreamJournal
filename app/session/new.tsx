import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useSessions } from '@/hooks/useSessions';
import { useTheme } from '@/hooks/useTheme';
import { StorageService } from '@/services/storage';
import { Colors, Typography, Spacing, Radius, WAKE_MOODS } from '@/constants/theme';
import { StarRating } from '@/components/ui/StarRating';
import { TimePickerModal } from '@/components/ui/TimePickerModal';
import { useAlert } from '@/template';

function startOfDay(d: Date): Date {
  const c = new Date(d); c.setHours(0, 0, 0, 0); return c;
}

function formatDateLabel(d: Date): string {
  const today = startOfDay(new Date());
  const target = startOfDay(d);
  const diff = Math.round((target.getTime() - today.getTime()) / 86400000);
  const weekday = d.toLocaleDateString('en-US', { weekday: 'short' });
  const monthDay = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  if (diff === 0) return `Today, ${monthDay}`;
  if (diff === -1) return `Yesterday, ${monthDay}`;
  if (diff === 1) return `Tomorrow, ${monthDay}`;
  return `${weekday}, ${monthDay}`;
}

function buildDefaultBedtime(): Date {
  const d = new Date(); d.setHours(23, 0, 0, 0); return d;
}

function addDays(d: Date, n: number): Date {
  const c = new Date(d); c.setDate(c.getDate() + n); return c;
}

export default function NewSessionScreen() {
  const router = useRouter();
  const { addSession } = useSessions();
  const { showAlert } = useAlert();
  const { accent } = useTheme();

  const defaultBed = buildDefaultBedtime();

  const [sameDay, setSameDay] = useState(false);
  const [bedDate, setBedDate] = useState(defaultBed);
  const [bedTime, setBedTime] = useState(defaultBed);
  const [wakeDate, setWakeDate] = useState(() => addDays(defaultBed, 1));
  const [wakeTime, setWakeTime] = useState(() => { const d = new Date(defaultBed); d.setHours(7, 0, 0, 0); return d; });
  const [quality, setQuality] = useState(3);
  const [wakeMood, setWakeMood] = useState('refreshed');
  const [showBedPicker, setShowBedPicker] = useState(false);
  const [showWakePicker, setShowWakePicker] = useState(false);

  const combinedBedtime = (): Date => {
    const d = new Date(bedDate); d.setHours(bedTime.getHours(), bedTime.getMinutes(), 0, 0); return d;
  };
  const combinedWakeTime = (): Date => {
    const d = new Date(sameDay ? bedDate : wakeDate); d.setHours(wakeTime.getHours(), wakeTime.getMinutes(), 0, 0); return d;
  };

  const duration = StorageService.computeDuration(combinedBedtime().toISOString(), combinedWakeTime().toISOString());

  const handleToggleSameDay = (val: boolean) => {
    setSameDay(val);
    if (!val) setWakeDate(addDays(bedDate, 1));
  };

  const shiftBedDate = (delta: number) => {
    const newBed = addDays(bedDate, delta);
    setBedDate(newBed);
    if (!sameDay) setWakeDate(addDays(newBed, 1));
  };

  const shiftWakeDate = (delta: number) => setWakeDate(addDays(wakeDate, delta));

  const handleSave = async () => {
    const bed = combinedBedtime();
    const wake = combinedWakeTime();
    const dur = StorageService.computeDuration(bed.toISOString(), wake.toISOString());
    if (dur <= 0) {
      showAlert('Invalid Times', 'Wake time must be after bedtime. Please check your dates and times.');
      return;
    }
    const session = {
      id: StorageService.generateId(),
      bedtime: bed.toISOString(),
      wakeTime: wake.toISOString(),
      durationMinutes: dur,
      qualityRating: quality,
      wakeMood,
      dreams: [],
      createdAt: new Date().toISOString(),
    };
    await addSession(session);
    router.replace({ pathname: '/session/[id]', params: { id: session.id } });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={[styles.glow, { backgroundColor: accent.primary + '1A' }]} pointerEvents="none" />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        {/* Nav */}
        <View style={styles.nav}>
          <Pressable onPress={() => router.back()} hitSlop={8} style={styles.navBtn}>
            <BlurView intensity={55} tint="dark" style={[StyleSheet.absoluteFill, { borderRadius: Radius.full }]} />
            <View style={[StyleSheet.absoluteFill, styles.navBtnFill, { borderRadius: Radius.full }]} />
            <View style={styles.navBtnTopLine} />
            <MaterialIcons name="arrow-back" size={22} color={Colors.textPrimary} />
          </Pressable>
          <Text style={styles.navTitle}>Log Sleep Session</Text>
          <Pressable
            onPress={handleSave}
            style={({ pressed }) => [
              styles.saveChip,
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
            <Text style={styles.saveChipText}>Save</Text>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

          {/* ── Same-day toggle ── */}
          <View
            style={[styles.toggleOuter, { borderColor: accent.primary + '28', shadowColor: accent.primary }]}
          >
            <BlurView intensity={58} tint="dark" style={[StyleSheet.absoluteFill, { borderRadius: Radius.xl }]} />
            <View style={[StyleSheet.absoluteFill, styles.blockFill, { borderRadius: Radius.xl }]} />
            <LinearGradient
              colors={[accent.primary + '10', 'transparent']}
              style={[StyleSheet.absoluteFill, { borderRadius: Radius.xl }]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              pointerEvents="none"
            />
            <LinearGradient
              colors={['rgba(255,255,255,0.24)', 'rgba(255,255,255,0.00)']}
              style={[styles.blockShimmer, { borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl }]}
              start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }}
              pointerEvents="none"
            />
            <View style={styles.blockTopLine} />
            <View style={styles.toggleContent}>
              <View style={styles.toggleInfo}>
                <View style={[styles.toggleIcon, { backgroundColor: accent.primary + '22' }]}>
                  <MaterialIcons name="nightlight-round" size={18} color={accent.light} />
                </View>
                <View>
                  <Text style={styles.toggleLabel}>Slept past midnight</Text>
                  <Text style={styles.toggleSub}>{sameDay ? 'Same day sleep' : 'Woke up next day'}</Text>
                </View>
              </View>
              <Switch
                value={!sameDay}
                onValueChange={(v) => handleToggleSameDay(!v)}
                trackColor={{ false: Colors.surface, true: accent.primary + '90' }}
                thumbColor={!sameDay ? accent.light : Colors.textMuted}
              />
            </View>
          </View>

          {/* ── Sleep Times ── */}
          <Text style={styles.sectionTitle}>Sleep Times</Text>

          {/* Bedtime block */}
          <View style={[styles.timeBlockOuter, { borderColor: accent.primary + '30', shadowColor: accent.primary }]}>
            <BlurView intensity={58} tint="dark" style={[StyleSheet.absoluteFill, { borderRadius: Radius.xl }]} />
            <View style={[StyleSheet.absoluteFill, styles.blockFill, { borderRadius: Radius.xl }]} />
            <LinearGradient
              colors={[accent.primary + '10', 'transparent']}
              style={[StyleSheet.absoluteFill, { borderRadius: Radius.xl }]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0.7 }}
              pointerEvents="none"
            />
            <LinearGradient
              colors={['rgba(255,255,255,0.24)', 'rgba(255,255,255,0.00)']}
              style={[styles.blockShimmer, { borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl }]}
              start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }}
              pointerEvents="none"
            />
            <View style={styles.blockTopLine} />
            <View style={styles.timeBlockContent}>
              <View style={styles.timeBlockHeader}>
                <MaterialIcons name="bedtime" size={16} color={accent.light} />
                <Text style={styles.timeBlockLabel}>Bedtime</Text>
              </View>
              <View style={[styles.dateNav, { borderColor: Colors.glassBorder, backgroundColor: 'rgba(255,255,255,0.04)' }]}>
                <Pressable onPress={() => shiftBedDate(-1)} hitSlop={8} style={styles.dateArrow}>
                  <MaterialIcons name="chevron-left" size={22} color={Colors.textSecondary} />
                </Pressable>
                <Text style={styles.dateText}>{formatDateLabel(bedDate)}</Text>
                <Pressable onPress={() => shiftBedDate(1)} hitSlop={8} style={styles.dateArrow}>
                  <MaterialIcons name="chevron-right" size={22} color={Colors.textSecondary} />
                </Pressable>
              </View>
              <Pressable
                onPress={() => setShowBedPicker(true)}
                style={({ pressed }) => [
                  styles.timeBtn,
                  { borderColor: accent.primary + '50', backgroundColor: accent.primary + '0E' },
                  pressed && { opacity: 0.8 },
                ]}
              >
                <LinearGradient
                  colors={['rgba(255,255,255,0.10)', 'rgba(255,255,255,0.00)']}
                  style={[StyleSheet.absoluteFill, { borderRadius: Radius.lg }]}
                  start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 0.5 }}
                  pointerEvents="none"
                />
                <Text style={[styles.timeBtnValue, { color: accent.light }]}>
                  {StorageService.formatTime(combinedBedtime().toISOString())}
                </Text>
                <MaterialIcons name="access-time" size={18} color={Colors.textMuted} />
              </Pressable>
            </View>
          </View>

          {/* Duration bridge */}
          <View style={styles.durationRow}>
            <View style={[styles.durationLine, { backgroundColor: accent.primary + '35' }]} />
            <View style={[styles.durationBadge, { borderColor: Colors.accent + '55', backgroundColor: Colors.accent + '14' }]}>
              <MaterialIcons name="nightlight-round" size={13} color={Colors.accent} />
              <Text style={[styles.durationText, { color: Colors.accent }]}>
                {duration > 0 ? StorageService.formatDuration(duration) : '—'}
              </Text>
            </View>
            <View style={[styles.durationLine, { backgroundColor: accent.primary + '35' }]} />
          </View>

          {/* Wake block */}
          <View style={[styles.timeBlockOuter, { borderColor: Colors.accent + '30', shadowColor: Colors.accent }]}>
            <BlurView intensity={58} tint="dark" style={[StyleSheet.absoluteFill, { borderRadius: Radius.xl }]} />
            <View style={[StyleSheet.absoluteFill, styles.blockFill, { borderRadius: Radius.xl }]} />
            <LinearGradient
              colors={[Colors.accent + '0C', 'transparent']}
              style={[StyleSheet.absoluteFill, { borderRadius: Radius.xl }]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0.7 }}
              pointerEvents="none"
            />
            <LinearGradient
              colors={['rgba(255,255,255,0.24)', 'rgba(255,255,255,0.00)']}
              style={[styles.blockShimmer, { borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl }]}
              start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }}
              pointerEvents="none"
            />
            <View style={styles.blockTopLine} />
            <View style={styles.timeBlockContent}>
              <View style={styles.timeBlockHeader}>
                <MaterialIcons name="wb-sunny" size={16} color={Colors.accent} />
                <Text style={styles.timeBlockLabel}>Wake up</Text>
              </View>
              {sameDay ? (
                <View style={styles.sameDayBadge}>
                  <MaterialIcons name="lock" size={13} color={Colors.textMuted} />
                  <Text style={styles.sameDayText}>Same day as bedtime ({formatDateLabel(bedDate)})</Text>
                </View>
              ) : (
                <View style={[styles.dateNav, { borderColor: Colors.glassBorder, backgroundColor: 'rgba(255,255,255,0.04)' }]}>
                  <Pressable onPress={() => shiftWakeDate(-1)} hitSlop={8} style={styles.dateArrow}>
                    <MaterialIcons name="chevron-left" size={22} color={Colors.textSecondary} />
                  </Pressable>
                  <Text style={styles.dateText}>{formatDateLabel(wakeDate)}</Text>
                  <Pressable onPress={() => shiftWakeDate(1)} hitSlop={8} style={styles.dateArrow}>
                    <MaterialIcons name="chevron-right" size={22} color={Colors.textSecondary} />
                  </Pressable>
                </View>
              )}
              <Pressable
                onPress={() => setShowWakePicker(true)}
                style={({ pressed }) => [
                  styles.timeBtn,
                  { borderColor: Colors.accent + '50', backgroundColor: Colors.accent + '0E' },
                  pressed && { opacity: 0.8 },
                ]}
              >
                <LinearGradient
                  colors={['rgba(255,255,255,0.10)', 'rgba(255,255,255,0.00)']}
                  style={[StyleSheet.absoluteFill, { borderRadius: Radius.lg }]}
                  start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 0.5 }}
                  pointerEvents="none"
                />
                <Text style={[styles.timeBtnValue, { color: Colors.accentSoft }]}>
                  {StorageService.formatTime(combinedWakeTime().toISOString())}
                </Text>
                <MaterialIcons name="access-time" size={18} color={Colors.textMuted} />
              </Pressable>
            </View>
          </View>

          {/* ── Sleep Quality ── */}
          <Text style={[styles.sectionTitle, { marginTop: Spacing.xl }]}>Sleep Quality</Text>
          <View style={[styles.glassBlockOuter, { borderColor: accent.primary + '28', shadowColor: accent.primary }]}>
            <BlurView intensity={58} tint="dark" style={[StyleSheet.absoluteFill, { borderRadius: Radius.xl }]} />
            <View style={[StyleSheet.absoluteFill, styles.blockFill, { borderRadius: Radius.xl }]} />
            <LinearGradient
              colors={['rgba(255,255,255,0.22)', 'rgba(255,255,255,0.00)']}
              style={[styles.blockShimmer, { borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl }]}
              start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }}
              pointerEvents="none"
            />
            <View style={styles.blockTopLine} />
            <View style={styles.qualityContent}>
              <StarRating value={quality} onChange={setQuality} size={38} />
              <Text style={[styles.qualityHint, { color: accent.light }]}>
                {quality === 1 ? 'Poor' : quality === 2 ? 'Fair' : quality === 3 ? 'Okay' : quality === 4 ? 'Good' : 'Excellent'}
              </Text>
            </View>
          </View>

          {/* ── Wake Mood ── */}
          <Text style={[styles.sectionTitle, { marginTop: Spacing.xl }]}>Mood on Waking</Text>
          <View style={styles.moodGrid}>
            {WAKE_MOODS.map((mood) => {
              const sel = wakeMood === mood.id;
              return (
                <Pressable
                  key={mood.id}
                  onPress={() => setWakeMood(mood.id)}
                  style={({ pressed }) => [
                    styles.moodBtnOuter,
                    sel && { borderColor: accent.primary + '80', shadowColor: accent.primary },
                    pressed && { opacity: 0.8 },
                  ]}
                >
                  <BlurView intensity={sel ? 65 : 50} tint="dark" style={[StyleSheet.absoluteFill, { borderRadius: Radius.xl }]} />
                  <View style={[StyleSheet.absoluteFill, styles.blockFill, { borderRadius: Radius.xl }]} />
                  {sel ? (
                    <LinearGradient
                      colors={[accent.primary + '22', 'transparent']}
                      style={[StyleSheet.absoluteFill, { borderRadius: Radius.xl }]}
                      start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }}
                      pointerEvents="none"
                    />
                  ) : null}
                  <LinearGradient
                    colors={['rgba(255,255,255,0.22)', 'rgba(255,255,255,0.00)']}
                    style={[styles.blockShimmer, { borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl }]}
                    start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }}
                    pointerEvents="none"
                  />
                  <View style={styles.blockTopLine} />
                  <View style={styles.moodBtnContent}>
                    <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                    <Text style={[styles.moodLabel, sel && { color: accent.light }]}>{mood.label}</Text>
                  </View>
                </Pressable>
              );
            })}
          </View>

          {/* ── Save ── */}
          <Pressable
            onPress={handleSave}
            style={({ pressed }) => [
              styles.saveBtn,
              { backgroundColor: accent.primary, shadowColor: accent.primary },
              pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
            ]}
          >
            <LinearGradient
              colors={['rgba(255,255,255,0.28)', 'rgba(255,255,255,0.00)']}
              style={[StyleSheet.absoluteFill, { borderRadius: Radius.xl }]}
              start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 0.5 }}
              pointerEvents="none"
            />
            <MaterialIcons name="check" size={22} color={Colors.textOnPrimary} />
            <Text style={styles.saveBtnText}>Save &amp; Add Dreams</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>

      <TimePickerModal
        visible={showBedPicker}
        value={bedTime}
        title="Set Bedtime"
        onConfirm={(d) => { setBedTime(d); setShowBedPicker(false); }}
        onCancel={() => setShowBedPicker(false)}
      />
      <TimePickerModal
        visible={showWakePicker}
        value={wakeTime}
        title="Set Wake Time"
        onConfirm={(d) => { setWakeTime(d); setShowWakePicker(false); }}
        onCancel={() => setShowWakePicker(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  glow: {
    position: 'absolute', width: 300, height: 300, borderRadius: 150, top: -80, right: -70,
  },
  nav: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.base, paddingVertical: Spacing.md,
  },
  navBtn: {
    width: 44, height: 44, alignItems: 'center', justifyContent: 'center',
    borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.glassBorder, overflow: 'hidden',
  },
  navBtnFill: { backgroundColor: 'rgba(255,255,255,0.07)' },
  navBtnTopLine: {
    position: 'absolute', top: 0, left: 8, right: 8, height: 1, backgroundColor: 'rgba(255,255,255,0.45)',
  },
  navTitle: { fontSize: Typography.base, fontWeight: Typography.bold, color: Colors.textPrimary },
  saveChip: {
    paddingHorizontal: Spacing.base, paddingVertical: Spacing.sm, borderRadius: Radius.lg, overflow: 'hidden',
    shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.50, shadowRadius: 12, elevation: 8,
  },
  saveChipText: { color: Colors.textOnPrimary, fontWeight: Typography.semiBold, fontSize: Typography.base },
  content: { paddingHorizontal: Spacing.base, paddingBottom: Spacing.xxxl },

  // Reusable glass block
  blockFill: { backgroundColor: 'rgba(255,255,255,0.055)' },
  blockShimmer: { position: 'absolute', top: 0, left: 0, right: 0, height: 46 },
  blockTopLine: {
    position: 'absolute', top: 0, left: Radius.xl * 0.5, right: Radius.xl * 0.5,
    height: 1, backgroundColor: 'rgba(255,255,255,0.46)',
  },

  sectionTitle: {
    fontSize: Typography.xs, fontWeight: Typography.bold, color: Colors.textMuted,
    textTransform: 'uppercase', letterSpacing: 1, marginBottom: Spacing.md, marginLeft: Spacing.xs,
  },

  // Toggle
  toggleOuter: {
    borderRadius: Radius.xl, borderWidth: 1, marginBottom: Spacing.xl, overflow: 'hidden',
    shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.30, shadowRadius: 16, elevation: 8,
  },
  toggleContent: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: Spacing.base, gap: Spacing.base,
  },
  toggleInfo: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, flex: 1 },
  toggleIcon: { width: 40, height: 40, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  toggleLabel: { fontSize: Typography.base, fontWeight: Typography.semiBold, color: Colors.textPrimary },
  toggleSub: { fontSize: Typography.xs, color: Colors.textMuted, marginTop: 2 },

  // Time blocks
  timeBlockOuter: {
    borderRadius: Radius.xl, borderWidth: 1, marginBottom: Spacing.sm, overflow: 'hidden',
    shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.30, shadowRadius: 16, elevation: 8,
  },
  timeBlockContent: { padding: Spacing.base, gap: Spacing.md },
  timeBlockHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  timeBlockLabel: {
    fontSize: Typography.xs, fontWeight: Typography.bold, color: Colors.textMuted,
    textTransform: 'uppercase', letterSpacing: 0.8,
  },
  dateNav: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderRadius: Radius.md, paddingVertical: Spacing.xs, paddingHorizontal: Spacing.xs, borderWidth: 1,
  },
  dateArrow: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  dateText: {
    fontSize: Typography.sm, fontWeight: Typography.semiBold, color: Colors.textPrimary, flex: 1, textAlign: 'center',
  },
  sameDayBadge: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, backgroundColor: Colors.glass,
    borderRadius: Radius.md, paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md,
    borderWidth: 1, borderColor: Colors.glassBorder,
  },
  sameDayText: { fontSize: Typography.xs, color: Colors.textMuted, flex: 1 },
  timeBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderRadius: Radius.lg, paddingHorizontal: Spacing.base, paddingVertical: Spacing.md + 2,
    borderWidth: 1, overflow: 'hidden',
  },
  timeBtnValue: { fontSize: Typography.xl, fontWeight: Typography.extraBold, letterSpacing: 1 },

  // Duration
  durationRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginVertical: Spacing.sm, paddingHorizontal: Spacing.sm,
  },
  durationLine: { flex: 1, height: 1 },
  durationBadge: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2, borderRadius: Radius.full, borderWidth: 1,
  },
  durationText: { fontSize: Typography.sm, fontWeight: Typography.bold, letterSpacing: 0.3 },

  // Quality
  glassBlockOuter: {
    borderRadius: Radius.xl, borderWidth: 1, overflow: 'hidden',
    shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.30, shadowRadius: 16, elevation: 8,
  },
  qualityContent: { padding: Spacing.xl, alignItems: 'center', gap: Spacing.md },
  qualityHint: { fontSize: Typography.base, fontWeight: Typography.semiBold, letterSpacing: 0.3 },

  // Mood
  moodGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md, marginBottom: Spacing.xl },
  moodBtnOuter: {
    flex: 1, minWidth: '28%', borderRadius: Radius.xl, overflow: 'hidden',
    borderWidth: 1, borderColor: Colors.glassBorder,
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.28, shadowRadius: 10, elevation: 5,
  },
  moodBtnContent: { paddingVertical: Spacing.md, alignItems: 'center', gap: Spacing.xs },
  moodEmoji: { fontSize: Typography.xl },
  moodLabel: { fontSize: Typography.xs, color: Colors.textMuted, fontWeight: Typography.semiBold },

  // Save
  saveBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm,
    borderRadius: Radius.xl, paddingVertical: Spacing.base + 4, overflow: 'hidden',
    shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.55, shadowRadius: 20, elevation: 12,
  },
  saveBtnText: { fontSize: Typography.base, fontWeight: Typography.bold, color: Colors.textOnPrimary, letterSpacing: 0.3 },
});
