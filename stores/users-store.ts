import { create } from 'zustand';
import type { MessageAuthor } from './messages-store';

type UsersStore = {
  users: Record<string, MessageAuthor>;

  addUsers: (users: MessageAuthor[]) => void;
  addUser: (user: MessageAuthor) => void;
  editUser: (userId: string, updates: Partial<MessageAuthor>) => void;
  removeUser: (userId: string) => void;
};

export const useUsersStore = create<UsersStore>((set) => ({
  users: {},

  addUsers: (users) =>
    set((state) => {
      const newUsers = { ...state.users };
      for (const user of users) {
        if (!newUsers[user.id]) {
          newUsers[user.id] = user;
        }
      }
      return { users: newUsers };
    }),

  addUser: (user) =>
    set((state) =>
      state.users[user.id]
        ? state
        : { users: { ...state.users, [user.id]: user } }
    ),

  editUser: (userId, updates) =>
    set((state) =>
      state.users[userId]
        ? { users: { ...state.users, [userId]: { ...state.users[userId], ...updates } } }
        : state
    ),

  removeUser: (userId) =>
    set((state) => {
      const { [userId]: _, ...rest } = state.users;
      return { users: rest };
    }),
}));
