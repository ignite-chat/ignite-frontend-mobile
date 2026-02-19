import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { type Channel } from '@/stores/guild-store';
import { Colors, TextStyles } from '@/theme';

import { ChannelIcon } from './channel-icon';

type ChannelRowProps = {
  channel: Channel;
  colors: typeof Colors.light;
  onPress: () => void;
};

export function ChannelRow({ channel, colors, onPress }: ChannelRowProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: pressed ? colors.surfaceRaised : 'transparent' },
      ]}
      onPress={onPress}>
      <ChannelIcon type={channel.type} color={colors.textMuted} />
      <ThemedText style={[TextStyles.body, styles.name]} numberOfLines={1}>
        {channel.name}
      </ThemedText>
      <MaterialIcons name="chevron-right" size={18} color={colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 8,
    borderRadius: 8,
    gap: 10,
  },
  name: {
    flex: 1,
  },
});
