import { Redirect, Tabs } from 'expo-router';
import React, { useEffect } from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/contexts/auth-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { EchoService } from '@/services/echo';
import { GuildsService } from '@/services/guilds';
import { Colors } from '@/theme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { token, user, isLoading } = useAuth();

  useEffect(() => {
    console.log("Hello", token, user);
    
    if (token && user) {
      GuildsService.loadGuilds().then((res) => {
        if (res?.ok) {
          EchoService.connect(token, user.id);
          EchoService.subscribeToGuilds(res.data);
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
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
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
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}
