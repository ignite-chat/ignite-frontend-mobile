import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Colors, TextStyles } from '@/theme';

type ChannelHeaderProps = {
  channelName: string;
  colors: typeof Colors.light;
  onBack: () => void;
  onNamePress: () => void;
  onSearchPress: () => void;
};

export function ChannelHeader({ channelName, colors, onBack, onNamePress, onSearchPress }: ChannelHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.header, { paddingTop: insets.top + 10, borderBottomColor: colors.separator }]}>
      <Pressable onPress={onBack} hitSlop={8} style={styles.backButton}>
        <MaterialIcons name="arrow-back" size={24} color={colors.text} />
      </Pressable>
      <Pressable style={styles.headerCenter} onPress={onNamePress}>
        <MaterialIcons name="tag" size={20} color={colors.textSecondary} />
        <ThemedText style={[TextStyles.heading, styles.headerTitle]} numberOfLines={1}>
          {channelName}
        </ThemedText>
        <MaterialIcons name="keyboard-arrow-down" size={16} color={colors.textMuted} />
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
    paddingBottom: 14,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backButton: {
    padding: 4,
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
    flexShrink: 1,
    gap: 4,
  },
  headerTitle: {
    flexShrink: 1,
  },
  searchButton: {
    marginLeft: 'auto',
    padding: 4,
  },
});
