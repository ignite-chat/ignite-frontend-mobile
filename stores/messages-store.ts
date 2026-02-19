import { create } from 'zustand';

export type MessageAuthor = {
  id: string;
  name: string;
  username: string;
  avatar_url: string | null;
  is_bot: boolean;
};

export type MessageAttachment = {
  id: string;
  message_id: string;
  filename: string;
  content_type: string;
  size: number;
  url: string;
};

export type Message = {
  id: string;
  content: string;
  nonce: string | null;
  channel_id: string;
  user_id: string;
  pinned: boolean;
  created_at: string;
  updated_at: string;
  author: MessageAuthor;
  attachments: MessageAttachment[];
  reactions: any[];
  mentions: any[];
  message_references: any[];
  stickers: any[];
};

type MessagesStore = {
  messages: { [channelId: string]: Message[] };

  setMessages: (channelId: string, messages: Message[]) => void;
  prependMessages: (channelId: string, messages: Message[]) => void;
  addMessage: (channelId: string, message: Message) => void;
  editMessage: (channelId: string, messageId: string, updates: Partial<Message>) => void;
  removeMessage: (channelId: string, messageId: string) => void;
  clearChannel: (channelId: string) => void;
};

export const useMessagesStore = create<MessagesStore>((set) => ({
  messages: {},

  setMessages: (channelId, messages) =>
    set((state) => ({
      messages: { ...state.messages, [channelId]: messages },
    })),

  prependMessages: (channelId, older) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [channelId]: [...older, ...(state.messages[channelId] ?? [])],
      },
    })),

  addMessage: (channelId, message) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [channelId]: [...(state.messages[channelId] ?? []), message],
      },
    })),

  editMessage: (channelId, messageId, updates) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [channelId]: (state.messages[channelId] ?? []).map((m) =>
          m.id === messageId ? { ...m, ...updates } : m
        ),
      },
    })),

  removeMessage: (channelId, messageId) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [channelId]: (state.messages[channelId] ?? []).filter((m) => m.id !== messageId),
      },
    })),

  clearChannel: (channelId) =>
    set((state) => {
      const { [channelId]: _, ...rest } = state.messages;
      return { messages: rest };
    }),
}));
