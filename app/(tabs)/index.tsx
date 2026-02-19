import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import {
  FlatList,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useGuildsStore, type Guild } from '@/stores/guild-store';

const CDN_BASE = 'https://cdn.ignite-chat.com';

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function GuildItem({
  guild,
  colors,
  onPress,
}: {
  guild: Guild;
  colors: typeof Colors.light;
  onPress: () => void;
}) {
  const iconUrl = guild.icon_file_id
    ? `${CDN_BASE}/icons/${guild.icon_file_id}`
    : null;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.guildItem,
        { backgroundColor: pressed ? colors.inputBackground : 'transparent' },
      ]}
      onPress={onPress}>
      {iconUrl ? (
        <Image source={{ uri: iconUrl }} style={styles.guildIcon} />
      ) : (
        <View style={[styles.guildIconPlaceholder, { backgroundColor: colors.tint }]}>
          <ThemedText style={styles.guildInitials}>
            {getInitials(guild.name)}
          </ThemedText>
        </View>
      )}
      <View style={styles.guildInfo}>
        <ThemedText style={styles.guildName} numberOfLines={1}>
          {guild.name}
        </ThemedText>
        <ThemedText style={[styles.guildMeta, { color: colors.placeholder }]} numberOfLines={1}>
          {guild.member_count} {guild.member_count === 1 ? 'member' : 'members'}
        </ThemedText>
      </View>
    </Pressable>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const guilds = useGuildsStore((s) => s.guilds);

  if (guilds.length === 0) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ThemedText style={{ color: colors.placeholder }}>
          No guilds yet
        </ThemedText>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={guilds}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <GuildItem
            guild={item}
            colors={colors}
            onPress={() => router.push(`/guild/${item.id}` as any)}
          />
        )}
        ItemSeparatorComponent={() => (
          <View
            style={[
              styles.separator,
              { backgroundColor: colors.inputBorder },
            ]}
          />
        )}
      />
    </View>
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
  guildItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  guildIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  guildIconPlaceholder: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  guildInitials: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  guildInfo: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'center',
  },
  guildName: {
    fontSize: 17,
    fontWeight: '600',
  },
  guildMeta: {
    fontSize: 14,
    marginTop: 2,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 82,
  },
});
