export interface DreamEntry {
  id: string;
  title: string;
  description: string;
  tags: string[];
  createdAt: string;
}

export interface SleepSession {
  id: string;
  bedtime: string;      // ISO string
  wakeTime: string;     // ISO string
  durationMinutes: number;
  qualityRating: number; // 1-5
  wakeMood: string;
  dreams: DreamEntry[];
  createdAt: string;
}
