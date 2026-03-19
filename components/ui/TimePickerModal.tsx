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

const ITEM_HEIGHT = 48;

function PickerColumn({
  items,
  selected,
  onSelect,
  label,
  renderLabel,
  visProp,
}: {
  items: number[] | string[];
  selected: number | string;
  onSelect: (v: any) => void;
  label: string;
  renderLabel?: (v: any) => string;
  visProp: boolean;
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
        <View style={colStyles.highlight} pointerEvents="none" />
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
                <Text style={[colStyles.itemText, isSel && colStyles.itemTextSel]}>
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

  const colHighlight = { ...colStyles.highlight, backgroundColor: accent.primary + '28', borderColor: accent.primary + '40' };

  return (
    <Modal visible={visProp} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Handle */}
          <View style={styles.handle} />
          <Text style={styles.title}>{title}</Text>

          {/* Preview */}
          <View style={[styles.previewRow, { borderColor: accent.primary + '40' }]}>
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
            />
            <Text style={styles.colon}>:</Text>
            <PickerColumn
              items={minutes}
              selected={minute}
              onSelect={setMinute}
              label="Min"
              renderLabel={(v) => String(v).padStart(2, '0')}
              visProp={visProp}
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
                      period === p && [styles.ampmBtnSel, { backgroundColor: accent.primary, borderColor: accent.light }],
                      pressed && { opacity: 0.8 },
                    ]}
                  >
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
              style={[styles.btn, { backgroundColor: accent.primary }]}
            >
              <Text style={styles.btnConfirmText}>Set Time</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const colStyles = StyleSheet.create({
  col: {
    alignItems: 'center',
    flex: 1,
  },
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
  },
  highlight: {
    position: 'absolute',
    top: ITEM_HEIGHT * 2,
    left: 4,
    right: 4,
    height: ITEM_HEIGHT,
    backgroundColor: Colors.primary + '28',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.primary + '40',
    zIndex: 1,
  },
  scroll: {
    flex: 1,
  },
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
  },
  itemTextSel: {
    color: Colors.primaryLight,
    fontWeight: Typography.bold,
    fontSize: Typography.xl,
  },
});

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  modal: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.xxl,
    padding: Spacing.xl,
    width: '100%',
    borderWidth: 1,
    borderColor: Colors.glassBorder,
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
    backgroundColor: Colors.glass,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  preview: {
    fontSize: Typography.xxl,
    fontWeight: Typography.extraBold,
    letterSpacing: 2,
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
  },
  spacer: {
    width: Spacing.md,
  },
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
  },
  ampmBtnSel: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primaryLight,
  },
  ampmText: {
    fontSize: Typography.base,
    fontWeight: Typography.semiBold,
    color: Colors.textMuted,
  },
  ampmTextSel: {
    color: Colors.textOnPrimary,
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
  },
  btnCancel: {
    backgroundColor: Colors.glass,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
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
