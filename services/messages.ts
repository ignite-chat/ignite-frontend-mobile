import type { Message } from '@/stores/messages-store';
import { useMessagesStore } from '@/stores/messages-store';
import { useUsersStore } from '@/stores/users-store';
import { apiRequest } from './api';

export const MessagesService = {
  async loadMessages(channelId: string, options?: { before?: string; limit?: number }) {
    const { setMessages } = useMessagesStore.getState();
    const params = new URLSearchParams();
    if (options?.before) params.set('before', options.before);
    if (options?.limit) params.set('limit', String(options.limit));

    const query = params.toString();
    const path = `/channels/${channelId}/messages${query ? `?${query}` : ''}`;
    const res = await apiRequest<Message[]>(path);

    if (res.ok) {
      setMessages(channelId, res.data);
      useUsersStore.getState().addUsers(res.data.map((m) => m.author));
    }
    return res;
  },

  async loadOlderMessages(channelId: string, beforeId: string, limit = 50) {
    const { prependMessages, messages } = useMessagesStore.getState();
    const path = `/channels/${channelId}/messages?before=${beforeId}&limit=${limit}`;
    const res = await apiRequest<Message[]>(path);

    if (res.ok) {
      // Get existing message IDs for this channel
      const existingIds = new Set(
        (messages[channelId] ?? []).map((m) => m.id)
      );

      // Filter out duplicates
      const uniqueMessages = res.data.filter(
        (m) => !existingIds.has(m.id)
      );

      if (uniqueMessages.length > 0) {
        prependMessages(channelId, uniqueMessages);
        useUsersStore.getState().addUsers(uniqueMessages.map((m) => m.author));
      }
    }
    return res;
  },

  async sendMessage(channelId: string, content: string, author: Message['author']) {
    const { addPendingMessage } = useMessagesStore.getState();
    const nonce = String(Date.now());

    addPendingMessage(channelId, {
      nonce,
      content,
      channel_id: channelId,
      created_at: new Date().toISOString(),
      author,
    });

    const res = await apiRequest<Message>(`/channels/${channelId}/messages`, {
      method: 'POST',
      body: { content, nonce },
    });

    return res;
  },

  async deleteMessage(channelId: string, messageId: string) {
    const { removeMessage } = useMessagesStore.getState();
    const res = await apiRequest<void>(`/channels/${channelId}/messages/${messageId}`, {
      method: 'DELETE',
    });

    if (res.ok) {
      removeMessage(channelId, messageId);
    }
    return res;
  },

  async editMessage(channelId: string, messageId: string, content: string) {
    const { editMessage } = useMessagesStore.getState();
    const res = await apiRequest<Message>(`/channels/${channelId}/messages/${messageId}`, {
      method: 'PUT',
      body: { content },
    });

    if (res.ok) {
      editMessage(channelId, messageId, res.data);
    }
    return res;
  },

  handleMessageCreated(event: { message: Message }) {
    const { addMessage, removePendingMessage } = useMessagesStore.getState();
    if (event.message.nonce) {
      removePendingMessage(event.message.channel_id, event.message.nonce);
    }
    addMessage(event.message.channel_id, event.message);
    useUsersStore.getState().addUser(event.message.author);
  },

  handleMessageUpdated(event: { message: Message }) {
    const { editMessage } = useMessagesStore.getState();
    editMessage(event.message.channel_id, event.message.id, event.message);
  },

  handleMessageDeleted(event: { channel_id: string; message_id: string }) {
    const { removeMessage } = useMessagesStore.getState();
    removeMessage(event.channel_id, event.message_id);
  },
};
