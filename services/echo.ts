import {
  handleChannelCreated,
  handleChannelDeleted,
  handleChannelUpdated,
  handleGuildDeleted,
  handleGuildJoined,
  handleGuildUpdated,
  handleMemberJoined,
  handleMemberLeft,
  handleMemberUpdated,
  handleMessageCreated,
  handleMessageDeleted,
  handleMessageUpdated,
} from '@/handlers';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

const REVERB_APP_KEY = 'kuvw5kc9qdwndhhhczoz';
const REVERB_HOST = 'ws.ignite-chat.com';
const REVERB_PORT = 443;
const API_BASE_URL = 'https://api.ignite-chat.com/v1';

let echoInstance: Echo<'reverb'> | null = null;
let currentToken: string | null = null;
let currentUserId: string | null = null;

export const EchoService = {
  activeGuildSubscriptions: new Set<string>(),

  connect(token: string, userId: string) {
    if (echoInstance) {
      this.disconnect();
    }

    currentToken = token;
    currentUserId = userId;

    // Pusher must be available globally for laravel-echo
    (globalThis as any).Pusher = Pusher;

    echoInstance = new Echo({
      broadcaster: 'reverb',
      key: REVERB_APP_KEY,
      wsHost: REVERB_HOST,
      wsPort: REVERB_PORT,
      wssPort: REVERB_PORT,
      forceTLS: true,
      enabledTransports: ['ws', 'wss'],
      authorizer: (channel: any) => ({
        authorize: (socketId: string, callback: (error: Error | null, data: any) => void) => {
          fetch(`${API_BASE_URL}/broadcasting/auth`, {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${currentToken}`,
            },
            body: JSON.stringify({
              socket_id: socketId,
              channel_name: channel.name,
            }),
          })
            .then((res) => res.json())
            .then((data) => callback(null, data))
            .catch((error) => callback(error instanceof Error ? error : new Error(String(error)), null));
        },
      }),
    });

    this.subscribeToUserChannel(userId);
  },

  disconnect() {
    if (!echoInstance) return;

    this.unsubscribeAll();
    echoInstance.disconnect();
    echoInstance = null;
    currentToken = null;
    currentUserId = null;
  },

  subscribeToUserChannel(userId: string) {
    if (!echoInstance) return;

    console.log(`[Echo] Subscribing to private-user.${userId}`);
    const context = { guildId: '', currentUserId: userId };

    echoInstance
      .private(`user.${userId}`)
      .listen('.guild.joined', handleGuildJoined)
      .listen('.message.created', (data: any) => handleMessageCreated(data, context))
      .listen('.message.updated', (data: any) => handleMessageUpdated(data, context))
      .listen('.message.deleted', (data: any) => handleMessageDeleted(data, context))
      .listen('.channel.created', (data: any) => handleChannelCreated(data, context));
  },

  subscribeToGuild(guildId: string) {
    if (!echoInstance || this.activeGuildSubscriptions.has(guildId)) return;

    console.log(`[Echo] Subscribing to private-guild.${guildId}`);
    const context = { guildId, currentUserId: currentUserId! };

    echoInstance
      .private(`guild.${guildId}`)
      .listen('.channel.created', (data: any) => handleChannelCreated(data, context))
      .listen('.channel.deleted', (data: any) => handleChannelDeleted(data, context))
      .listen('.channel.updated', (data: any) => handleChannelUpdated(data, context))
      .listen('.guild.deleted', (data: any) => handleGuildDeleted(data, context))
      .listen('.guild.updated', (data: any) => handleGuildUpdated(data, context))
      .listen('.member.joined', (data: any) => handleMemberJoined(data, context))
      .listen('.member.left', (data: any) => handleMemberLeft(data, context))
      .listen('.member.updated', (data: any) => handleMemberUpdated(data, context))
      .listen('.message.created', (data: any) => handleMessageCreated(data, context))
      .listen('.message.deleted', (data: any) => handleMessageDeleted(data, context))
      .listen('.message.updated', (data: any) => handleMessageUpdated(data, context));

    this.activeGuildSubscriptions.add(guildId);
  },

  subscribeToGuilds(guilds: { id: string }[]) {
    guilds.forEach((guild) => this.subscribeToGuild(guild.id));
  },

  unsubscribeFromGuild(guildId: string) {
    if (!echoInstance || !this.activeGuildSubscriptions.has(guildId)) return;

    console.log(`[Echo] Unsubscribing from private-guild.${guildId}`);
    echoInstance.leave(`private-guild.${guildId}`);
    this.activeGuildSubscriptions.delete(guildId);
  },

  unsubscribeAll() {
    if (!echoInstance) return;

    if (currentUserId) {
      console.log(`[Echo] Unsubscribing from private-user.${currentUserId}`);
      echoInstance.leave(`private-user.${currentUserId}`);
    }

    this.activeGuildSubscriptions.forEach((guildId) => {
      console.log(`[Echo] Unsubscribing from private-guild.${guildId}`);
      echoInstance!.leave(`private-guild.${guildId}`);
    });
    this.activeGuildSubscriptions.clear();
  },
};
