import { Image } from 'expo-image';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { type Guild } from '@/stores/guild-store';
import { Colors, TextStyles } from '@/theme';
import { CDN_BASE } from '@/utils/cdn';
import { snowflakeToTimestamp } from '@/utils/snowflake';

const AVATAR_COLORS = ['#E8583E', '#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EC4899'];

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function getLatestActivityTimestamp(guild: Guild): number {
  let latest = 0;
  for (const channel of guild.channels) {
    if (channel.last_message_id) {
      const ts = snowflakeToTimestamp(channel.last_message_id);
      if (ts > latest) latest = ts;
    }
  }
  return latest;
}

function formatActivityTime(timestamp: number): string | null {
  if (timestamp === 0) return null;

  const now = new Date();
  const date = new Date(timestamp);

  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfWeek = startOfToday - 6 * 86_400_000;

  if (timestamp >= startOfToday) {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const period = hours >= 12 ? 'PM' : 'AM';
    const h = hours % 12 || 12;
    const m = minutes.toString().padStart(2, '0');
    return `${h}:${m} ${period}`;
  }

  if (timestamp >= startOfWeek) {
    return DAY_NAMES[date.getDay()];
  }

  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${month}/${day}`;
}

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

type GuildItemProps = {
  guild: Guild;
  onPress: () => void;
};

export function GuildItem({ guild, onPress }: GuildItemProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const iconUrl = guild.icon_file_id
    ? `${CDN_BASE}/icons/${guild.icon_file_id}`
    : null;

  const activityLabel = formatActivityTime(getLatestActivityTimestamp(guild));
  const avatarColor = AVATAR_COLORS[guild.name.charCodeAt(0) % AVATAR_COLORS.length];

  return (
    <Pressable
      style={({ pressed }) => [
        styles.guildItem,
        { backgroundColor: pressed ? colors.surfaceRaised : 'transparent' },
      ]}
      onPress={onPress}>
      {iconUrl ? (
        <Image source={{ uri: iconUrl }} style={styles.guildIcon} />
      ) : (
        <View style={[styles.guildIconPlaceholder, { backgroundColor: avatarColor }]}>
          <ThemedText style={styles.guildInitials}>
            {getInitials(guild.name)}
          </ThemedText>
        </View>
      )}
      <View style={styles.guildInfo}>
        <View style={styles.guildTopRow}>
          <ThemedText style={[TextStyles.heading, styles.guildName]} numberOfLines={1}>
            {guild.name}
          </ThemedText>
          {activityLabel && (
            <ThemedText style={[TextStyles.caption, { color: colors.textMuted }]}>
              {activityLabel}
            </ThemedText>
          )}
        </View>
        <ThemedText style={[TextStyles.bodySmall, { color: colors.textSecondary, marginTop: 2 }]} numberOfLines={1}>
          {guild.member_count} {guild.member_count === 1 ? 'member' : 'members'}
        </ThemedText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  guildItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  guildIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
  },
  guildIconPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  guildInitials: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  guildInfo: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'center',
  },
  guildTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  guildName: {
    flex: 1,
  },
});
