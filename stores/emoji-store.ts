import { create } from 'zustand';

export type CustomEmoji = {
  id: string;
  name: string;
  guild_id: string;
  animated: boolean;
};

type EmojiStore = {
  /** All custom emojis keyed by id. */
  emojis: Record<string, CustomEmoji>;

  setGuildEmojis: (guildId: string, emojis: CustomEmoji[]) => void;
  removeGuildEmojis: (guildId: string) => void;
};

export const useEmojiStore = create<EmojiStore>((set) => ({
  emojis: {},

  setGuildEmojis: (guildId, emojis) =>
    set((state) => {
      // Remove old emojis for this guild, then add new ones
      const filtered: Record<string, CustomEmoji> = {};
      for (const [id, emoji] of Object.entries(state.emojis)) {
        if (emoji.guild_id !== guildId) filtered[id] = emoji;
      }
      for (const emoji of emojis) {
        filtered[emoji.id] = { ...emoji, guild_id: guildId };
      }
      return { emojis: filtered };
    }),

  removeGuildEmojis: (guildId) =>
    set((state) => {
      const filtered: Record<string, CustomEmoji> = {};
      for (const [id, emoji] of Object.entries(state.emojis)) {
        if (emoji.guild_id !== guildId) filtered[id] = emoji;
      }
      return { emojis: filtered };
    }),
}));
