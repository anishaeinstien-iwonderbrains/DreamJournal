import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ACCENT_COLORS } from '@/constants/theme';

export interface ThemeSettings {
  accentId: string;
  userName: string;
  showMoonPhase: boolean;
}

interface ThemeContextType {
  settings: ThemeSettings;
  accent: typeof ACCENT_COLORS[0];
  updateSettings: (partial: Partial<ThemeSettings>) => Promise<void>;
}

const DEFAULTS: ThemeSettings = {
  accentId: 'purple',
  userName: '',
  showMoonPhase: true,
};

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<ThemeSettings>(DEFAULTS);

  useEffect(() => {
    AsyncStorage.getItem('theme_settings').then((raw) => {
      if (raw) {
        try { setSettings({ ...DEFAULTS, ...JSON.parse(raw) }); } catch {}
      }
    });
  }, []);

  const updateSettings = useCallback(async (partial: Partial<ThemeSettings>) => {
    const next = { ...settings, ...partial };
    setSettings(next);
    await AsyncStorage.setItem('theme_settings', JSON.stringify(next));
  }, [settings]);

  const accent = ACCENT_COLORS.find((a) => a.id === settings.accentId) ?? ACCENT_COLORS[0];

  return (
    <ThemeContext.Provider value={{ settings, accent, updateSettings }}>
      {children}
    </ThemeContext.Provider>
  );
}
