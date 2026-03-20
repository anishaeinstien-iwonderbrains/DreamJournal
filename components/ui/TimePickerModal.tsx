import React, { useState, useRef, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
} from 'react-native';
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
        {/* Frosted highlight band */}
        <View style={[colStyles.highlight, { backgroundColor: accentColor + '20', borderColor: accentColor + '45' }]} pointerEvents="none" />
        {/* Top fade */}
        <View style={colStyles.fadeTop} pointerEvents="none" />
        {/* Bottom fade */}
        <View style={colStyles.fadeBottom} pointerEvents="none" />
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
                style={[colStyles.item, isSel && colStyles.itemSel]}
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

  const formatPreview = () => {
    const hStr = String(hour).padStart(2, '0');
    const mStr = String(minute).padStart(2, '0');
    return `${hStr}:${mStr} ${period}`;
  };

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
        <View style={styles.modal}>
          {/* Top highlight */}
          <View style={styles.topHighlight} />
          {/* Handle */}
          <View style={styles.handle} />
          <Text style={styles.title}>{title}</Text>

          {/* Preview — glowing */}
          <View style={[styles.previewRow, { borderColor: accent.primary + '50', backgroundColor: accent.primary + '12' }]}>
            <View style={[styles.previewGlow, { backgroundColor: accent.primary + '20' }]} />
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
            <View style={colStyles.col}>
              <Text style={colStyles.label}>Period</Text>
              <View style={styles.ampmCol}>
                {periods.map((p) => (
                  <Pressable
                    key={p}
                    onPress={() => setPeriod(p)}
                    style={({ pressed }) => [
                      styles.ampmBtn,
                      period === p && [
                        styles.ampmBtnSel,
                        {
                          backgroundColor: accent.primary,
                          borderColor: accent.light,
                          shadowColor: accent.primary,
                        },
                      ],
                      pressed && { opacity: 0.8 },
                    ]}
                  >
                    {period === p && <View style={[styles.ampmHighlight, { backgroundColor: accent.light + '30' }]} />}
                    <Text style={[styles.ampmText, period === p && styles.ampmTextSel]}>{p}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>

          <View style={styles.actions}>
            <Pressable onPress={onCancel} style={[styles.btn, styles.btnCancel]}>
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
              <View style={styles.btnHighlight} />
              <Text style={styles.btnConfirmText}>Set Time</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const colStyles = StyleSheet.create({
  col: { alignItems: 'center', flex: 1 },
  label: {
    fontSize: Typography.xs,
    color: Colors.textMuted,
    marginBottom: Spacing.sm,
    fontWeight: Typography.semiBold,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  scrollWrap: {
    height: ITEM_HEIGHT * 5,
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
    borderRadius: Radius.md,
  },
  highlight: {
    position: 'absolute',
    top: ITEM_HEIGHT * 2,
    left: 4,
    right: 4,
    height: ITEM_HEIGHT,
    borderRadius: Radius.md,
    borderWidth: 1,
    zIndex: 1,
  },
  fadeTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: ITEM_HEIGHT * 2,
    backgroundColor: 'rgba(6,4,15,0.65)',
    zIndex: 2,
    pointerEvents: 'none',
  },
  fadeBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: ITEM_HEIGHT * 2,
    backgroundColor: 'rgba(6,4,15,0.65)',
    zIndex: 2,
    pointerEvents: 'none',
  },
  scroll: { flex: 1 },
  item: {
    height: ITEM_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.md,
    marginHorizontal: 4,
  },
  itemSel: {},
  itemText: {
    fontSize: Typography.md,
    color: Colors.textMuted,
    fontWeight: Typography.medium,
  },
  itemTextSel: {
    fontWeight: Typography.extraBold,
    fontSize: Typography.xl,
  },
});

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.80)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  modal: {
    backgroundColor: 'rgba(18,14,40,0.95)',
    borderRadius: Radius.xxl,
    padding: Spacing.xl,
    width: '100%',
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.6,
    shadowRadius: 40,
    elevation: 20,
  },
  topHighlight: {
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    height: 1,
    backgroundColor: Colors.glassHighlight,
    borderRadius: Radius.full,
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: Colors.glassBorder,
    borderRadius: Radius.full,
    alignSelf: 'center',
    marginBottom: Spacing.base,
  },
  title: {
    fontSize: Typography.lg,
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.base,
  },
  previewRow: {
    alignItems: 'center',
    marginBottom: Spacing.base,
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  previewGlow: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
    borderBottomLeftRadius: Radius.lg,
    borderBottomRightRadius: Radius.lg,
  },
  preview: {
    fontSize: Typography.xxl,
    fontWeight: Typography.extraBold,
    letterSpacing: 3,
  },
  pickers: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginBottom: Spacing.base,
  },
  colon: {
    fontSize: Typography.xxl,
    color: Colors.textSecondary,
    marginTop: ITEM_HEIGHT * 2 + 28,
    paddingHorizontal: 2,
    fontWeight: Typography.bold,
  },
  spacer: { width: Spacing.md },
  ampmCol: {
    gap: Spacing.md,
    marginTop: ITEM_HEIGHT * 2,
  },
  ampmBtn: {
    width: 58,
    height: ITEM_HEIGHT,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.glass,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0,
    shadowRadius: 10,
    elevation: 0,
  },
  ampmBtnSel: {
    shadowOpacity: 0.5,
    elevation: 6,
  },
  ampmHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '45%',
    borderTopLeftRadius: Radius.md,
    borderTopRightRadius: Radius.md,
  },
  ampmText: {
    fontSize: Typography.base,
    fontWeight: Typography.semiBold,
    color: Colors.textMuted,
  },
  ampmTextSel: {
    color: Colors.textOnPrimary,
    fontWeight: Typography.bold,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  btn: {
    flex: 1,
    paddingVertical: Spacing.md + 2,
    borderRadius: Radius.lg,
    alignItems: 'center',
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  btnHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '45%',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderTopLeftRadius: Radius.lg,
    borderTopRightRadius: Radius.lg,
  },
  btnCancel: {
    backgroundColor: Colors.glass,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    shadowOpacity: 0,
    elevation: 0,
  },
  btnCancelText: {
    color: Colors.textSecondary,
    fontWeight: Typography.medium,
    fontSize: Typography.base,
  },
  btnConfirmText: {
    color: Colors.textOnPrimary,
    fontWeight: Typography.semiBold,
    fontSize: Typography.base,
  },
});
