import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GuildItem, getLatestActivityTimestamp } from '@/components/guild/guild-item';
import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useGuildsStore } from '@/stores/guild-store';
import { Colors, TextStyles } from '@/theme';

export default function HomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [search, setSearch] = useState('');
  const rawGuilds = useGuildsStore((s) => s.guilds);
  const guilds = useMemo(() => {
    const sorted = [...rawGuilds].sort((a, b) => getLatestActivityTimestamp(b) - getLatestActivityTimestamp(a));
    const query = search.trim().toLowerCase();
    return query ? sorted.filter((g) => g.name.toLowerCase().includes(query)) : sorted;
  }, [rawGuilds, search]);

  if (guilds.length === 0) {
    return (
      <SafeAreaView style={[styles.center, { backgroundColor: colors.background }]}>
        <ThemedText style={{ color: colors.textMuted }}>
          No guilds yet
        </ThemedText>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <FlatList
        data={guilds}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View style={[styles.searchContainer, { backgroundColor: colors.background }]}>
            <View style={[styles.searchBar, { backgroundColor: colors.surfaceOverlay }]}>
              <Ionicons name="search" size={16} color={colors.textMuted} />
              <TextInput
                style={[styles.searchInput, TextStyles.body, { color: colors.text }]}
                placeholder="Search"
                placeholderTextColor={colors.placeholder}
                value={search}
                onChangeText={setSearch}
                autoCorrect={false}
                autoCapitalize="none"
                returnKeyType="search"
              />
              {search.length > 0 && (
                <Pressable onPress={() => setSearch('')} hitSlop={8}>
                  <Ionicons name="close-circle" size={18} color={colors.textMuted} />
                </Pressable>
              )}
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <GuildItem
            guild={item}
            onPress={() => router.push(`/guild/${item.id}` as any)}
          />
        )}
        ItemSeparatorComponent={() => (
          <View
            style={[
              styles.separator,
              { backgroundColor: colors.separator },
            ]}
          />
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 78,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 40,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 0,
  },
});
