import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { SectionList, StyleSheet, View } from 'react-native';

import { ChannelRow } from '@/components/guild/channel-row';
import { GuildHeader } from '@/components/guild/guild-header';
import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useGuildsStore, type Channel } from '@/stores/guild-store';
import { Colors, TextStyles } from '@/theme';

const CHANNEL_TYPE_TEXT = 0;
const CHANNEL_TYPE_CATEGORY = 3;

type Section = {
  title: string | null;
  data: Channel[];
};

function buildSections(channels: Channel[]): Section[] {
  const sorted = [...channels].sort((a, b) => a.position - b.position);

  const categories = sorted.filter((c) => c.type === CHANNEL_TYPE_CATEGORY);
  const nonCategories = sorted.filter((c) => c.type !== CHANNEL_TYPE_CATEGORY);
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

export default function GuildChannelsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const guild = useGuildsStore((s) => s.guilds.find((g) => g.id === id));

  const sections = useMemo(
    () => buildSections(guild?.channels ?? []),
    [guild?.channels],
  );

  if (!guild) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ThemedText style={{ color: colors.textMuted }}>Guild not found</ThemedText>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <GuildHeader name={guild.name} colors={colors} onBack={() => router.back()} />

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.channel_id}
        renderSectionHeader={({ section }) =>
          section.title ? (
            <View style={[styles.sectionHeader, { backgroundColor: colors.background }]}>
              <ThemedText style={[TextStyles.label, { color: colors.textMuted }]}>
                {section.title}
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
                router.push({
                  pathname: '/channel/[id]' as any,
                  params: { id: item.channel_id, name: item.name, guildId: id },
                });
              }
            }}
          />
        )}
        stickySectionHeadersEnabled
        ListEmptyComponent={
          <View style={styles.center}>
            <ThemedText style={{ color: colors.textMuted }}>No channels</ThemedText>
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
  sectionHeader: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 8,
  },
});
