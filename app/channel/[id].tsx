import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/theme';
import { useAuth } from '@/contexts/auth-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { MessagesService } from '@/services/messages';
import { useMessagesStore, type Message } from '@/stores/messages-store';

const EMPTY_MESSAGES: Message[] = [];

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function MessageItem({ message, colors }: { message: Message; colors: typeof Colors.light }) {
  return (
    <View style={styles.messageRow}>
      {message.author.avatar_url ? (
        <Image source={{ uri: message.author.avatar_url }} style={styles.avatar} />
      ) : (
        <View style={[styles.avatarPlaceholder, { backgroundColor: colors.tint }]}>
          <ThemedText style={styles.avatarInitial}>
            {message.author.name?.[0]?.toUpperCase() ?? '?'}
          </ThemedText>
        </View>
      )}
      <View style={styles.messageBubble}>
        <View style={styles.messageHeader}>
          <ThemedText style={styles.authorName} numberOfLines={1}>
            {message.author.name}
          </ThemedText>
          <ThemedText style={[styles.timestamp, { color: colors.placeholder }]}>
            {formatTime(message.created_at)}
          </ThemedText>
        </View>
        {message.content ? (
          <ThemedText style={styles.messageContent}>{message.content}</ThemedText>
        ) : null}
        {message.attachments.length > 0 && (
          <View style={styles.attachments}>
            {message.attachments.map((att) => (
              <View key={att.id} style={[styles.attachmentChip, { backgroundColor: colors.inputBackground }]}>
                <MaterialIcons name="attach-file" size={14} color={colors.icon} />
                <ThemedText style={[styles.attachmentName, { color: colors.tint }]} numberOfLines={1}>
                  {att.filename}
                </ThemedText>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

export default function ChannelScreen() {
  const { id: channelId, name: channelName } = useLocalSearchParams<{ id: string; name: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { token } = useAuth();

  const rawMessages = useMessagesStore((s) => s.messages[channelId!] ?? EMPTY_MESSAGES);
  const messages = useMemo(
    () => [...rawMessages].sort((a, b) => (b.id > a.id ? 1 : b.id < a.id ? -1 : 0)),
    [rawMessages],
  );
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [text, setText] = useState('');
  const listRef = useRef<FlatList>(null);
  const loadingOlderRef = useRef(false);
  const hasMoreRef = useRef(true);

  useEffect(() => {
    if (!token || !channelId) return;
    hasMoreRef.current = true;
    setLoading(true);
    MessagesService.loadMessages(token, channelId).then((res) => {
      if (res.ok && res.data.length < 50) hasMoreRef.current = false;
      setLoading(false);
    });
  }, [token, channelId]);

  const loadOlder = useCallback(async () => {
    if (!token || !channelId || loadingOlderRef.current || !hasMoreRef.current || messages.length === 0) return;
    loadingOlderRef.current = true;
    const oldestId = messages[0].id;
    const res = await MessagesService.loadOlderMessages(token, channelId, oldestId);
    if (res.ok && res.data.length < 50) hasMoreRef.current = false;
    loadingOlderRef.current = false;
  }, [token, channelId, messages]);

  const handleSend = useCallback(async () => {
    const content = text.trim();
    if (!content || !token || !channelId || sending) return;
    setText('');
    setSending(true);
    await MessagesService.sendMessage(token, channelId, content);
    setSending(false);
  }, [text, token, channelId, sending]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.inputBorder }]}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <MaterialIcons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <MaterialIcons name="tag" size={20} color={colors.icon} style={{ marginLeft: 12 }} />
        <ThemedText style={styles.headerTitle} numberOfLines={1}>
          {channelName ?? 'Channel'}
        </ThemedText>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}>
        {/* Messages */}
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.tint} />
          </View>
        ) : (
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <MessageItem message={item} colors={colors} />}
            inverted
            contentContainerStyle={styles.listContent}
            onEndReached={loadOlder}
            onEndReachedThreshold={0.3}
            ListFooterComponent={null}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <ThemedText style={{ color: colors.placeholder }}>No messages yet</ThemedText>
              </View>
            }
          />
        )}

        {/* Input */}
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
            onChangeText={setText}
            multiline
            maxLength={2000}
          />
          <Pressable
            onPress={handleSend}
            disabled={!text.trim() || sending}
            style={({ pressed }) => [
              styles.sendButton,
              { backgroundColor: text.trim() ? colors.tint : colors.inputBackground, opacity: pressed ? 0.7 : 1 },
            ]}>
            <MaterialIcons name="send" size={20} color={text.trim() ? '#fff' : colors.placeholder} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 54,
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 6,
    flexShrink: 1,
  },
  listContent: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  messageRow: {
    flexDirection: 'row',
    marginVertical: 6,
    alignItems: 'flex-start',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
    marginTop: 2,
  },
  avatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
    marginTop: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  messageBubble: {
    flex: 1,
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  authorName: {
    fontSize: 15,
    fontWeight: '600',
    flexShrink: 1,
  },
  timestamp: {
    fontSize: 11,
  },
  messageContent: {
    fontSize: 15,
    lineHeight: 21,
    marginTop: 2,
  },
  attachments: {
    marginTop: 6,
    gap: 4,
  },
  attachmentChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
    alignSelf: 'flex-start',
  },
  attachmentName: {
    fontSize: 13,
    maxWidth: 200,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    transform: [{ scaleY: -1 }],
  },
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
