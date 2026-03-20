import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
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
      title: title.trim(),
      description: description.trim(),
      tags: selectedTags,
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
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.centered}>
          <Text style={styles.errorText}>Session not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {/* Background glow */}
      <View style={[styles.glowBlob, { backgroundColor: accent.primary + '18' }]} pointerEvents="none" />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        {/* Nav */}
        <View style={styles.nav}>
          <Pressable onPress={() => router.back()} hitSlop={8} style={styles.navBtn}>
            <MaterialIcons name="close" size={22} color={Colors.textPrimary} />
          </Pressable>
          <View style={styles.navCenter}>
            <Text style={styles.navTitle}>{isEditing ? 'Edit Dream' : 'New Dream'}</Text>
            {session ? <Text style={styles.navSub}>{StorageService.formatDate(session.bedtime)}</Text> : null}
          </View>
          <Pressable
            onPress={handleSave}
            style={({ pressed }) => [
              styles.saveChip,
              { backgroundColor: accent.primary, shadowColor: accent.primary },
              pressed && { opacity: 0.8 },
            ]}
          >
            <View style={styles.saveChipHighlight} />
            <Text style={styles.saveChipText}>Save</Text>
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Prompt header */}
          <View style={[styles.promptBox, { borderColor: accent.primary + '35', backgroundColor: accent.primary + '10' }]}>
            <View style={styles.promptBoxHighlight} />
            <Text style={styles.promptEmoji}>🌙</Text>
            <Text style={[styles.promptText, { color: accent.light }]}>What did you dream about?</Text>
          </View>

          {/* Title */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Dream Title</Text>
            <View style={[
              styles.inputWrap,
              { borderColor: title ? accent.primary + '65' : Colors.glassBorder },
              title ? { shadowColor: accent.primary } : {},
            ]}>
              <View style={styles.inputHighlight} />
              <TextInput
                style={styles.titleInput}
                value={title}
                onChangeText={setTitle}
                placeholder="Give your dream a name..."
                placeholderTextColor={Colors.textMuted}
                returnKeyType="next"
                maxLength={80}
              />
            </View>
          </View>

          {/* Description */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Dream Journal</Text>
            <View style={[
              styles.inputWrap,
              styles.journalWrap,
              { borderColor: description ? accent.primary + '65' : Colors.glassBorder },
              description ? { shadowColor: accent.primary } : {},
            ]}>
              <View style={styles.inputHighlight} />
              <TextInput
                style={styles.journalInput}
                value={description}
                onChangeText={setDescription}
                placeholder="Describe your dream in detail — what happened, who was there, how it felt..."
                placeholderTextColor={Colors.textMuted}
                multiline
                textAlignVertical="top"
                returnKeyType="default"
              />
            </View>
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
          <Pressable
            onPress={handleSave}
            style={({ pressed }) => [
              styles.saveBtn,
              { backgroundColor: accent.primary, shadowColor: accent.primary },
              pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
            ]}
          >
            <View style={styles.saveBtnHighlight} />
            <MaterialIcons name={isEditing ? 'save' : 'add'} size={22} color={Colors.textOnPrimary} />
            <Text style={styles.saveBtnText}>{isEditing ? 'Save Changes' : 'Add Dream'}</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  glowBlob: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    top: -40,
    left: -50,
  },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.glassBorder,
  },
  navBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    overflow: 'hidden',
  },
  navCenter: { alignItems: 'center' },
  navTitle: { fontSize: Typography.base, fontWeight: Typography.bold, color: Colors.textPrimary },
  navSub: { fontSize: Typography.xs, color: Colors.textMuted, marginTop: 1 },
  saveChip: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.40,
    shadowRadius: 8,
    elevation: 6,
  },
  saveChipHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '45%',
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderTopLeftRadius: Radius.lg,
    borderTopRightRadius: Radius.lg,
  },
  saveChipText: { color: Colors.textOnPrimary, fontWeight: Typography.semiBold, fontSize: Typography.base },
  content: { paddingHorizontal: Spacing.base, paddingBottom: Spacing.xxxl, paddingTop: Spacing.base },
  promptBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    borderRadius: Radius.xl,
    padding: Spacing.base,
    borderWidth: 1,
    marginBottom: Spacing.xl,
    overflow: 'hidden',
  },
  promptBoxHighlight: {
    position: 'absolute',
    top: 0,
    left: 12,
    right: 12,
    height: 1,
    backgroundColor: Colors.glassHighlight,
  },
  promptEmoji: { fontSize: 28 },
  promptText: { fontSize: Typography.base, fontWeight: Typography.semiBold, flex: 1 },
  inputGroup: { marginBottom: Spacing.xl },
  inputLabel: {
    fontSize: Typography.xs,
    fontWeight: Typography.bold,
    color: Colors.textMuted,
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  inputWrap: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  journalWrap: {
    // nothing extra needed
  },
  inputHighlight: {
    position: 'absolute',
    top: 0,
    left: 10,
    right: 10,
    height: 1,
    backgroundColor: Colors.glassHighlight,
    zIndex: 1,
  },
  titleInput: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    fontSize: Typography.base,
    color: Colors.textPrimary,
    fontWeight: Typography.medium,
  },
  journalInput: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    fontSize: Typography.base,
    color: Colors.textPrimary,
    minHeight: 180,
    lineHeight: Typography.base * 1.65,
  },
  charCount: { fontSize: Typography.xs, color: Colors.textMuted, textAlign: 'right', marginTop: Spacing.xs },
  tagsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    borderRadius: Radius.xl,
    paddingVertical: Spacing.base + 4,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 10,
    marginTop: Spacing.md,
  },
  saveBtnHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '40%',
    backgroundColor: 'rgba(255,255,255,0.20)',
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
  },
  saveBtnText: {
    fontSize: Typography.base,
    fontWeight: Typography.bold,
    color: Colors.textOnPrimary,
    letterSpacing: 0.3,
  },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText: { fontSize: Typography.base, color: Colors.textSecondary },
});
