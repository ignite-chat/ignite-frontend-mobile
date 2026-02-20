import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useMemo } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { useRolesStore } from '@/stores/roles-store';
import { useUsersStore } from '@/stores/users-store';
import { Colors, TextStyles } from '@/theme';

const MAX_SUGGESTIONS = 8;
const AVATAR_COLORS = ['#E8583E', '#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EC4899'];

export type MentionSuggestion =
  | { type: 'user'; key: string; userId: string; name: string; username: string; insertText: string }
  | { type: 'role'; key: string; roleId: string; name: string; color: number; insertText: string };

/**
 * Extract the mention query being typed at the cursor position.
 * Returns { query, start } if the cursor is inside `@query` (>=2 chars after @)
 * and there is no space before the query (i.e. @ is at start or preceded by whitespace).
 */
export function getMentionQuery(text: string, cursor: number): { query: string; start: number } | null {
  const before = text.slice(0, cursor);
  const atIdx = before.lastIndexOf('@');
  if (atIdx === -1) return null;

  // @ must be at the start of text or preceded by whitespace
  if (atIdx > 0 && !/\s/.test(before[atIdx - 1])) return null;

  const fragment = before.slice(atIdx + 1);
  if (fragment.length < 2 || /\s/.test(fragment)) return null;

  return { query: fragment, start: atIdx };
}

type MentionAutocompleteProps = {
  query: string;
  guildId?: string;
  onPick: (item: MentionSuggestion) => void;
  colors: typeof Colors.light;
};

function intToHex(color: number): string {
  return '#' + (color & 0xffffff).toString(16).padStart(6, '0');
}

export function MentionAutocomplete({ query, guildId, onPick, colors }: MentionAutocompleteProps) {
  const users = useUsersStore((s) => s.users);
  const guildRoles = useRolesStore((s) => (guildId ? s.roles[guildId] : undefined));

  const suggestions = useMemo<MentionSuggestion[]>(() => {
    if (!query) return [];
    const q = query.toLowerCase();

    const userPrefix: MentionSuggestion[] = [];
    const userContains: MentionSuggestion[] = [];

    for (const user of Object.values(users)) {
      const lowerName = user.name.toLowerCase();
      const lowerUsername = user.username.toLowerCase();
      const item: MentionSuggestion = {
        type: 'user',
        key: `u:${user.id}`,
        userId: user.id,
        name: user.name,
        username: user.username,
        insertText: `<@${user.id}> `,
      };
      if (lowerName.startsWith(q) || lowerUsername.startsWith(q)) {
        userPrefix.push(item);
      } else if (lowerName.includes(q) || lowerUsername.includes(q)) {
        userContains.push(item);
      }
    }

    const rolePrefix: MentionSuggestion[] = [];
    const roleContains: MentionSuggestion[] = [];

    if (guildRoles) {
      for (const role of guildRoles) {
        if (!role.mentionable) continue;
        const lowerName = role.name.toLowerCase();
        const item: MentionSuggestion = {
          type: 'role',
          key: `r:${role.id}`,
          roleId: role.id,
          name: role.name,
          color: role.color,
          insertText: `<@&${role.id}> `,
        };
        if (lowerName.startsWith(q)) {
          rolePrefix.push(item);
        } else if (lowerName.includes(q)) {
          roleContains.push(item);
        }
      }
    }

    return [
      ...rolePrefix, ...roleContains,
      ...userPrefix, ...userContains,
    ].slice(0, MAX_SUGGESTIONS);
  }, [query, users, guildRoles]);

  if (suggestions.length === 0) return null;

  return (
    <View style={[styles.popup, { backgroundColor: colors.surfaceRaised, borderColor: colors.separator }]}>
      <FlatList
        data={suggestions}
        keyExtractor={(item) => item.key}
        keyboardShouldPersistTaps="always"
        renderItem={({ item }) => {
          if (item.type === 'role') {
            const roleColor = item.color ? intToHex(item.color) : colors.textMuted;
            return (
              <Pressable
                onPress={() => onPick(item)}
                style={({ pressed }) => [
                  styles.suggestionRow,
                  pressed && { backgroundColor: colors.surfaceOverlay },
                ]}
              >
                <View style={[styles.avatar, { backgroundColor: roleColor + '30' }]}>
                  <MaterialIcons name="shield" size={16} color={roleColor} />
                </View>
                <View style={styles.textContainer}>
                  <Text style={[TextStyles.body, { color: roleColor }]} numberOfLines={1}>
                    @{item.name}
                  </Text>
                  <Text style={[TextStyles.caption, { color: colors.textMuted }]} numberOfLines={1}>
                    Role
                  </Text>
                </View>
              </Pressable>
            );
          }

          const avatarColor = AVATAR_COLORS[(item.name?.charCodeAt(0) ?? 0) % AVATAR_COLORS.length];
          return (
            <Pressable
              onPress={() => onPick(item)}
              style={({ pressed }) => [
                styles.suggestionRow,
                pressed && { backgroundColor: colors.surfaceOverlay },
              ]}
            >
              <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
                <Text style={styles.avatarInitial}>
                  {item.name[0]?.toUpperCase() ?? '?'}
                </Text>
              </View>
              <View style={styles.textContainer}>
                <Text style={[TextStyles.body, { color: colors.text }]} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={[TextStyles.caption, { color: colors.textMuted }]} numberOfLines={1}>
                  @{item.username}
                </Text>
              </View>
            </Pressable>
          );
        }}
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
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  textContainer: {
    flex: 1,
    gap: 1,
  },
});
