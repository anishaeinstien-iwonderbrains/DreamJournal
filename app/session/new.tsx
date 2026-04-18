import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable,
  KeyboardAvoidingView, Platform, Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { LiquidGlass } from '@/components/ui/LiquidGlass';
import { useSessions } from '@/hooks/useSessions';
import { useTheme } from '@/hooks/useTheme';
import { StorageService } from '@/services/storage';
import { Colors, Typography, Spacing, Radius, WAKE_MOODS } from '@/constants/theme';
import { StarRating } from '@/components/ui/StarRating';
import { TimePickerModal } from '@/components/ui/TimePickerModal';
import { useAlert } from '@/template';

function startOfDay(d: Date): Date { const c = new Date(d); c.setHours(0,0,0,0); return c; }
function addDays(d: Date, n: number): Date { const c = new Date(d); c.setDate(c.getDate()+n); return c; }
function formatDateLabel(d: Date): string {
  const today = startOfDay(new Date());
  const target = startOfDay(d);
  const diff = Math.round((target.getTime()-today.getTime())/86400000);
  const weekday = d.toLocaleDateString('en-US',{weekday:'short'});
  const monthDay = d.toLocaleDateString('en-US',{month:'short',day:'numeric'});
  if (diff===0) return `Today, ${monthDay}`;
  if (diff===-1) return `Yesterday, ${monthDay}`;
  if (diff===1) return `Tomorrow, ${monthDay}`;
  return `${weekday}, ${monthDay}`;
}
function buildDefaultBedtime(): Date { const d = new Date(); d.setHours(23,0,0,0); return d; }

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
  const [wakeTime, setWakeTime] = useState(() => { const d = new Date(defaultBed); d.setHours(7,0,0,0); return d; });
  const [quality, setQuality] = useState(3);
  const [wakeMood, setWakeMood] = useState('refreshed');
  const [showBedPicker, setShowBedPicker] = useState(false);
  const [showWakePicker, setShowWakePicker] = useState(false);

  const combinedBedtime = (): Date => { const d = new Date(bedDate); d.setHours(bedTime.getHours(), bedTime.getMinutes(), 0, 0); return d; };
  const combinedWakeTime = (): Date => { const d = new Date(sameDay ? bedDate : wakeDate); d.setHours(wakeTime.getHours(), wakeTime.getMinutes(), 0, 0); return d; };
  const duration = StorageService.computeDuration(combinedBedtime().toISOString(), combinedWakeTime().toISOString());

  const handleToggleSameDay = (val: boolean) => { setSameDay(!val); if (val) setWakeDate(addDays(bedDate, 1)); };
  const shiftBedDate = (delta: number) => { const nb = addDays(bedDate, delta); setBedDate(nb); if (!sameDay) setWakeDate(addDays(nb, 1)); };
  const shiftWakeDate = (delta: number) => setWakeDate(addDays(wakeDate, delta));

  const handleSave = async () => {
    const bed = combinedBedtime(); const wake = combinedWakeTime();
    const dur = StorageService.computeDuration(bed.toISOString(), wake.toISOString());
    if (dur <= 0) { showAlert('Invalid Times', 'Wake time must be after bedtime. Please check your dates and times.'); return; }
    const session = {
      id: StorageService.generateId(), bedtime: bed.toISOString(), wakeTime: wake.toISOString(),
      durationMinutes: dur, qualityRating: quality, wakeMood, dreams: [], createdAt: new Date().toISOString(),
    };
    await addSession(session);
    router.replace({ pathname: '/session/[id]', params: { id: session.id } });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top','bottom']}>
      <View style={[styles.glow, { backgroundColor: accent.primary + '1C' }]} pointerEvents="none" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>

        {/* Nav */}
        <View style={styles.nav}>
          <Pressable onPress={() => router.back()} hitSlop={8}>
            {({ pressed }) => (
              <LiquidGlass radius={Radius.full} intensity={85} pressed={pressed} style={styles.navBtn}>
                <MaterialIcons name="arrow-back" size={22} color={Colors.textPrimary} />
              </LiquidGlass>
            )}
          </Pressable>
          <Text style={styles.navTitle}>Log Sleep Session</Text>
          <Pressable onPress={handleSave}>
            {({ pressed }) => (
              <LiquidGlass radius={Radius.lg} tint={accent.primary} glowColor={accent.primary} intensity={90} pressed={pressed} style={styles.saveChip}>
                <LinearGradient
                  colors={[accent.primary + 'CC', accent.primaryDark + 'AA']}
                  style={[StyleSheet.absoluteFill, { borderRadius: Radius.lg }]}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                  pointerEvents="none"
                />
                <Text style={styles.saveChipText}>Save</Text>
              </LiquidGlass>
            )}
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

          {/* Same-day toggle */}
          <LiquidGlass radius={Radius.xl} tint={accent.primary} glowColor={accent.primary} intensity={85} style={styles.block}>
            <View style={styles.toggleContent}>
              <View style={styles.toggleInfo}>
                <LiquidGlass radius={Radius.md} tint={accent.primary} intensity={78} style={styles.toggleIcon}>
                  <View style={{ padding: 10 }}>
                    <MaterialIcons name="nightlight-round" size={18} color={accent.light} />
                  </View>
                </LiquidGlass>
                <View>
                  <Text style={styles.toggleLabel}>Slept past midnight</Text>
                  <Text style={styles.toggleSub}>{sameDay ? 'Same day sleep' : 'Woke up next day'}</Text>
                </View>
              </View>
              <Switch
                value={!sameDay}
                onValueChange={handleToggleSameDay}
                trackColor={{ false: Colors.surface, true: accent.primary + '90' }}
                thumbColor={!sameDay ? accent.light : Colors.textMuted}
              />
            </View>
          </LiquidGlass>

          {/* Sleep Times */}
          <Text style={styles.sectionTitle}>Sleep Times</Text>

          {/* Bedtime */}
          <LiquidGlass radius={Radius.xl} tint={accent.primary} glowColor={accent.primary} intensity={85} style={[styles.block, { marginBottom: Spacing.sm }]}>
            <View style={styles.timeBlockContent}>
              <View style={styles.timeBlockHeader}>
                <MaterialIcons name="bedtime" size={15} color={accent.light} />
                <Text style={styles.timeBlockLabel}>Bedtime</Text>
              </View>
              {/* Date nav */}
              <LiquidGlass radius={Radius.md} intensity={72} style={styles.dateNav}>
                <View style={styles.dateNavContent}>
                  <Pressable onPress={() => shiftBedDate(-1)} hitSlop={8} style={styles.dateArrow}>
                    <MaterialIcons name="chevron-left" size={22} color={Colors.textSecondary} />
                  </Pressable>
                  <Text style={styles.dateText}>{formatDateLabel(bedDate)}</Text>
                  <Pressable onPress={() => shiftBedDate(1)} hitSlop={8} style={styles.dateArrow}>
                    <MaterialIcons name="chevron-right" size={22} color={Colors.textSecondary} />
                  </Pressable>
                </View>
              </LiquidGlass>
              {/* Time button */}
              <Pressable onPress={() => setShowBedPicker(true)}>
                {({ pressed }) => (
                  <LiquidGlass radius={Radius.lg} tint={accent.primary} glowColor={accent.primary} intensity={80} pressed={pressed} style={styles.timeBtn}>
                    <Text style={[styles.timeBtnValue, { color: accent.light }]}>
                      {StorageService.formatTime(combinedBedtime().toISOString())}
                    </Text>
                    <MaterialIcons name="access-time" size={18} color={Colors.textMuted} />
                  </LiquidGlass>
                )}
              </Pressable>
            </View>
          </LiquidGlass>

          {/* Duration bridge */}
          <View style={styles.durationRow}>
            <View style={[styles.durationLine, { backgroundColor: accent.primary + '40' }]} />
            <LiquidGlass radius={Radius.full} tint={Colors.accent} glowColor={Colors.accent} intensity={75} style={styles.durationBadge}>
              <View style={styles.durationBadgeContent}>
                <MaterialIcons name="nightlight-round" size={12} color={Colors.accent} />
                <Text style={[styles.durationText, { color: Colors.accent }]}>
                  {duration > 0 ? StorageService.formatDuration(duration) : '—'}
                </Text>
              </View>
            </LiquidGlass>
            <View style={[styles.durationLine, { backgroundColor: accent.primary + '40' }]} />
          </View>

          {/* Wake */}
          <LiquidGlass radius={Radius.xl} tint={Colors.accent} glowColor={Colors.accent} intensity={85} style={[styles.block, { marginBottom: Spacing.xl }]}>
            <View style={styles.timeBlockContent}>
              <View style={styles.timeBlockHeader}>
                <MaterialIcons name="wb-sunny" size={15} color={Colors.accent} />
                <Text style={styles.timeBlockLabel}>Wake up</Text>
              </View>
              {sameDay ? (
                <LiquidGlass radius={Radius.md} intensity={65} style={styles.sameDayBadge}>
                  <View style={styles.sameDayContent}>
                    <MaterialIcons name="lock" size={13} color={Colors.textMuted} />
                    <Text style={styles.sameDayText}>Same day as bedtime ({formatDateLabel(bedDate)})</Text>
                  </View>
                </LiquidGlass>
              ) : (
                <LiquidGlass radius={Radius.md} intensity={72} style={styles.dateNav}>
                  <View style={styles.dateNavContent}>
                    <Pressable onPress={() => shiftWakeDate(-1)} hitSlop={8} style={styles.dateArrow}>
                      <MaterialIcons name="chevron-left" size={22} color={Colors.textSecondary} />
                    </Pressable>
                    <Text style={styles.dateText}>{formatDateLabel(wakeDate)}</Text>
                    <Pressable onPress={() => shiftWakeDate(1)} hitSlop={8} style={styles.dateArrow}>
                      <MaterialIcons name="chevron-right" size={22} color={Colors.textSecondary} />
                    </Pressable>
                  </View>
                </LiquidGlass>
              )}
              <Pressable onPress={() => setShowWakePicker(true)}>
                {({ pressed }) => (
                  <LiquidGlass radius={Radius.lg} tint={Colors.accent} glowColor={Colors.accent} intensity={80} pressed={pressed} style={styles.timeBtn}>
                    <Text style={[styles.timeBtnValue, { color: Colors.accentSoft }]}>
                      {StorageService.formatTime(combinedWakeTime().toISOString())}
                    </Text>
                    <MaterialIcons name="access-time" size={18} color={Colors.textMuted} />
                  </LiquidGlass>
                )}
              </Pressable>
            </View>
          </LiquidGlass>

          {/* Sleep Quality */}
          <Text style={styles.sectionTitle}>Sleep Quality</Text>
          <LiquidGlass radius={Radius.xl} tint={accent.primary} glowColor={accent.primary} intensity={85} style={styles.block}>
            <View style={styles.qualityContent}>
              <StarRating value={quality} onChange={setQuality} size={38} />
              <Text style={[styles.qualityHint, { color: accent.light }]}>
                {quality===1?'Poor':quality===2?'Fair':quality===3?'Okay':quality===4?'Good':'Excellent'}
              </Text>
            </View>
          </LiquidGlass>

          {/* Mood */}
          <Text style={[styles.sectionTitle, { marginTop: Spacing.xl }]}>Mood on Waking</Text>
          <View style={styles.moodGrid}>
            {WAKE_MOODS.map((mood) => {
              const sel = wakeMood === mood.id;
              return (
                <Pressable key={mood.id} onPress={() => setWakeMood(mood.id)} style={styles.moodBtnWrap}>
                  {({ pressed }) => (
                    <LiquidGlass
                      radius={Radius.xl}
                      tint={sel ? accent.primary : undefined}
                      glowColor={sel ? accent.primary : 'transparent'}
                      intensity={sel ? 88 : 68}
                      pressed={pressed}
                    >
                      {sel && (
                        <LinearGradient
                          colors={[accent.primary + '28', 'transparent']}
                          style={[StyleSheet.absoluteFill, { borderRadius: Radius.xl }]}
                          start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }}
                          pointerEvents="none"
                        />
                      )}
                      <View style={styles.moodContent}>
                        <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                        <Text style={[styles.moodLabel, sel && { color: accent.light }]}>{mood.label}</Text>
                      </View>
                    </LiquidGlass>
                  )}
                </Pressable>
              );
            })}
          </View>

          {/* Save */}
          <Pressable onPress={handleSave} style={styles.saveBtnWrap}>
            {({ pressed }) => (
              <LiquidGlass radius={Radius.xl} tint={accent.primary} glowColor={accent.primary} intensity={92} pressed={pressed} style={styles.saveBtn}>
                <LinearGradient
                  colors={[accent.primary + 'CC', accent.primaryDark + 'BB']}
                  style={[StyleSheet.absoluteFill, { borderRadius: Radius.xl }]}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                  pointerEvents="none"
                />
                <MaterialIcons name="check" size={22} color="#fff" />
                <Text style={styles.saveBtnText}>Save &amp; Add Dreams</Text>
              </LiquidGlass>
            )}
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
  glow: { position: 'absolute', width: 300, height: 300, borderRadius: 150, top: -80, right: -70 },
  nav: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.base, paddingVertical: Spacing.md,
  },
  navBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  navTitle: { fontSize: Typography.base, fontWeight: Typography.bold, color: Colors.textPrimary },
  saveChip: { paddingHorizontal: Spacing.base, paddingVertical: Spacing.sm },
  saveChipText: { color: '#fff', fontWeight: Typography.semiBold, fontSize: Typography.base },
  content: { paddingHorizontal: Spacing.base, paddingBottom: Spacing.xxxl },

  block: { marginBottom: Spacing.sm },
  sectionTitle: {
    fontSize: Typography.xs, fontWeight: Typography.bold, color: Colors.textMuted,
    textTransform: 'uppercase', letterSpacing: 1, marginBottom: Spacing.md, marginLeft: Spacing.xs,
  },

  toggleContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.base, gap: Spacing.base },
  toggleInfo: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, flex: 1 },
  toggleIcon: {},
  toggleLabel: { fontSize: Typography.base, fontWeight: Typography.semiBold, color: Colors.textPrimary },
  toggleSub: { fontSize: Typography.xs, color: Colors.textMuted, marginTop: 2 },

  timeBlockContent: { padding: Spacing.base, gap: Spacing.md },
  timeBlockHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  timeBlockLabel: { fontSize: Typography.xs, fontWeight: Typography.bold, color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.8 },

  dateNav: {},
  dateNavContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: Spacing.xs, paddingHorizontal: Spacing.xs },
  dateArrow: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  dateText: { fontSize: Typography.sm, fontWeight: Typography.semiBold, color: Colors.textPrimary, flex: 1, textAlign: 'center' },

  sameDayBadge: {},
  sameDayContent: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, padding: Spacing.md },
  sameDayText: { fontSize: Typography.xs, color: Colors.textMuted, flex: 1 },

  timeBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.base, paddingVertical: Spacing.md + 2 },
  timeBtnValue: { fontSize: Typography.xl, fontWeight: Typography.extraBold, letterSpacing: 1 },

  durationRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginVertical: Spacing.sm, paddingHorizontal: Spacing.sm },
  durationLine: { flex: 1, height: 1 },
  durationBadge: {},
  durationBadgeContent: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs + 2 },
  durationText: { fontSize: Typography.sm, fontWeight: Typography.bold, letterSpacing: 0.3 },

  qualityContent: { padding: Spacing.xl, alignItems: 'center', gap: Spacing.md },
  qualityHint: { fontSize: Typography.base, fontWeight: Typography.semiBold, letterSpacing: 0.3 },

  moodGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md, marginBottom: Spacing.xl },
  moodBtnWrap: { flex: 1, minWidth: '28%' },
  moodContent: { paddingVertical: Spacing.md, alignItems: 'center', gap: Spacing.xs },
  moodEmoji: { fontSize: Typography.xl },
  moodLabel: { fontSize: Typography.xs, color: Colors.textMuted, fontWeight: Typography.semiBold },

  saveBtnWrap: {},
  saveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, paddingVertical: Spacing.base + 4 },
  saveBtnText: { fontSize: Typography.base, fontWeight: Typography.bold, color: '#fff', letterSpacing: 0.3 },
});
