import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { SleepSession } from '@/types';
import { StorageService } from '@/services/storage';

interface SessionsContextType {
  sessions: SleepSession[];
  loading: boolean;
  addSession: (session: SleepSession) => Promise<void>;
  updateSession: (session: SleepSession) => Promise<void>;
  deleteSession: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
}

export const SessionsContext = createContext<SessionsContextType | undefined>(undefined);

export function SessionsProvider({ children }: { children: ReactNode }) {
  const [sessions, setSessions] = useState<SleepSession[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const data = await StorageService.getSessions();
    setSessions(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addSession = async (session: SleepSession) => {
    await StorageService.saveSession(session);
    setSessions((prev) => [session, ...prev]);
  };

  const updateSession = async (session: SleepSession) => {
    await StorageService.saveSession(session);
    setSessions((prev) => prev.map((s) => (s.id === session.id ? session : s)));
  };

  const deleteSession = async (id: string) => {
    await StorageService.deleteSession(id);
    setSessions((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <SessionsContext.Provider value={{ sessions, loading, addSession, updateSession, deleteSession, refresh }}>
      {children}
    </SessionsContext.Provider>
  );
}
