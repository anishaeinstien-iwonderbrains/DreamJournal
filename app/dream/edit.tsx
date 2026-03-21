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
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
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
      <View style={[styles.glow, { backgroundColor: accent.primary + '18' }]} pointerEvents="none" />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        {/* Nav */}
        <View style={styles.nav}>
          <Pressable onPress={() => router.back()} hitSlop={8} style={styles.navBtn}>
            <BlurView intensity={55} tint="dark" style={[StyleSheet.absoluteFill, { borderRadius: Radius.full }]} />
            <View style={[StyleSheet.absoluteFill, styles.navBtnFill, { borderRadius: Radius.full }]} />
            <View style={styles.navBtnTopLine} />
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

        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Prompt header — glass */}
          <View
            style={[styles.promptOuter, { borderColor: accent.primary + '35', shadowColor: accent.primary }]}
          >
            <BlurView intensity={60} tint="dark" style={[StyleSheet.absoluteFill, { borderRadius: Radius.xl }]} />
            <View style={[StyleSheet.absoluteFill, styles.blockFill, { borderRadius: Radius.xl }]} />
            <LinearGradient
              colors={[accent.primary + '16', 'transparent']}
              style={[StyleSheet.absoluteFill, { borderRadius: Radius.xl }]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0.7 }}
              pointerEvents="none"
            />
            <LinearGradient
              colors={['rgba(255,255,255,0.28)', 'rgba(255,255,255,0.00)']}
              style={[styles.blockShimmer, { borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl }]}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              pointerEvents="none"
            />
            <View style={styles.blockTopLine} />
            <View style={styles.promptContent}>
              <Text style={styles.promptEmoji}>🌙</Text>
              <Text style={[styles.promptText, { color: accent.light }]}>What did you dream about?</Text>
            </View>
          </View>

          {/* Title input — glass */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Dream Title</Text>
            <View
              style={[
                styles.inputOuter,
                { borderColor: title ? accent.primary + '65' : Colors.glassBorder, shadowColor: accent.primary },
              ]}
            >
              <BlurView intensity={55} tint="dark" style={[StyleSheet.absoluteFill, { borderRadius: Radius.lg }]} />
              <View style={[StyleSheet.absoluteFill, styles.blockFill, { borderRadius: Radius.lg }]} />
              <LinearGradient
                colors={['rgba(255,255,255,0.18)', 'rgba(255,255,255,0.00)']}
                style={[styles.inputShimmer, { borderTopLeftRadius: Radius.lg, borderTopRightRadius: Radius.lg }]}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                pointerEvents="none"
              />
              <View style={[styles.inputTopLine, { backgroundColor: title ? accent.primary + '50' : 'rgba(255,255,255,0.38)' }]} />
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

          {/* Description — glass */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Dream Journal</Text>
            <View
              style={[
                styles.inputOuter,
                styles.journalOuter,
                { borderColor: description ? accent.primary + '65' : Colors.glassBorder, shadowColor: accent.primary },
              ]}
            >
              <BlurView intensity={55} tint="dark" style={[StyleSheet.absoluteFill, { borderRadius: Radius.lg }]} />
              <View style={[StyleSheet.absoluteFill, styles.blockFill, { borderRadius: Radius.lg }]} />
              <LinearGradient
                colors={['rgba(255,255,255,0.18)', 'rgba(255,255,255,0.00)']}
                style={[styles.inputShimmer, { borderTopLeftRadius: Radius.lg, borderTopRightRadius: Radius.lg }]}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                pointerEvents="none"
              />
              <View style={[styles.inputTopLine, { backgroundColor: description ? accent.primary + '50' : 'rgba(255,255,255,0.38)' }]} />
              <TextInput
                style={styles.journalInput}
                value={description}
                onChangeText={setDescription}
                placeholder="Describe your dream in detail — what happened, who was there, how it felt..."
                placeholderTextColor={Colors.textMuted}
                multiline
                textAlignVertical="top"
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
            <LinearGradient
              colors={['rgba(255,255,255,0.28)', 'rgba(255,255,255,0.00)']}
              style={[StyleSheet.absoluteFill, { borderRadius: Radius.xl }]}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 0.5 }}
              pointerEvents="none"
            />
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
  glow: {
    position: 'absolute', width: 260, height: 260, borderRadius: 130, top: -50, left: -60,
  },
  nav: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.base, paddingVertical: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: Colors.glassBorder,
  },
  navBtn: {
    width: 40, height: 40, alignItems: 'center', justifyContent: 'center',
    borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.glassBorder, overflow: 'hidden',
  },
  navBtnFill: { backgroundColor: 'rgba(255,255,255,0.07)' },
  navBtnTopLine: {
    position: 'absolute', top: 0, left: 6, right: 6, height: 1, backgroundColor: 'rgba(255,255,255,0.44)',
  },
  navCenter: { alignItems: 'center' },
  navTitle: { fontSize: Typography.base, fontWeight: Typography.bold, color: Colors.textPrimary },
  navSub: { fontSize: Typography.xs, color: Colors.textMuted, marginTop: 1 },
  saveChip: {
    paddingHorizontal: Spacing.base, paddingVertical: Spacing.sm,
    borderRadius: Radius.lg, overflow: 'hidden',
    shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.50, shadowRadius: 12, elevation: 8,
  },
  saveChipText: { color: Colors.textOnPrimary, fontWeight: Typography.semiBold, fontSize: Typography.base },
  content: { paddingHorizontal: Spacing.base, paddingBottom: Spacing.xxxl, paddingTop: Spacing.base },

  blockFill: { backgroundColor: 'rgba(255,255,255,0.055)' },
  blockShimmer: { position: 'absolute', top: 0, left: 0, right: 0, height: 48 },
  blockTopLine: {
    position: 'absolute', top: 0, left: Radius.xl * 0.5, right: Radius.xl * 0.5,
    height: 1, backgroundColor: 'rgba(255,255,255,0.44)',
  },

  // Prompt
  promptOuter: {
    borderRadius: Radius.xl, borderWidth: 1, overflow: 'hidden', marginBottom: Spacing.xl,
    shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.30, shadowRadius: 16, elevation: 8,
  },
  promptContent: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: Spacing.base },
  promptEmoji: { fontSize: 28 },
  promptText: { fontSize: Typography.base, fontWeight: Typography.semiBold, flex: 1 },

  // Inputs
  inputGroup: { marginBottom: Spacing.xl },
  inputLabel: {
    fontSize: Typography.xs, fontWeight: Typography.bold, color: Colors.textMuted,
    marginBottom: Spacing.sm, textTransform: 'uppercase', letterSpacing: 0.8,
  },
  inputOuter: {
    borderRadius: Radius.lg, borderWidth: 1, overflow: 'hidden',
    shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.30, shadowRadius: 10, elevation: 5,
  },
  journalOuter: {},
  inputShimmer: { position: 'absolute', top: 0, left: 0, right: 0, height: 36 },
  inputTopLine: {
    position: 'absolute', top: 0, left: Radius.lg * 0.5, right: Radius.lg * 0.5, height: 1,
  },
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
  saveBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm,
    borderRadius: Radius.xl, paddingVertical: Spacing.base + 4, overflow: 'hidden',
    shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.55, shadowRadius: 20, elevation: 12, marginTop: Spacing.md,
  },
  saveBtnText: { fontSize: Typography.base, fontWeight: Typography.bold, color: Colors.textOnPrimary, letterSpacing: 0.3 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText: { fontSize: Typography.base, color: Colors.textSecondary },
});
