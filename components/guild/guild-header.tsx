import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Colors, TextStyles } from '@/theme';

type GuildHeaderProps = {
  name: string;
  colors: typeof Colors.light;
  onBack: () => void;
};

export function GuildHeader({ name, colors, onBack }: GuildHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.header, { paddingTop: insets.top + 10, borderBottomColor: colors.separator }]}>
      <Pressable onPress={onBack} hitSlop={8} style={styles.backButton}>
        <MaterialIcons name="arrow-back" size={24} color={colors.text} />
      </Pressable>
      <ThemedText style={[TextStyles.heading, styles.title]} numberOfLines={1}>
        {name}
      </ThemedText>
      <View style={{ width: 32 }} />
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
  title: {
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 12,
  },
});
