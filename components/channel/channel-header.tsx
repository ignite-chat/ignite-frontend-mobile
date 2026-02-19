import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/theme';

type ChannelHeaderProps = {
  channelName: string;
  colors: typeof Colors.light;
  onBack: () => void;
  onNamePress: () => void;
  onSearchPress: () => void;
};

export function ChannelHeader({ channelName, colors, onBack, onNamePress, onSearchPress }: ChannelHeaderProps) {
  return (
    <View style={[styles.header, { borderBottomColor: colors.inputBorder }]}>
      <Pressable onPress={onBack} hitSlop={8}>
        <MaterialIcons name="arrow-back" size={24} color={colors.text} />
      </Pressable>
      <Pressable style={styles.headerCenter} onPress={onNamePress}>
        <MaterialIcons name="tag" size={20} color={colors.icon} />
        <ThemedText style={styles.headerTitle} numberOfLines={1}>
          {channelName}
        </ThemedText>
        <MaterialIcons name="keyboard-arrow-down" size={20} color={colors.icon} />
      </Pressable>
      <Pressable onPress={onSearchPress} hitSlop={8} style={styles.searchButton}>
        <MaterialIcons name="search" size={24} color={colors.text} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 54,
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
    flexShrink: 1,
    gap: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    flexShrink: 1,
  },
  searchButton: {
    marginLeft: 'auto',
  },
});
