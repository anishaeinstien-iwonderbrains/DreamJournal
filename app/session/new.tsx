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
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useSessions } from '@/hooks/useSessions';
import { useTheme } from '@/hooks/useTheme';
import { StorageService } from '@/services/storage';
import { Colors, Typography, Spacing, Radius, Shadows, WAKE_MOODS } from '@/constants/theme';
import { StarRating } from '@/components/ui/StarRating';
import { TimePickerModal } from '@/components/ui/TimePickerModal';
import { useAlert } from '@/template';

function startOfDay(d: Date): Date {
  const c = new Date(d);
  c.setHours(0, 0, 0, 0);
  return c;
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
  const d = new Date();
  d.setHours(23, 0, 0, 0);
  return d;
}

function addDays(d: Date, n: number): Date {
  const c = new Date(d);
  c.setDate(c.getDate() + n);
  return c;
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
    const d = new Date(bedDate);
    d.setHours(bedTime.getHours(), bedTime.getMinutes(), 0, 0);
    return d;
  };

  const combinedWakeTime = (): Date => {
    const d = new Date(sameDay ? bedDate : wakeDate);
    d.setHours(wakeTime.getHours(), wakeTime.getMinutes(), 0, 0);
    return d;
  };

  const duration = StorageService.computeDuration(
    combinedBedtime().toISOString(),
    combinedWakeTime().toISOString()
  );

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

  const accentPrimary = accent.primary;
  const accentLight = accent.light;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        {/* Nav */}
        <View style={styles.nav}>
          <Pressable onPress={() => router.back()} hitSlop={8} style={styles.backBtn}>
            <MaterialIcons name="arrow-back" size={22} color={Colors.textPrimary} />
          </Pressable>
          <View style={styles.navCenter}>
            <Text style={styles.navTitle}>Log Sleep Session</Text>
          </View>
          <Pressable
            onPress={handleSave}
            style={[styles.saveChip, { backgroundColor: accentPrimary }]}
          >
            <Text style={styles.saveChipText}>Save</Text>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

          {/* ── Same-day toggle ─── */}
          <View style={[styles.toggleRow, { borderColor: accentPrimary + '30' }]}>
            <View style={styles.toggleInfo}>
              <View style={[styles.toggleIcon, { backgroundColor: accentPrimary + '20' }]}>
                <MaterialIcons name="nightlight-round" size={18} color={accentLight} />
              </View>
              <View>
                <Text style={styles.toggleLabel}>Slept past midnight</Text>
                <Text style={styles.toggleSub}>
                  {sameDay ? 'Same day sleep' : 'Woke up next day'}
                </Text>
              </View>
            </View>
            <Switch
              value={!sameDay}
              onValueChange={(v) => handleToggleSameDay(!v)}
              trackColor={{ false: Colors.surface, true: accentPrimary + '80' }}
              thumbColor={!sameDay ? accentLight : Colors.textMuted}
            />
          </View>

          {/* ── Sleep Times ─── */}
          <Text style={styles.sectionTitle}>Sleep Times</Text>

          {/* Bedtime block */}
          <View style={styles.timeBlock}>
            <View style={styles.timeBlockHeader}>
              <MaterialIcons name="bedtime" size={16} color={accentLight} />
              <Text style={styles.timeBlockLabel}>Bedtime</Text>
            </View>
            <View style={styles.dateNav}>
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
              style={({ pressed }) => [styles.timeBtn, { borderColor: accentPrimary + '40' }, pressed && { opacity: 0.8 }]}
            >
              <Text style={[styles.timeBtnValue, { color: accentLight }]}>
                {StorageService.formatTime(combinedBedtime().toISOString())}
              </Text>
              <MaterialIcons name="access-time" size={18} color={Colors.textMuted} />
            </Pressable>
          </View>

          {/* Duration bridge */}
          <View style={styles.durationRow}>
            <View style={[styles.durationLine, { backgroundColor: accentPrimary + '30' }]} />
            <View style={[styles.durationBadge, { borderColor: Colors.accent + '50', backgroundColor: Colors.accent + '15' }]}>
              <MaterialIcons name="nightlight-round" size={13} color={Colors.accent} />
              <Text style={[styles.durationText, { color: Colors.accent }]}>
                {duration > 0 ? StorageService.formatDuration(duration) : '—'}
              </Text>
            </View>
            <View style={[styles.durationLine, { backgroundColor: accentPrimary + '30' }]} />
          </View>

          {/* Wake block */}
          <View style={styles.timeBlock}>
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
              <View style={styles.dateNav}>
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
              style={({ pressed }) => [styles.timeBtn, { borderColor: Colors.accent + '40' }, pressed && { opacity: 0.8 }]}
            >
              <Text style={[styles.timeBtnValue, { color: Colors.accentSoft }]}>
                {StorageService.formatTime(combinedWakeTime().toISOString())}
              </Text>
              <MaterialIcons name="access-time" size={18} color={Colors.textMuted} />
            </Pressable>
          </View>

          {/* ── Sleep Quality ─── */}
          <Text style={[styles.sectionTitle, { marginTop: Spacing.xl }]}>Sleep Quality</Text>
          <View style={[styles.card, { borderColor: accentPrimary + '30' }]}>
            <StarRating value={quality} onChange={setQuality} size={38} />
            <Text style={[styles.qualityHint, { color: accentLight }]}>
              {quality === 1 ? 'Poor' : quality === 2 ? 'Fair' : quality === 3 ? 'Okay' : quality === 4 ? 'Good' : 'Excellent'}
            </Text>
          </View>

          {/* ── Wake Mood ─── */}
          <Text style={[styles.sectionTitle, { marginTop: Spacing.xl }]}>Mood on Waking</Text>
          <View style={styles.moodGrid}>
            {WAKE_MOODS.map((mood) => (
              <Pressable
                key={mood.id}
                onPress={() => setWakeMood(mood.id)}
                style={({ pressed }) => [
                  styles.moodBtn,
                  wakeMood === mood.id && {
                    backgroundColor: accentPrimary + '25',
                    borderColor: accentPrimary + '80',
                  },
                  pressed && { opacity: 0.8 },
                ]}
              >
                <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                <Text style={[
                  styles.moodLabel,
                  wakeMood === mood.id && { color: accentLight },
                ]}>
                  {mood.label}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* ── Save ─── */}
          <Pressable
            onPress={handleSave}
            style={({ pressed }) => [
              styles.saveBtn,
              { backgroundColor: accentPrimary },
              pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
            ]}
          >
            <MaterialIcons name="check" size={22} color={Colors.textOnPrimary} />
            <Text style={styles.saveBtnText}>Save & Add Dreams</Text>
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
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
  },
  backBtn: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  navCenter: { flex: 1, alignItems: 'center' },
  navTitle: {
    fontSize: Typography.base,
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
  },
  saveChip: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.lg,
  },
  saveChipText: {
    color: Colors.textOnPrimary,
    fontWeight: Typography.semiBold,
    fontSize: Typography.base,
  },
  content: {
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.xxxl,
  },

  // Toggle
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.xl,
    padding: Spacing.base,
    borderWidth: 1,
    marginBottom: Spacing.xl,
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

  sectionTitle: {
    fontSize: Typography.xs,
    fontWeight: Typography.bold,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.md,
    marginLeft: Spacing.xs,
  },

  // Time blocks
  timeBlock: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.xl,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    gap: Spacing.md,
    ...Shadows.sm,
  },
  timeBlockHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  timeBlockLabel: {
    fontSize: Typography.xs,
    fontWeight: Typography.bold,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  dateNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.glass,
    borderRadius: Radius.md,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  dateArrow: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateText: {
    fontSize: Typography.sm,
    fontWeight: Typography.semiBold,
    color: Colors.textPrimary,
    flex: 1,
    textAlign: 'center',
  },
  sameDayBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.glass,
    borderRadius: Radius.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  sameDayText: { fontSize: Typography.xs, color: Colors.textMuted, flex: 1 },
  timeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.bgCardAlt,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md + 2,
    borderWidth: 1,
  },
  timeBtnValue: {
    fontSize: Typography.xl,
    fontWeight: Typography.extraBold,
    letterSpacing: 1,
  },

  // Duration bridge
  durationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
  },
  durationLine: { flex: 1, height: 1 },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  durationText: {
    fontSize: Typography.sm,
    fontWeight: Typography.bold,
    letterSpacing: 0.3,
  },

  // Quality card
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.md,
    borderWidth: 1,
  },
  qualityHint: {
    fontSize: Typography.base,
    fontWeight: Typography.semiBold,
    letterSpacing: 0.3,
  },

  // Mood
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  moodBtn: {
    flex: 1,
    minWidth: '28%',
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.xl,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    gap: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  moodEmoji: { fontSize: Typography.xl },
  moodLabel: {
    fontSize: Typography.xs,
    color: Colors.textMuted,
    fontWeight: Typography.semiBold,
  },

  // Save
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    borderRadius: Radius.xl,
    paddingVertical: Spacing.base + 4,
    ...Shadows.lg,
  },
  saveBtnText: {
    fontSize: Typography.base,
    fontWeight: Typography.bold,
    color: Colors.textOnPrimary,
    letterSpacing: 0.3,
  },
});
