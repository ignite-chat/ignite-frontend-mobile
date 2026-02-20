import { Redirect, Tabs } from 'expo-router';
import React, { useEffect } from 'react';
import { Platform, StyleSheet } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/contexts/auth-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { EchoService } from '@/services/echo';
import { EmojisService } from '@/services/emojis';
import { GuildsService } from '@/services/guilds';
import { Colors, TextStyles } from '@/theme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { token, user, isLoading } = useAuth();

  useEffect(() => {
    console.debug("[DEBUG]", token, user);

    if (token && user) {
      GuildsService.loadGuilds().then((res) => {
        if (res?.ok) {
          EchoService.connect(token, user.id);
          EchoService.subscribeToGuilds(res.data);
          EmojisService.loadAllGuildEmojis();
        }
      });
    }

    return () => {
      EchoService.disconnect();
    };
  }, [token, user]);

  if (isLoading) return null;

  if (!token) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.tint,
        tabBarInactiveTintColor: colors.tabIconDefault,
        tabBarStyle: {
          backgroundColor: colors.surfaceRaised,
          borderTopColor: colors.separator,
          borderTopWidth: StyleSheet.hairlineWidth,
          paddingTop: 6,
          paddingBottom: Platform.OS === 'ios' ? 24 : 10,
          height: Platform.OS === 'ios' ? 84 : 62,
        },
        tabBarLabelStyle: {
          ...TextStyles.tabLabel,
        },
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="you"
        options={{
          title: 'You',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}
