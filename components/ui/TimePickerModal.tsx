import React, { useState, useRef, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';

interface TimePickerModalProps {
  visible: boolean;
  value: Date;
  title: string;
  onConfirm: (date: Date) => void;
  onCancel: () => void;
}

const ITEM_HEIGHT = 52;

function PickerColumn({
  items,
  selected,
  onSelect,
  label,
  renderLabel,
  visProp,
  accentColor,
}: {
  items: number[] | string[];
  selected: number | string;
  onSelect: (v: any) => void;
  label: string;
  renderLabel?: (v: any) => string;
  visProp: boolean;
  accentColor: string;
}) {
  const scrollRef = useRef<ScrollView>(null);
  const idx = (items as any[]).indexOf(selected);

  useEffect(() => {
    if (scrollRef.current && idx >= 0) {
      scrollRef.current.scrollTo({ y: idx * ITEM_HEIGHT, animated: false });
    }
  }, [visProp]);

  return (
    <View style={colStyles.col}>
      <Text style={colStyles.label}>{label}</Text>
      <View style={colStyles.scrollWrap}>
        {/* Selected item highlight — glass */}
        <View style={[colStyles.highlight, { borderColor: accentColor + '50' }]} pointerEvents="none">
          <BlurView intensity={50} tint="dark" style={[StyleSheet.absoluteFill, { borderRadius: Radius.md }]} />
          <View style={[StyleSheet.absoluteFill, { backgroundColor: accentColor + '12', borderRadius: Radius.md }]} />
          {/* Top shimmer on selection band */}
          <LinearGradient
            colors={['rgba(255,255,255,0.20)', 'rgba(255,255,255,0.00)']}
            style={[StyleSheet.absoluteFill, { borderTopLeftRadius: Radius.md, borderTopRightRadius: Radius.md }]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            pointerEvents="none"
          />
        </View>
        {/* Fade overlays */}
        <LinearGradient
          colors={['rgba(4,3,12,0.92)', 'rgba(4,3,12,0.00)']}
          style={colStyles.fadeTop}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          pointerEvents="none"
        />
        <LinearGradient
          colors={['rgba(4,3,12,0.00)', 'rgba(4,3,12,0.92)']}
          style={colStyles.fadeBottom}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          pointerEvents="none"
        />
        <ScrollView
          ref={scrollRef}
          style={colStyles.scroll}
          showsVerticalScrollIndicator={false}
          snapToInterval={ITEM_HEIGHT}
          decelerationRate="fast"
        >
          <View style={{ height: ITEM_HEIGHT * 2 }} />
          {(items as any[]).map((v) => {
            const isSel = v === selected;
            return (
              <Pressable
                key={String(v)}
                onPress={() => onSelect(v)}
                style={colStyles.item}
              >
                <Text style={[colStyles.itemText, isSel && [colStyles.itemTextSel, { color: accentColor }]]}>
                  {renderLabel ? renderLabel(v) : String(v).padStart(2, '0')}
                </Text>
              </Pressable>
            );
          })}
          <View style={{ height: ITEM_HEIGHT * 2 }} />
        </ScrollView>
      </View>
    </View>
  );
}

export function TimePickerModal({ visible: visProp, value, title, onConfirm, onCancel }: TimePickerModalProps) {
  const { accent } = useTheme();
  const rawHour = value.getHours();
  const initPeriod = rawHour < 12 ? 'AM' : 'PM';
  const initHour = rawHour % 12 === 0 ? 12 : rawHour % 12;

  const [hour, setHour] = useState(initHour);
  const [minute, setMinute] = useState(value.getMinutes());
  const [period, setPeriod] = useState<'AM' | 'PM'>(initPeriod);

  useEffect(() => {
    if (visProp) {
      const h = value.getHours();
      setPeriod(h < 12 ? 'AM' : 'PM');
      setHour(h % 12 === 0 ? 12 : h % 12);
      setMinute(value.getMinutes());
    }
  }, [visProp]);

  const hours12 = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  const minutes = Array.from({ length: 60 }, (_, i) => i);
  const periods: ('AM' | 'PM')[] = ['AM', 'PM'];

  const formatPreview = () => `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')} ${period}`;

  const handleConfirm = () => {
    const d = new Date(value);
    let h24 = hour % 12;
    if (period === 'PM') h24 += 12;
    d.setHours(h24, minute, 0, 0);
    onConfirm(d);
  };

  return (
    <Modal visible={visProp} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        {/* Modal panel — strong blur glass */}
        <View style={styles.modalOuter}>
          <BlurView intensity={85} tint="dark" style={[StyleSheet.absoluteFill, { borderRadius: Radius.xxl }]} />
          {/* Dark tinted fill */}
          <View style={[StyleSheet.absoluteFill, styles.modalFill, { borderRadius: Radius.xxl }]} />
          {/* Specular shimmer */}
          <LinearGradient
            colors={['rgba(255,255,255,0.28)', 'rgba(255,255,255,0.00)']}
            style={[styles.modalShimmer, { borderTopLeftRadius: Radius.xxl, borderTopRightRadius: Radius.xxl }]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            pointerEvents="none"
          />
          {/* Top bright line */}
          <View style={styles.modalTopLine} />

          <View style={styles.modalContent}>
            {/* Handle */}
            <View style={styles.handle} />
            <Text style={styles.title}>{title}</Text>

            {/* Preview — glowing glass pill */}
            <View
              style={[styles.previewOuter, { borderColor: accent.primary + '55', shadowColor: accent.primary }]}
            >
              <BlurView intensity={55} tint="dark" style={[StyleSheet.absoluteFill, { borderRadius: Radius.lg }]} />
              <View style={[StyleSheet.absoluteFill, { backgroundColor: accent.primary + '12', borderRadius: Radius.lg }]} />
              <LinearGradient
                colors={['rgba(255,255,255,0.20)', 'rgba(255,255,255,0.00)']}
                style={[StyleSheet.absoluteFill, { borderTopLeftRadius: Radius.lg, borderTopRightRadius: Radius.lg }]}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 0.55 }}
                pointerEvents="none"
              />
              <View style={[styles.previewTopLine, { backgroundColor: accent.light + '50' }]} />
              <Text style={[styles.preview, { color: accent.light }]}>{formatPreview()}</Text>
            </View>

            <View style={styles.pickers}>
              <PickerColumn
                items={hours12}
                selected={hour}
                onSelect={setHour}
                label="Hour"
                renderLabel={(v) => String(v).padStart(2, '0')}
                visProp={visProp}
                accentColor={accent.primary}
              />
              <Text style={styles.colon}>:</Text>
              <PickerColumn
                items={minutes}
                selected={minute}
                onSelect={setMinute}
                label="Min"
                renderLabel={(v) => String(v).padStart(2, '0')}
                visProp={visProp}
                accentColor={accent.primary}
              />
              <View style={styles.spacer} />
              {/* AM/PM column */}
              <View style={colStyles.col}>
                <Text style={colStyles.label}>AM/PM</Text>
                <View style={styles.ampmCol}>
                  {periods.map((p) => {
                    const sel = period === p;
                    return (
                      <Pressable
                        key={p}
                        onPress={() => setPeriod(p)}
                        style={({ pressed }) => [
                          styles.ampmBtn,
                          sel ? { borderColor: accent.light + '60', shadowColor: accent.primary } : { borderColor: Colors.glassBorder },
                          pressed && { opacity: 0.8 },
                        ]}
                      >
                        <BlurView intensity={sel ? 65 : 40} tint="dark" style={[StyleSheet.absoluteFill, { borderRadius: Radius.md }]} />
                        <View style={[StyleSheet.absoluteFill, { backgroundColor: sel ? accent.primary + '22' : 'rgba(255,255,255,0.04)', borderRadius: Radius.md }]} />
                        <LinearGradient
                          colors={['rgba(255,255,255,0.22)', 'rgba(255,255,255,0.00)']}
                          style={[StyleSheet.absoluteFill, { borderTopLeftRadius: Radius.md, borderTopRightRadius: Radius.md }]}
                          start={{ x: 0.5, y: 0 }}
                          end={{ x: 0.5, y: 1 }}
                          pointerEvents="none"
                        />
                        {sel ? (
                          <View style={[styles.ampmTopLine, { backgroundColor: accent.light + '50' }]} />
                        ) : null}
                        <Text style={[styles.ampmText, sel && { color: accent.light, fontWeight: Typography.bold }]}>{p}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            </View>

            <View style={styles.actions}>
              <Pressable onPress={onCancel} style={[styles.btn, styles.btnCancel]}>
                <BlurView intensity={45} tint="dark" style={[StyleSheet.absoluteFill, { borderRadius: Radius.lg }]} />
                <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: Radius.lg }]} />
                <LinearGradient
                  colors={['rgba(255,255,255,0.16)', 'rgba(255,255,255,0.00)']}
                  style={[StyleSheet.absoluteFill, { borderTopLeftRadius: Radius.lg, borderTopRightRadius: Radius.lg }]}
                  start={{ x: 0.5, y: 0 }}
                  end={{ x: 0.5, y: 1 }}
                  pointerEvents="none"
                />
                <Text style={styles.btnCancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={handleConfirm}
                style={({ pressed }) => [
                  styles.btn,
                  { backgroundColor: accent.primary, shadowColor: accent.primary },
                  pressed && { opacity: 0.85 },
                ]}
              >
                <LinearGradient
                  colors={['rgba(255,255,255,0.28)', 'rgba(255,255,255,0.00)']}
                  style={[StyleSheet.absoluteFill, { borderTopLeftRadius: Radius.lg, borderTopRightRadius: Radius.lg }]}
                  start={{ x: 0.5, y: 0 }}
                  end={{ x: 0.5, y: 0.55 }}
                  pointerEvents="none"
                />
                <Text style={styles.btnConfirmText}>Set Time</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const colStyles = StyleSheet.create({
  col: { alignItems: 'center', flex: 1 },
  label: {
    fontSize: Typography.xs, color: Colors.textMuted, marginBottom: Spacing.sm,
    fontWeight: Typography.semiBold, textTransform: 'uppercase', letterSpacing: 0.8,
  },
  scrollWrap: {
    height: ITEM_HEIGHT * 5, width: '100%', position: 'relative', overflow: 'hidden', borderRadius: Radius.md,
  },
  highlight: {
    position: 'absolute', top: ITEM_HEIGHT * 2, left: 4, right: 4, height: ITEM_HEIGHT,
    borderRadius: Radius.md, borderWidth: 1, zIndex: 1, overflow: 'hidden',
  },
  fadeTop: {
    position: 'absolute', top: 0, left: 0, right: 0, height: ITEM_HEIGHT * 2, zIndex: 2,
  },
  fadeBottom: {
    position: 'absolute', bottom: 0, left: 0, right: 0, height: ITEM_HEIGHT * 2, zIndex: 2,
  },
  scroll: { flex: 1 },
  item: { height: ITEM_HEIGHT, alignItems: 'center', justifyContent: 'center', borderRadius: Radius.md, marginHorizontal: 4 },
  itemText: { fontSize: Typography.md, color: Colors.textMuted, fontWeight: Typography.medium },
  itemTextSel: { fontWeight: Typography.extraBold, fontSize: Typography.xl },
});

const styles = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'center',
    alignItems: 'center', paddingHorizontal: Spacing.xl,
  },
  modalOuter: {
    width: '100%', borderRadius: Radius.xxl, borderWidth: 1, borderColor: 'rgba(255,255,255,0.20)',
    overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 24 }, shadowOpacity: 0.65, shadowRadius: 48, elevation: 24,
  },
  modalFill: { backgroundColor: 'rgba(4,3,12,0.55)' },
  modalShimmer: { position: 'absolute', top: 0, left: 0, right: 0, height: 60 },
  modalTopLine: {
    position: 'absolute', top: 0, left: Radius.xxl * 0.5, right: Radius.xxl * 0.5,
    height: 1, backgroundColor: 'rgba(255,255,255,0.55)',
  },
  modalContent: { padding: Spacing.xl },
  handle: {
    width: 36, height: 4, backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: Radius.full, alignSelf: 'center', marginBottom: Spacing.base,
  },
  title: {
    fontSize: Typography.lg, fontWeight: Typography.bold, color: Colors.textPrimary, textAlign: 'center', marginBottom: Spacing.base,
  },
  // Preview pill
  previewOuter: {
    alignItems: 'center', marginBottom: Spacing.base, paddingVertical: Spacing.md,
    borderRadius: Radius.lg, borderWidth: 1, overflow: 'hidden',
    shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.50, shadowRadius: 16, elevation: 8,
  },
  previewTopLine: { position: 'absolute', top: 0, left: Radius.lg * 0.5, right: Radius.lg * 0.5, height: 1 },
  preview: { fontSize: Typography.xxl, fontWeight: Typography.extraBold, letterSpacing: 3 },
  pickers: {
    flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'center', marginBottom: Spacing.base,
  },
  colon: {
    fontSize: Typography.xxl, color: Colors.textSecondary, marginTop: ITEM_HEIGHT * 2 + 28,
    paddingHorizontal: 2, fontWeight: Typography.bold,
  },
  spacer: { width: Spacing.md },
  ampmCol: { gap: Spacing.md, marginTop: ITEM_HEIGHT * 2 },
  ampmBtn: {
    width: 62, height: ITEM_HEIGHT, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, overflow: 'hidden',
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.30, shadowRadius: 10, elevation: 5,
  },
  ampmTopLine: { position: 'absolute', top: 0, left: 6, right: 6, height: 1 },
  ampmText: { fontSize: Typography.base, fontWeight: Typography.semiBold, color: Colors.textSecondary },
  actions: { flexDirection: 'row', gap: Spacing.md },
  btn: {
    flex: 1, paddingVertical: Spacing.md + 2, borderRadius: Radius.lg, alignItems: 'center',
    overflow: 'hidden', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.45, shadowRadius: 14, elevation: 8,
  },
  btnCancel: { borderWidth: 1, borderColor: Colors.glassBorder, shadowOpacity: 0, elevation: 0 },
  btnCancelText: { color: Colors.textSecondary, fontWeight: Typography.medium, fontSize: Typography.base },
  btnConfirmText: { color: Colors.textOnPrimary, fontWeight: Typography.semiBold, fontSize: Typography.base },
});
