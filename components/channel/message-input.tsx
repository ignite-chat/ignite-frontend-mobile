import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { Colors, TextStyles } from '@/theme';

type MessageInputProps = {
  text: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  sending: boolean;
  colors: typeof Colors.light;
};

export function MessageInput({ text, onChangeText, onSend, sending, colors }: MessageInputProps) {
  const hasContent = !!text.trim();

  return (
    <View style={[styles.inputBar, { backgroundColor: colors.background }]}>
      <TextInput
        style={[
          styles.input,
          TextStyles.body,
          {
            backgroundColor: colors.surfaceOverlay,
            color: colors.text,
          },
        ]}
        placeholder="Message..."
        placeholderTextColor={colors.placeholder}
        value={text}
        onChangeText={onChangeText}
        multiline
        maxLength={2000}
      />
      <Pressable
        onPress={onSend}
        disabled={!hasContent || sending}
        style={({ pressed }) => [
          styles.sendButton,
          { backgroundColor: hasContent ? colors.tint : colors.surfaceOverlay, opacity: pressed ? 0.7 : 1 },
        ]}>
        <MaterialIcons name="send" size={20} color={hasContent ? '#fff' : colors.placeholder} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -1 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  sendButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
