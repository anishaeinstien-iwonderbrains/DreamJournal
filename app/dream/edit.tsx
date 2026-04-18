import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable,
  TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { LiquidGlass } from '@/components/ui/LiquidGlass';
import { useSessions } from '@/hooks/useSessions';
import { useTheme } from '@/hooks/useTheme';
import { StorageService } from '@/services/storage';
import { Colors, Typography, Spacing, Radius, DREAM_TAGS } from '@/constants/theme';
import { TagChip } from '@/components/ui/TagChip';
import { useAlert } from '@/template';

export default function DreamEditScreen() {
  const { sessionId, dreamId } = useLocalSearchParams<{ sessionId: string; dreamId?: string }>();
  const router = useRouter();
  const { sessions, updateSession } = useSessions();
  const { showAlert } = useAlert();
  const { accent } = useTheme();

  const session = useMemo(() => sessions.find((s) => s.id === sessionId), [sessions, sessionId]);
  const existingDream = useMemo(() => session?.dreams.find((d) => d.id === dreamId), [session, dreamId]);

  const [title, setTitle] = useState(existingDream?.title ?? '');
  const [description, setDescription] = useState(existingDream?.description ?? '');
  const [selectedTags, setSelectedTags] = useState<string[]>(existingDream?.tags ?? []);
  const isEditing = Boolean(dreamId);

  const toggleTag = (tagId: string) =>
    setSelectedTags((prev) => prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId]);

  const handleSave = async () => {
    if (!session) return;
    if (!title.trim() && !description.trim()) {
      showAlert('Empty Dream', 'Please add a title or description before saving.');
      return;
    }
    const dream = {
      id: existingDream?.id ?? StorageService.generateId(),
      title: title.trim(), description: description.trim(), tags: selectedTags,
      createdAt: existingDream?.createdAt ?? new Date().toISOString(),
    };
    const updatedDreams = isEditing
      ? session.dreams.map((d) => (d.id === dreamId ? dream : d))
      : [...session.dreams, dream];
    await updateSession({ ...session, dreams: updatedDreams });
    router.back();
  };

  if (!session) {
    return (
      <SafeAreaView style={styles.safe} edges={['top','bottom']}>
        <View style={styles.centered}><Text style={styles.errorText}>Session not found.</Text></View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top','bottom']}>
      <View style={[styles.glow, { backgroundColor: accent.primary + '18' }]} pointerEvents="none" />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        {/* Nav */}
        <View style={styles.nav}>
          <Pressable onPress={() => router.back()} hitSlop={8}>
            {({ pressed }) => (
              <LiquidGlass radius={Radius.full} intensity={85} pressed={pressed} style={styles.navBtn}>
                <MaterialIcons name="close" size={22} color={Colors.textPrimary} />
              </LiquidGlass>
            )}
          </Pressable>
          <View style={styles.navCenter}>
            <Text style={styles.navTitle}>{isEditing ? 'Edit Dream' : 'New Dream'}</Text>
            {session ? <Text style={styles.navSub}>{StorageService.formatDate(session.bedtime)}</Text> : null}
          </View>
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

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {/* Prompt header */}
          <LiquidGlass radius={Radius.xl} tint={accent.primary} glowColor={accent.primary} intensity={88} style={styles.promptCard}>
            <View style={styles.promptContent}>
              <Text style={styles.promptEmoji}>🌙</Text>
              <Text style={[styles.promptText, { color: accent.light }]}>What did you dream about?</Text>
            </View>
          </LiquidGlass>

          {/* Title input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Dream Title</Text>
            <LiquidGlass
              radius={Radius.lg}
              tint={title ? accent.primary : undefined}
              glowColor={title ? accent.primary : 'transparent'}
              intensity={78}
              style={styles.inputGlass}
            >
              <TextInput
                style={styles.titleInput}
                value={title}
                onChangeText={setTitle}
                placeholder="Give your dream a name..."
                placeholderTextColor={Colors.textMuted}
                returnKeyType="next"
                maxLength={80}
              />
            </LiquidGlass>
          </View>

          {/* Description */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Dream Journal</Text>
            <LiquidGlass
              radius={Radius.lg}
              tint={description ? accent.primary : undefined}
              glowColor={description ? accent.primary : 'transparent'}
              intensity={78}
              style={styles.inputGlass}
            >
              <TextInput
                style={styles.journalInput}
                value={description}
                onChangeText={setDescription}
                placeholder="Describe your dream in detail — what happened, who was there, how it felt..."
                placeholderTextColor={Colors.textMuted}
                multiline
                textAlignVertical="top"
              />
            </LiquidGlass>
            {description.length > 0 && (
              <Text style={styles.charCount}>{description.length} characters</Text>
            )}
          </View>

          {/* Tags */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Tags</Text>
            <View style={styles.tagsGrid}>
              {DREAM_TAGS.map((tag) => (
                <TagChip
                  key={tag.id}
                  label={tag.label}
                  color={tag.color}
                  selected={selectedTags.includes(tag.id)}
                  onPress={() => toggleTag(tag.id)}
                />
              ))}
            </View>
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
                <MaterialIcons name={isEditing ? 'save' : 'add'} size={22} color="#fff" />
                <Text style={styles.saveBtnText}>{isEditing ? 'Save Changes' : 'Add Dream'}</Text>
              </LiquidGlass>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  glow: { position: 'absolute', width: 260, height: 260, borderRadius: 130, top: -50, left: -60 },
  nav: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.base, paddingVertical: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  navBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  navCenter: { alignItems: 'center' },
  navTitle: { fontSize: Typography.base, fontWeight: Typography.bold, color: Colors.textPrimary },
  navSub: { fontSize: Typography.xs, color: Colors.textMuted, marginTop: 1 },
  saveChip: { paddingHorizontal: Spacing.base, paddingVertical: Spacing.sm },
  saveChipText: { color: '#fff', fontWeight: Typography.semiBold, fontSize: Typography.base },
  content: { paddingHorizontal: Spacing.base, paddingBottom: Spacing.xxxl, paddingTop: Spacing.base },

  promptCard: { marginBottom: Spacing.xl },
  promptContent: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: Spacing.base },
  promptEmoji: { fontSize: 28 },
  promptText: { fontSize: Typography.base, fontWeight: Typography.semiBold, flex: 1 },

  inputGroup: { marginBottom: Spacing.xl },
  inputLabel: {
    fontSize: Typography.xs, fontWeight: Typography.bold, color: Colors.textMuted,
    marginBottom: Spacing.sm, textTransform: 'uppercase', letterSpacing: 0.8,
  },
  inputGlass: {},
  titleInput: {
    paddingHorizontal: Spacing.base, paddingVertical: Spacing.md,
    fontSize: Typography.base, color: Colors.textPrimary, fontWeight: Typography.medium,
  },
  journalInput: {
    paddingHorizontal: Spacing.base, paddingVertical: Spacing.md,
    fontSize: Typography.base, color: Colors.textPrimary, minHeight: 180, lineHeight: Typography.base * 1.65,
  },
  charCount: { fontSize: Typography.xs, color: Colors.textMuted, textAlign: 'right', marginTop: Spacing.xs },
  tagsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },

  saveBtnWrap: {},
  saveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, paddingVertical: Spacing.base + 4, marginTop: Spacing.md },
  saveBtnText: { fontSize: Typography.base, fontWeight: Typography.bold, color: '#fff', letterSpacing: 0.3 },

  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText: { fontSize: Typography.base, color: Colors.textSecondary },
});
