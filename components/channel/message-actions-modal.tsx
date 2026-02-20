import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import type { DisplayMessage } from '@/components/channel/message-item';
import { Colors, TextStyles } from '@/theme';

type Action = {
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  onPress: () => void;
  destructive?: boolean;
};

type MessageActionsModalProps = {
  visible: boolean;
  message: DisplayMessage | null;
  currentUserId: string;
  colors: typeof Colors.light;
  onClose: () => void;
  onCopy: (message: DisplayMessage) => void;
  onEdit: (message: DisplayMessage) => void;
  onDelete: (message: DisplayMessage) => void;
  onReply: (message: DisplayMessage) => void;
};

export function MessageActionsModal({
  visible,
  message,
  currentUserId,
  colors,
  onClose,
  onCopy,
  onEdit,
  onDelete,
  onReply,
}: MessageActionsModalProps) {
  if (!message) return null;

  const isOwn = message.author.id === currentUserId;
  const canEdit = isOwn && !message.pending;
  const canDelete = isOwn && !message.pending;
  const canReply = !isOwn && !message.pending;

  const actions: Action[] = [
    {
      label: 'Copy Text',
      icon: 'content-copy',
      onPress: () => onCopy(message),
    },
  ];

  if (canReply) {
    actions.push({
      label: 'Reply',
      icon: 'reply',
      onPress: () => onReply(message),
    });
  }

  if (canEdit) {
    actions.push({
      label: 'Edit Message',
      icon: 'edit',
      onPress: () => onEdit(message),
    });
  }

  if (canDelete) {
    actions.push({
      label: 'Delete Message',
      icon: 'delete',
      onPress: () => onDelete(message),
      destructive: true,
    });
  }

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={[styles.sheet, { backgroundColor: colors.surfaceRaised }]}>
          <View style={[styles.handle, { backgroundColor: colors.separator }]} />
          {actions.map((action) => (
            <Pressable
              key={action.label}
              onPress={() => {
                onClose();
                action.onPress();
              }}
              style={({ pressed }) => [
                styles.actionRow,
                pressed && { backgroundColor: colors.surfaceOverlay },
              ]}
            >
              <MaterialIcons
                name={action.icon}
                size={20}
                color={action.destructive ? '#ED4245' : colors.text}
              />
              <ThemedText
                style={[
                  TextStyles.body,
                  action.destructive && { color: '#ED4245' },
                ]}
              >
                {action.label}
              </ThemedText>
            </Pressable>
          ))}
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 34,
    paddingTop: 8,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 8,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 14,
  },
});
