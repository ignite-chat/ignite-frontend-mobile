import { useGuildsStore } from '@/stores/guild-store';
import { apiRequest } from './api';
import type { Guild } from '@/stores/guild-store';

export const GuildsService = {
  async loadGuilds(token: string) {
    const { setGuilds } = useGuildsStore.getState();
    const res = await apiRequest<Guild[]>('/guilds', { token });
    if (res.ok) {
      setGuilds(res.data);
    }
    return res;
  },

  async loadGuildMembers(token: string, guildId: string) {
    const { setGuildMembers } = useGuildsStore.getState();
    const res = await apiRequest<any[]>(`/guilds/${guildId}/members`, { token });
    if (res.ok) {
      setGuildMembers(guildId, res.data);
    }
    return res;
  },

  async createGuild(token: string, guildData: { name: string; description?: string }) {
    const { addGuild } = useGuildsStore.getState();
    const res = await apiRequest<Guild>('/guilds', {
      method: 'POST',
      body: guildData as Record<string, unknown>,
      token,
    });
    if (res.ok) {
      addGuild(res.data);
    }
    return res;
  },

  async leaveGuild(token: string, guildId: string) {
    const { removeGuild } = useGuildsStore.getState();
    const res = await apiRequest<void>(`/users/@me/guilds/${guildId}`, {
      method: 'DELETE',
      token,
    });
    if (res.ok) {
      removeGuild(guildId);
    }
    return res;
  },

  async joinGuild(token: string, guildId: string) {
    return apiRequest<void>(`/guilds/${guildId}/join`, {
      method: 'POST',
      token,
    });
  },

  async discoverGuilds(token: string, search?: string) {
    const path = search ? `/guilds/discovery?search=${encodeURIComponent(search)}` : '/guilds/discovery';
    return apiRequest<Guild[]>(path, { token });
  },

  handleGuildUpdated(event: { guild: Guild }) {
    const { editGuild } = useGuildsStore.getState();
    editGuild(event.guild.id, event.guild);
  },

  handleGuildDeleted(event: { guild: { id: string } }) {
    const { removeGuild } = useGuildsStore.getState();
    removeGuild(event.guild.id);
  },
};
