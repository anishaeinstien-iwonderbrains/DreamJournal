import { AlertProvider } from '@/template';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { SessionsProvider } from '@/contexts/SessionsContext';
import { ThemeProvider } from '@/contexts/ThemeContext';

export default function RootLayout() {
  return (
    <AlertProvider>
      <SafeAreaProvider>
        <ThemeProvider>
          <SessionsProvider>
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: '#080618' },
                animation: 'slide_from_right',
              }}
            >
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="session/new" />
              <Stack.Screen name="session/[id]" />
              <Stack.Screen name="dream/edit" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
            </Stack>
          </SessionsProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </AlertProvider>
  );
}
