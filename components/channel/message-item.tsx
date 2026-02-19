import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors, TextStyles } from '@/theme';
import type { Message } from '@/stores/messages-store';

const AVATAR_COLORS = ['#E8583E', '#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EC4899'];

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
  const avatarColor = AVATAR_COLORS[(message.author.name?.charCodeAt(0) ?? 0) % AVATAR_COLORS.length];

  return (
    <View style={[styles.messageRow, message.pending && { opacity: 0.5 }]}>
      {message.author.avatar_url ? (
        <Image source={{ uri: message.author.avatar_url }} style={styles.avatar} />
      ) : (
        <View style={[styles.avatarPlaceholder, { backgroundColor: avatarColor }]}>
          <ThemedText style={styles.avatarInitial}>
            {message.author.name?.[0]?.toUpperCase() ?? '?'}
          </ThemedText>
        </View>
      )}
      <View style={styles.messageBubble}>
        <View style={styles.messageHeader}>
          <ThemedText style={[TextStyles.body, styles.authorName]} numberOfLines={1}>
            {message.author.name}
          </ThemedText>
          <ThemedText style={[TextStyles.caption, { color: colors.textMuted }]}>
            {formatTime(message.created_at)}
          </ThemedText>
        </View>
        {message.content ? (
          <ThemedText style={[TextStyles.body, styles.messageContent]}>{message.content}</ThemedText>
        ) : null}
        {message.attachments && message.attachments.length > 0 && (
          <View style={styles.attachments}>
            {message.attachments.map((att) => (
              <View key={att.id} style={[styles.attachmentChip, { backgroundColor: colors.surfaceRaised }]}>
                <MaterialIcons name="attach-file" size={14} color={colors.icon} />
                <ThemedText style={[TextStyles.caption, { color: colors.tint }]} numberOfLines={1}>
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
    marginVertical: 4,
    alignItems: 'flex-start',
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
  attachmentChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
    alignSelf: 'flex-start',
  },
});
