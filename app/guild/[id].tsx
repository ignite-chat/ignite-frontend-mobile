import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo } from 'react';
import {
  Pressable,
  SectionList,
  StyleSheet,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useGuildsStore } from '@/stores/guild-store';

const CHANNEL_TYPE_TEXT = 0;
const CHANNEL_TYPE_VOICE = 2;
const CHANNEL_TYPE_CATEGORY = 3;

type Channel = {
  channel_id: string;
  name: string;
  type: number;
  position: number;
  parent_id: string | null;
};

type Section = {
  title: string | null;
  data: Channel[];
};

function buildSections(channels: Channel[]): Section[] {
  const sorted = [...channels].sort((a, b) => a.position - b.position);

  const categories = sorted.filter((c) => c.type === CHANNEL_TYPE_CATEGORY);
  const nonCategories = sorted.filter((c) => c.type !== CHANNEL_TYPE_CATEGORY);

  // Channels without a parent go into an "uncategorized" section at the top
  const uncategorized = nonCategories.filter((c) => !c.parent_id);

  const sections: Section[] = [];

  if (uncategorized.length > 0) {
    sections.push({ title: null, data: uncategorized });
  }

  for (const category of categories) {
    const children = nonCategories.filter((c) => c.parent_id === category.channel_id);
    sections.push({ title: category.name, data: children });
  }

  return sections;
}

function ChannelIcon({ type, color }: { type: number; color: string }) {
  if (type === CHANNEL_TYPE_VOICE) {
    return <MaterialIcons name="volume-up" size={22} color={color} />;
  }
  return <MaterialIcons name="tag" size={22} color={color} />;
}

function ChannelRow({
  channel,
  colors,
  onPress,
}: {
  channel: Channel;
  colors: typeof Colors.light;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.channelRow,
        { backgroundColor: pressed ? colors.inputBackground : 'transparent' },
      ]}
      onPress={onPress}>
      <ChannelIcon type={channel.type} color={colors.icon} />
      <ThemedText style={styles.channelName} numberOfLines={1}>
        {channel.name}
      </ThemedText>
      <MaterialIcons name="chevron-right" size={20} color={colors.placeholder} />
    </Pressable>
  );
}

export default function GuildChannelsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const guild = useGuildsStore((s) => s.guilds.find((g) => g.id === id));

  const sections = useMemo(
    () => buildSections((guild?.channels ?? []) as Channel[]),
    [guild?.channels],
  );

  if (!guild) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ThemedText style={{ color: colors.placeholder }}>Guild not found</ThemedText>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.inputBorder }]}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <MaterialIcons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <ThemedText style={styles.headerTitle} numberOfLines={1}>
          {guild.name}
        </ThemedText>
        <View style={{ width: 24 }} />
      </View>

      {/* Channel list */}
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.channel_id}
        renderSectionHeader={({ section }) =>
          section.title ? (
            <View style={[styles.sectionHeader, { backgroundColor: colors.background }]}>
              <ThemedText style={[styles.sectionTitle, { color: colors.placeholder }]}>
                {section.title.toUpperCase()}
              </ThemedText>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <ChannelRow
            channel={item}
            colors={colors}
            onPress={() => {
              if (item.type === CHANNEL_TYPE_TEXT) {
                router.push({ pathname: '/channel/[id]' as any, params: { id: item.channel_id, name: item.name, guildId: id } });
              }
            }}
          />
        )}
        stickySectionHeadersEnabled
        ListEmptyComponent={
          <View style={styles.center}>
            <ThemedText style={{ color: colors.placeholder }}>No channels</ThemedText>
          </View>
        }
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
    padding: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 54,
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginHorizontal: 12,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 6,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  channelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 13,
    gap: 12,
  },
  channelName: {
    flex: 1,
    fontSize: 16,
  },
});
