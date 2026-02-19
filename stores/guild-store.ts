import { create } from 'zustand';

export type Guild = {
  id: string;
  name: string;
  owner_id: string;
  description: string | null;
  icon_file_id: string | null;
  banner_file_id: string | null;
  member_count: number;
  created_at: string;
  channels: any[];
  roles: any[];
};

type GuildMember = {
  user_id: string;
  user?: any;
  [key: string]: any;
};

type GuildsStore = {
  guilds: Guild[];
  guildMembers: { [guildId: string]: GuildMember[] };

  setGuilds: (guilds: Guild[]) => void;
  setGuildMembers: (guildId: string, members: GuildMember[]) => void;

  addGuild: (guild: Guild) => void;
  editGuild: (guildId: string, updates: Partial<Guild>) => void;
  removeGuild: (guildId: string) => void;

  addGuildMember: (guildId: string, member: GuildMember) => void;
  editGuildMember: (guildId: string, userId: string, updates: Partial<GuildMember>) => void;
  removeGuildMember: (guildId: string, userId: string) => void;

  addGuildChannel: (guildId: string, channel: any) => void;
  editGuildChannel: (guildId: string, channelId: string, updates: Partial<any>) => void;
  removeGuildChannel: (guildId: string, channelId: string) => void;
};

export const useGuildsStore = create<GuildsStore>((set) => ({
  guilds: [],
  guildMembers: {},

  setGuilds: (guilds) => set({ guilds }),
  setGuildMembers: (guildId, members) =>
    set((state) => ({
      guildMembers: {
        ...state.guildMembers,
        [guildId]: members,
      },
    })),

  addGuild: (guild) => set((state) => ({ guilds: [...state.guilds, guild] })),
  editGuild: (guildId, updates) =>
    set((state) => ({
      guilds: state.guilds.map((g) => (g.id === guildId ? { ...g, ...updates } : g)),
    })),
  removeGuild: (guildId) =>
    set((state) => ({ guilds: state.guilds.filter((g) => g.id !== guildId) })),

  addGuildMember: (guildId, member) =>
    set((state) => ({
      guildMembers: {
        ...state.guildMembers,
        [guildId]: [...(state.guildMembers[guildId] ?? []), member],
      },
    })),
  editGuildMember: (guildId, userId, updates) =>
    set((state) => ({
      guildMembers: {
        ...state.guildMembers,
        [guildId]: (state.guildMembers[guildId] ?? []).map((m) =>
          m.user_id === userId ? { ...m, ...updates } : m
        ),
      },
    })),
  removeGuildMember: (guildId, userId) =>
    set((state) => ({
      guildMembers: {
        ...state.guildMembers,
        [guildId]: (state.guildMembers[guildId] ?? []).filter((m) => m.user_id !== userId),
      },
    })),

  addGuildChannel: (guildId, channel) =>
    set((state) => ({
      guilds: state.guilds.map((g) =>
        g.id === guildId ? { ...g, channels: [...g.channels, channel] } : g
      ),
    })),
  editGuildChannel: (guildId, channelId, updates) =>
    set((state) => ({
      guilds: state.guilds.map((g) => {
        if (g.id === guildId) {
          return {
            ...g,
            channels: g.channels.map((c: any) =>
              c.channel_id === channelId ? { ...c, ...updates } : c
            ),
          };
        }
        return g;
      }),
    })),
  removeGuildChannel: (guildId, channelId) =>
    set((state) => ({
      guilds: state.guilds.map((g) =>
        g.id === guildId
          ? { ...g, channels: g.channels.filter((c: any) => c.channel_id !== channelId) }
          : g
      ),
    })),
}));
