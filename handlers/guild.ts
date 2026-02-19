import { GuildsService } from '@/services/guilds';
import { useGuildsStore } from '@/stores/guild-store';
import type { GatewayHandlerContext } from './types';

export function handleGuildJoined(data: any): void {
  console.log('[WS] guild.joined', data);
  const guild = data.guild;
  const { addGuild } = useGuildsStore.getState();
  addGuild(guild);
}

export function handleGuildUpdated(data: any, _context: GatewayHandlerContext): void {
  console.log('[WS] guild.updated', data);
  GuildsService.handleGuildUpdated(data);
}

export function handleGuildDeleted(data: any, _context: GatewayHandlerContext): void {
  console.log('[WS] guild.deleted', data);
  GuildsService.handleGuildDeleted(data);
}
