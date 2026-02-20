import { Image } from 'expo-image';
import { useMemo } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { useEmojiStore } from '@/stores/emoji-store';
import { Colors, TextStyles } from '@/theme';
import { CDN_BASE } from '@/utils/cdn';
import { emojiToFilename, searchEmojis } from '@/utils/emoji';

const TWEMOJI_BASE = 'https://cdn.jsdelivr.net/gh/jdecked/twemoji@latest/assets/svg/';
const MAX_SUGGESTIONS = 8;

export type SuggestionItem = {
  key: string;
  name: string;
  imageUri: string;
  insertText: string;
};

/**
 * Extract the emoji query being typed at the cursor position.
 * Returns { query, start } if the cursor is inside `:query` (>=2 chars after the colon)
 * and there is no closing colon yet.
 */
export function getEmojiQuery(text: string, cursor: number): { query: string; start: number } | null {
  const before = text.slice(0, cursor);
  const colonIdx = before.lastIndexOf(':');
  if (colonIdx === -1) return null;

  const fragment = before.slice(colonIdx + 1);
  if (fragment.length < 2 || /[\s:]/.test(fragment)) return null;

  return { query: fragment, start: colonIdx };
}

type EmojiAutocompleteProps = {
  query: string;
  guildId?: string;
  onPick: (item: SuggestionItem) => void;
  colors: typeof Colors.light;
};

export function EmojiAutocomplete({ query, guildId, onPick, colors }: EmojiAutocompleteProps) {
  const customEmojis = useEmojiStore((s) => s.emojis);

  const suggestions = useMemo<SuggestionItem[]>(() => {
    if (!query) return [];
    const q = query.toLowerCase();

    // Custom emoji results (prioritised)
    const customPrefix: SuggestionItem[] = [];
    const customContains: SuggestionItem[] = [];
    for (const emoji of Object.values(customEmojis)) {
      const lower = emoji.name.toLowerCase();
      const sameGuild = guildId != null && emoji.guild_id === guildId;
      const item: SuggestionItem = {
        key: `c:${emoji.id}`,
        name: emoji.name,
        imageUri: `${CDN_BASE}/emojis/${emoji.id}`,
        insertText: sameGuild ? `:${emoji.name}: ` : `<a:${emoji.name}:${emoji.id}> `,
      };
      if (lower.startsWith(q)) {
        customPrefix.push(item);
      } else if (lower.includes(q)) {
        customContains.push(item);
      }
    }
    const custom = [...customPrefix, ...customContains];

    // Unicode emoji results
    const unicode: SuggestionItem[] = searchEmojis(q, MAX_SUGGESTIONS).map((m) => ({
      key: `u:${m.name}`,
      name: m.name,
      imageUri: `${TWEMOJI_BASE}${emojiToFilename(m.surrogates)}.svg`,
      insertText: `:${m.name}: `,
    }));

    return [...custom, ...unicode].slice(0, MAX_SUGGESTIONS);
  }, [query, customEmojis]);

  if (suggestions.length === 0) return null;

  return (
    <View style={[styles.popup, { backgroundColor: colors.surfaceRaised, borderColor: colors.separator }]}>
      <FlatList
        data={suggestions}
        keyExtractor={(item) => item.key}
        keyboardShouldPersistTaps="always"
        renderItem={({ item }) => (
          <Pressable
            onPress={() => onPick(item)}
            style={({ pressed }) => [
              styles.suggestionRow,
              pressed && { backgroundColor: colors.surfaceOverlay },
            ]}
          >
            <Image
              source={{ uri: item.imageUri }}
              style={styles.suggestionEmoji}
              contentFit="contain"
            />
            <Text style={[TextStyles.body, { color: colors.text }]} numberOfLines={1}>
              :{item.name}:
            </Text>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  popup: {
    maxHeight: 300,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
  },
  suggestionEmoji: {
    width: 22,
    height: 22,
  },
});
