import { MaterialIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Platform, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const { accent } = useTheme();

  const tabBarHeight = Platform.select({
    ios: insets.bottom + 64,
    android: insets.bottom + 64,
    default: 70,
  });

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          height: tabBarHeight,
          paddingTop: 10,
          paddingBottom: Platform.select({
            ios: insets.bottom + 10,
            android: insets.bottom + 10,
            default: 10,
          }),
          paddingHorizontal: 8,
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          elevation: 0,
        },
        tabBarBackground: () => (
          <View style={[StyleSheet.absoluteFill, { overflow: 'hidden' }]}>
            {/* Deep vibrancy blur — high intensity = real backdrop content shines through */}
            <BlurView intensity={90} tint="dark" style={StyleSheet.absoluteFill} />

            {/* Very subtle dark surface for readability */}
            <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(4,3,12,0.55)' }]} />

            {/* Accent hue tint wash */}
            <View style={[StyleSheet.absoluteFill, { backgroundColor: accent.primary + '0D' }]} />

            {/* Specular top gradient — strongest highlight */}
            <LinearGradient
              colors={['rgba(255,255,255,0.22)', 'rgba(255,255,255,0.00)']}
              style={[styles.tabBarSpecular]}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              pointerEvents="none"
            />

            {/* Razor bright 1px top edge line */}
            <View style={styles.tabBarTopLine} />

            {/* Inner shadow below top line */}
            <View style={styles.tabBarInnerShadow} />
          </View>
        ),
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
            <MaterialIcons name={focused ? 'auto-stories' : 'menu-book'} size={size} color={color} />
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

const styles = StyleSheet.create({
  tabBarSpecular: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 36,
  },
  tabBarTopLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.52)',
  },
  tabBarInnerShadow: {
    position: 'absolute',
    top: 1,
    left: 0,
    right: 0,
    height: 6,
    backgroundColor: 'rgba(0,0,0,0.18)',
  },
});
