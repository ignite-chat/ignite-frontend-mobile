import { useMessagesStore } from '@/stores/messages-store';
import { apiRequest } from './api';
import type { Message } from '@/stores/messages-store';

export const MessagesService = {
  async loadMessages(token: string, channelId: string, options?: { before?: string; limit?: number }) {
    const { setMessages } = useMessagesStore.getState();
    const params = new URLSearchParams();
    if (options?.before) params.set('before', options.before);
    if (options?.limit) params.set('limit', String(options.limit));

    const query = params.toString();
    const path = `/channels/${channelId}/messages${query ? `?${query}` : ''}`;
    const res = await apiRequest<Message[]>(path, { token });

    if (res.ok) {
      setMessages(channelId, res.data);
    }
    return res;
  },

  async loadOlderMessages(token: string, channelId: string, beforeId: string, limit = 50) {
    const { prependMessages } = useMessagesStore.getState();
    const path = `/channels/${channelId}/messages?before=${beforeId}&limit=${limit}`;
    const res = await apiRequest<Message[]>(path, { token });

    if (res.ok) {
      prependMessages(channelId, res.data);
    }
    return res;
  },

  async sendMessage(token: string, channelId: string, content: string) {
    const { addMessage } = useMessagesStore.getState();
    const res = await apiRequest<Message>(`/channels/${channelId}/messages`, {
      method: 'POST',
      body: { content },
      token,
    });

    if (res.ok) {
      addMessage(channelId, res.data);
    }
    return res;
  },

  async deleteMessage(token: string, channelId: string, messageId: string) {
    const { removeMessage } = useMessagesStore.getState();
    const res = await apiRequest<void>(`/channels/${channelId}/messages/${messageId}`, {
      method: 'DELETE',
      token,
    });

    if (res.ok) {
      removeMessage(channelId, messageId);
    }
    return res;
  },

  async editMessage(token: string, channelId: string, messageId: string, content: string) {
    const { editMessage } = useMessagesStore.getState();
    const res = await apiRequest<Message>(`/channels/${channelId}/messages/${messageId}`, {
      method: 'PUT',
      body: { content },
      token,
    });

    if (res.ok) {
      editMessage(channelId, messageId, res.data);
    }
    return res;
  },

  handleMessageCreated(event: { message: Message }) {
    const { addMessage } = useMessagesStore.getState();
    addMessage(event.message.channel_id, event.message);
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
