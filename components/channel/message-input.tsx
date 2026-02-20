import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useCallback, useMemo, useRef, useState } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type NativeSyntheticEvent,
  type TextInputSelectionChangeEventData,
} from 'react-native';

import { EmojiAutocomplete, getEmojiQuery, type SuggestionItem } from '@/components/channel/emoji-autocomplete';
import { MentionAutocomplete, getMentionQuery, type MentionSuggestion } from '@/components/channel/mention-autocomplete';
import { Colors, TextStyles } from '@/theme';

type MessageInputProps = {
  text: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  sending: boolean;
  guildId?: string;
  colors: typeof Colors.light;
  editing?: boolean;
  onCancelEdit?: () => void;
};

export function MessageInput({ text, onChangeText, onSend, sending, guildId, colors, editing, onCancelEdit }: MessageInputProps) {
  const hasContent = !!text.trim();
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<TextInput>(null);

  const handleSelectionChange = useCallback(
    (e: NativeSyntheticEvent<TextInputSelectionChangeEventData>) => {
      setCursor(e.nativeEvent.selection.end);
    },
    [],
  );

  const handleChangeText = useCallback(
    (value: string) => {
      onChangeText(value);
      setCursor(value.length);
    },
    [onChangeText],
  );

  const emojiQuery = useMemo(() => getEmojiQuery(text, cursor), [text, cursor]);
  const mentionQuery = useMemo(() => getMentionQuery(text, cursor), [text, cursor]);

  const handlePickEmoji = useCallback(
    (item: SuggestionItem) => {
      if (!emojiQuery) return;
      const before = text.slice(0, emojiQuery.start);
      const after = text.slice(cursor);
      onChangeText(before + item.insertText + after);
      setCursor(before.length + item.insertText.length);
      inputRef.current?.focus();
    },
    [text, cursor, emojiQuery, onChangeText],
  );

  const handlePickMention = useCallback(
    (item: MentionSuggestion) => {
      if (!mentionQuery) return;
      const before = text.slice(0, mentionQuery.start);
      const after = text.slice(cursor);
      onChangeText(before + item.insertText + after);
      setCursor(before.length + item.insertText.length);
      inputRef.current?.focus();
    },
    [text, cursor, mentionQuery, onChangeText],
  );

  return (
    <View>
      {mentionQuery && (
        <MentionAutocomplete
          query={mentionQuery.query}
          guildId={guildId}
          onPick={handlePickMention}
          colors={colors}
        />
      )}
      {emojiQuery && (
        <EmojiAutocomplete
          query={emojiQuery.query}
          guildId={guildId}
          onPick={handlePickEmoji}
          colors={colors}
        />
      )}

      {editing && (
        <View style={[styles.editingBanner, { backgroundColor: colors.surfaceRaised, borderColor: colors.separator }]}>
          <MaterialIcons name="edit" size={16} color={colors.tint} />
          <Text style={[TextStyles.bodySmall, { color: colors.tint, flex: 1 }]}>Editing Message</Text>
          <Pressable onPress={onCancelEdit} hitSlop={8}>
            <MaterialIcons name="close" size={18} color={colors.textMuted} />
          </Pressable>
        </View>
      )}

      <View style={[styles.inputBar, { backgroundColor: colors.background }]}>
        <TextInput
          ref={inputRef}
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
          onChangeText={handleChangeText}
          onSelectionChange={handleSelectionChange}
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
  editingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
