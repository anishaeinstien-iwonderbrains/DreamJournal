import { MaterialIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Platform, View } from 'react-native';
import { Colors, Typography } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const { accent } = useTheme();

  const tabBarStyle = {
    height: Platform.select({
      ios: insets.bottom + 64,
      android: insets.bottom + 64,
      default: 70,
    }),
    paddingTop: 10,
    paddingBottom: Platform.select({
      ios: insets.bottom + 10,
      android: insets.bottom + 10,
      default: 10,
    }),
    paddingHorizontal: 8,
    backgroundColor: Colors.bgCard,
    borderTopWidth: 1,
    borderTopColor: Colors.glassBorder,
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle,
        tabBarActiveTintColor: accent.light,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
        tabBarShowLabel: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Journal',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={{ alignItems: 'center' }}>
              <MaterialIcons name={focused ? 'auto-stories' : 'menu-book'} size={size} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="insights"
        options={{
          title: 'Insights',
          tabBarIcon: ({ color, size, focused }) => (
            <MaterialIcons name={focused ? 'insights' : 'bar-chart'} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="customize"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size, focused }) => (
            <MaterialIcons name={focused ? 'tune' : 'settings'} size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
