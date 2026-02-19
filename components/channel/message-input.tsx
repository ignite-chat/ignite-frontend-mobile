import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { Colors } from '@/theme';

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
    <View style={[styles.inputBar, { borderTopColor: colors.inputBorder, backgroundColor: colors.background }]}>
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: colors.inputBackground,
            color: colors.text,
            borderColor: colors.inputBorder,
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
          { backgroundColor: hasContent ? colors.tint : colors.inputBackground, opacity: pressed ? 0.7 : 1 },
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
    paddingVertical: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 8,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    borderWidth: StyleSheet.hairlineWidth,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
