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
  editGuildChannel: (guildId: string, channelId: string, updates: Partial<any>) => void;
  removeGuild: (guildId: string) => void;
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
  removeGuild: (guildId) =>
    set((state) => ({ guilds: state.guilds.filter((g) => g.id !== guildId) })),
}));
