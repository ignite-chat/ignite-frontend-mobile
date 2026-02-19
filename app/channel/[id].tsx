import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
} from 'react-native';

import { ChannelHeader } from '@/components/channel/channel-header';
import { ChannelInfoModal } from '@/components/channel/channel-info-modal';
import { MessageInput } from '@/components/channel/message-input';
import { MessageItem, type DisplayMessage } from '@/components/channel/message-item';
import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/contexts/auth-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { MessagesService } from '@/services/messages';
import { useMessagesStore, type Message, type PendingMessage } from '@/stores/messages-store';
import { Colors } from '@/theme';

const EMPTY_MESSAGES: Message[] = [];
const EMPTY_PENDING: PendingMessage[] = [];

export default function ChannelScreen() {
  const { id: channelId, name: channelName, guildId } = useLocalSearchParams<{ id: string; name: string; guildId: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { user } = useAuth();

  const rawMessages = useMessagesStore((s) => s.messages[channelId!] ?? EMPTY_MESSAGES);
  const pendingMessages = useMessagesStore((s) => s.pendingMessages[channelId!] ?? EMPTY_PENDING);
  const messages = useMemo<DisplayMessage[]>(() => {
    const real: DisplayMessage[] = [...rawMessages].sort((a, b) =>
      b.id > a.id ? 1 : b.id < a.id ? -1 : 0,
    );
    const pending: DisplayMessage[] = pendingMessages.map((m) => ({
      id: `pending-${m.nonce}`,
      content: m.content,
      created_at: m.created_at,
      author: m.author,
      pending: true,
    }));
    return [...pending, ...real];
  }, [rawMessages, pendingMessages]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [text, setText] = useState('');
  const listRef = useRef<FlatList>(null);
  const loadingOlderRef = useRef(false);
  const hasMoreRef = useRef(true);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (!channelId) return;
    hasMoreRef.current = true;
    setLoading(true);
    MessagesService.loadMessages(channelId).then((res) => {
      if (res.ok && res.data.length < 50) hasMoreRef.current = false;
      setLoading(false);
    });
  }, [channelId]);

  const loadOlder = useCallback(async () => {
    if (!channelId || loadingOlderRef.current || !hasMoreRef.current || messages.length === 0) return;
    loadingOlderRef.current = true;
    const oldestId = messages[0].id;
    const res = await MessagesService.loadOlderMessages(channelId, oldestId);
    if (res.ok && res.data.length < 50) hasMoreRef.current = false;
    loadingOlderRef.current = false;
  }, [channelId, messages]);

  const handleSend = useCallback(async () => {
    const content = text.trim();
    if (!content || !channelId || sending || !user) return;
    setText('');
    setSending(true);
    await MessagesService.sendMessage(channelId, content, {
      id: user.id,
      name: user.name,
      username: user.username,
      avatar_url: user.avatar_url,
      is_bot: false,
    });
    setSending(false);
  }, [text, channelId, sending, user]);

  const displayName = channelName ?? 'Channel';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ChannelHeader
        channelName={displayName}
        colors={colors}
        onBack={() => router.back()}
        onNamePress={() => setModalVisible(true)}
        onSearchPress={() => {}}
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}>
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
                <ThemedText style={{ color: colors.textMuted }}>No messages yet</ThemedText>
              </View>
            }
          />
        )}

        <MessageInput
          text={text}
          onChangeText={setText}
          onSend={handleSend}
          sending={sending}
          colors={colors}
        />
      </KeyboardAvoidingView>

      <ChannelInfoModal
        visible={modalVisible}
        channelName={displayName}
        guildId={guildId!}
        colors={colors}
        onClose={() => setModalVisible(false)}
      />
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
  listContent: {
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    transform: [{ scaleY: -1 }],
  },
});
