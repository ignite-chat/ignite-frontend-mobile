import { create } from 'zustand';

export type Role = {
  id: string;
  guild_id: string;
  name: string;
  color: number;
  position: number;
  permissions: string;
  mentionable: boolean;
};

type RolesStore = {
  roles: Record<string, Role[]>;

  setGuildRoles: (guildId: string, roles: Role[]) => void;
  addRole: (guildId: string, role: Role) => void;
  editRole: (guildId: string, roleId: string, updates: Partial<Role>) => void;
  removeRole: (guildId: string, roleId: string) => void;
};

export const useRolesStore = create<RolesStore>((set) => ({
  roles: {},

  setGuildRoles: (guildId, roles) =>
    set((state) => ({
      roles: { ...state.roles, [guildId]: roles },
    })),

  addRole: (guildId, role) =>
    set((state) => ({
      roles: {
        ...state.roles,
        [guildId]: [...(state.roles[guildId] ?? []), role],
      },
    })),

  editRole: (guildId, roleId, updates) =>
    set((state) => ({
      roles: {
        ...state.roles,
        [guildId]: (state.roles[guildId] ?? []).map((r) =>
          r.id === roleId ? { ...r, ...updates } : r
        ),
      },
    })),

  removeRole: (guildId, roleId) =>
    set((state) => ({
      roles: {
        ...state.roles,
        [guildId]: (state.roles[guildId] ?? []).filter((r) => r.id !== roleId),
      },
    })),
}));
