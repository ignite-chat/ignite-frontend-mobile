import { useEmojiStore, type CustomEmoji } from '@/stores/emoji-store';
import { useGuildsStore } from '@/stores/guild-store';
import { apiRequest } from './api';

export const EmojisService = {
  /** Fetch emojis for a single guild and store them. */
  async loadGuildEmojis(guildId: string) {
    const res = await apiRequest<CustomEmoji[]>(`/guilds/${guildId}/emojis`);
    if (res.ok) {
      useEmojiStore.getState().setGuildEmojis(guildId, res.data);
    }
    return res;
  },

  /** Fetch emojis from all guilds the user is in. */
  async loadAllGuildEmojis() {
    const guilds = useGuildsStore.getState().guilds;
    await Promise.all(guilds.map((g) => this.loadGuildEmojis(g.id)));
  },
};
