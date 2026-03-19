import AsyncStorage from '@react-native-async-storage/async-storage';
import { SleepSession, DreamEntry } from '@/types';

const SESSIONS_KEY = 'dream_journal_sessions';

export const StorageService = {
  async getSessions(): Promise<SleepSession[]> {
    try {
      const raw = await AsyncStorage.getItem(SESSIONS_KEY);
      if (!raw) return [];
      return JSON.parse(raw) as SleepSession[];
    } catch {
      return [];
    }
  },

  async saveSession(session: SleepSession): Promise<void> {
    const sessions = await StorageService.getSessions();
    const idx = sessions.findIndex((s) => s.id === session.id);
    if (idx >= 0) {
      sessions[idx] = session;
    } else {
      sessions.unshift(session);
    }
    await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  },

  async deleteSession(id: string): Promise<void> {
    const sessions = await StorageService.getSessions();
    const filtered = sessions.filter((s) => s.id !== id);
    await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(filtered));
  },

  generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  },

  computeDuration(bedtime: string, wakeTime: string): number {
    const diff = new Date(wakeTime).getTime() - new Date(bedtime).getTime();
    return Math.max(0, Math.round(diff / 60000));
  },

  formatDuration(minutes: number): string {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
  },

  formatDate(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  },

  formatTime(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  },
};
