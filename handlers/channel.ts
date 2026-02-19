import { GuildsService } from '@/services/guilds';
import type { GatewayHandlerContext } from './types';

export function handleChannelCreated(data: any, _context: GatewayHandlerContext): void {
  console.log('[WS] channel.created', data);
  GuildsService.handleChannelCreated(data);
}

export function handleChannelUpdated(data: any, _context: GatewayHandlerContext): void {
  console.log('[WS] channel.updated', data);
  GuildsService.handleChannelUpdated(data);
}

export function handleChannelDeleted(data: any, _context: GatewayHandlerContext): void {
  console.log('[WS] channel.deleted', data);
  GuildsService.handleChannelDeleted(data);
}
