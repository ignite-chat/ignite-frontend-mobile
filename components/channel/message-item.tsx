import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from 'expo-image';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { MarkdownRenderer } from '@/components/channel/markdown-renderer';
import { ThemedText } from '@/components/themed-text';
import type { Message } from '@/stores/messages-store';
import { Colors, TextStyles } from '@/theme';
import { parseMarkdown } from '@/utils/markdown-parser';
import { snowflakeToTimestamp } from '@/utils/snowflake';

const AVATAR_COLORS = ['#E8583E', '#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EC4899'];

function safeSnowflakeTime(id: string): number | null {
  try {
    return snowflakeToTimestamp(id);
  } catch {
    return null;
  }
}

export type DisplayMessage = {
  id: string;
  content: string;
  created_at: string;
  updated_at?: string;
  author: Message['author'];
  attachments?: Message['attachments'];
  message_references?: Message['message_references'];
  pending?: boolean;
};

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

type MessageItemProps = {
  message: DisplayMessage;
  prevMessage?: DisplayMessage;
  colors: typeof Colors.light;
  onLongPress?: (message: DisplayMessage) => void;
  highlighted?: boolean;
};

export function MessageItem({ message, prevMessage, colors, onLongPress, highlighted }: MessageItemProps) {
  const avatarColor = AVATAR_COLORS[(message.author.name?.charCodeAt(0) ?? 0) % AVATAR_COLORS.length];

  const ast = useMemo(() => parseMarkdown(message.content), [message.content]);
  const hasReply = (message.message_references?.length ?? 0) > 0;
  const isEdited = !!message.updated_at && message.updated_at !== message.created_at;

  const shouldStack = useMemo(() => {
    if (hasReply) return false;
    if (!prevMessage) return false;
    const sameAuthor = prevMessage.author.id === message.author.id;
    const sameName = prevMessage.author.name === message.author.name;
    const t1 = safeSnowflakeTime(message.id);
    const t2 = safeSnowflakeTime(prevMessage.id);
    const sentWithinMinute = t1 !== null && t2 !== null && Math.abs(t1 - t2) < 60_000;
    return sameAuthor && sameName && sentWithinMinute;
  }, [prevMessage, message.id, hasReply]);

  return (
    <Pressable
      onLongPress={onLongPress ? () => onLongPress(message) : undefined}
      style={[
        shouldStack ? styles.messageRowStacked : styles.messageRow,
        message.pending && { opacity: 0.5 },
        highlighted && { backgroundColor: colors.tint + '18', borderRadius: 8, marginHorizontal: -6, paddingHorizontal: 6 },
      ]}
    >
      {shouldStack ? (
        <View style={styles.avatarSpacer} />
      ) : message.author.avatar_url ? (
        <Image source={{ uri: message.author.avatar_url }} style={styles.avatar} />
      ) : (
        <View style={[styles.avatarPlaceholder, { backgroundColor: avatarColor }]}>
          <ThemedText style={styles.avatarInitial}>
            {message.author.name?.[0]?.toUpperCase() ?? '?'}
          </ThemedText>
        </View>
      )}
      <View style={styles.messageBubble}>
        {!shouldStack && (
          <View style={styles.messageHeader}>
            <ThemedText style={[TextStyles.body, styles.authorName]} numberOfLines={1}>
              {message.author.name}
            </ThemedText>
            <ThemedText style={[TextStyles.caption, { color: colors.textMuted }]}>
              {formatTime(message.created_at)}
            </ThemedText>
          </View>
        )}
        {message.content ? (
          <View style={!shouldStack ? styles.messageContent : undefined}>
            <MarkdownRenderer
              nodes={ast}
              colors={colors}
              suffix={isEdited ? <Text style={[styles.editedLabel, { color: colors.textMuted }]}> (edited)</Text> : undefined}
            />
          </View>
        ) : null}
        {message.attachments && message.attachments.length > 0 && (
          <View style={styles.attachments}>
            {message.attachments.map((att) =>
              att.content_type?.startsWith('image/') ? (
                <Image
                  key={att.id}
                  source={{ uri: att.url }}
                  style={styles.attachmentImage}
                  contentFit="contain"
                  contentPosition="left"
                />
              ) : (
                <View key={att.id} style={[styles.attachmentChip, { backgroundColor: colors.surfaceRaised }]}>
                  <MaterialIcons name="attach-file" size={14} color={colors.icon} />
                  <ThemedText style={[TextStyles.caption, { color: colors.tint }]} numberOfLines={1}>
                    {att.filename}
                  </ThemedText>
                </View>
              )
            )}
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  messageRow: {
    flexDirection: 'row',
    marginVertical: 4,
    alignItems: 'flex-start',
  },
  messageRowStacked: {
    flexDirection: 'row',
    marginVertical: 1,
    alignItems: 'flex-start',
  },
  avatarSpacer: {
    width: 38,
    marginRight: 10,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    marginRight: 10,
    marginTop: 2,
  },
  avatarPlaceholder: {
    width: 38,
    height: 38,
    borderRadius: 19,
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
    fontWeight: '600',
    flexShrink: 1,
  },
  messageContent: {
    marginTop: 2,
  },
  attachments: {
    marginTop: 6,
    gap: 4,
  },
  attachmentImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  attachmentChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
    alignSelf: 'flex-start',
  },
  editedLabel: {
    fontSize: 11,
    marginTop: 2,
  },
});
