import { useGuildsStore } from '@/stores/guild-store';
import { apiRequest } from './api';
import type { Guild } from '@/stores/guild-store';

export const GuildsService = {
  async loadGuilds() {
    const { setGuilds } = useGuildsStore.getState();
    const res = await apiRequest<Guild[]>('/guilds');
    if (res.ok) {
      setGuilds(res.data);
    }
    return res;
  },

  async loadGuildMembers(guildId: string) {
    const { setGuildMembers } = useGuildsStore.getState();
    const res = await apiRequest<any[]>(`/guilds/${guildId}/members`);
    if (res.ok) {
      setGuildMembers(guildId, res.data);
    }
    return res;
  },

  async createGuild(guildData: { name: string; description?: string }) {
    const { addGuild } = useGuildsStore.getState();
    const res = await apiRequest<Guild>('/guilds', {
      method: 'POST',
      body: guildData as Record<string, unknown>,
    });
    if (res.ok) {
      addGuild(res.data);
    }
    return res;
  },

  async leaveGuild(guildId: string) {
    const { removeGuild } = useGuildsStore.getState();
    const res = await apiRequest<void>(`/users/@me/guilds/${guildId}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      removeGuild(guildId);
    }
    return res;
  },

  async joinGuild(guildId: string) {
    return apiRequest<void>(`/guilds/${guildId}/join`, {
      method: 'POST',
    });
  },

  async discoverGuilds(search?: string) {
    const path = search ? `/guilds/discovery?search=${encodeURIComponent(search)}` : '/guilds/discovery';
    return apiRequest<Guild[]>(path);
  },

  handleGuildUpdated(event: { guild: Guild }) {
    const { editGuild } = useGuildsStore.getState();
    editGuild(event.guild.id, event.guild);
  },

  handleGuildDeleted(event: { guild: { id: string } }) {
    const { removeGuild } = useGuildsStore.getState();
    removeGuild(event.guild.id);
  },

  // Member event handlers
  addGuildMemberToStore(guildId: string, member: any) {
    const { addGuildMember } = useGuildsStore.getState();
    addGuildMember(guildId, member);
  },

  updateGuildMemberInStore(guildId: string, userId: string, member: any) {
    const { editGuildMember } = useGuildsStore.getState();
    editGuildMember(guildId, userId, member);
  },

  deleteGuildMemberFromStore(guildId: string, userId: string) {
    const { removeGuildMember } = useGuildsStore.getState();
    removeGuildMember(guildId, userId);
  },

  // Channel event handlers
  handleChannelCreated(event: { channel: any }) {
    const { addGuildChannel } = useGuildsStore.getState();
    addGuildChannel(event.channel.guild_id, event.channel);
  },

  handleChannelUpdated(event: { channel: any }) {
    const { editGuildChannel } = useGuildsStore.getState();
    editGuildChannel(event.channel.guild_id, event.channel.channel_id, event.channel);
  },

  handleChannelDeleted(event: { channel: { guild_id: string; channel_id: string } }) {
    const { removeGuildChannel } = useGuildsStore.getState();
    removeGuildChannel(event.channel.guild_id, event.channel.channel_id);
  },
};
