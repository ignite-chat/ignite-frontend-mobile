import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/theme';
import type { Message } from '@/stores/messages-store';

export type DisplayMessage = {
  id: string;
  content: string;
  created_at: string;
  author: Message['author'];
  attachments?: Message['attachments'];
  pending?: boolean;
};

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

type MessageItemProps = {
  message: DisplayMessage;
  colors: typeof Colors.light;
};

export function MessageItem({ message, colors }: MessageItemProps) {
  return (
    <View style={[styles.messageRow, message.pending && { opacity: 0.5 }]}>
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
        {message.attachments && message.attachments.length > 0 && (
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

const styles = StyleSheet.create({
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
});
