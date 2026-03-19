import { useContext } from 'react';
import { SessionsContext } from '@/contexts/SessionsContext';

export function useSessions() {
  const ctx = useContext(SessionsContext);
  if (!ctx) throw new Error('useSessions must be used within SessionsProvider');
  return ctx;
}
