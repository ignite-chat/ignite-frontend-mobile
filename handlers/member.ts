import { GuildsService } from '@/services/guilds';
import type { GatewayHandlerContext } from './types';

export function handleMemberJoined(data: any, context: GatewayHandlerContext): void {
  console.log('[WS] member.joined', data);
  GuildsService.addGuildMemberToStore(context.guildId, data.member);
}

export function handleMemberUpdated(data: any, context: GatewayHandlerContext): void {
  console.log('[WS] member.updated', data);
  GuildsService.updateGuildMemberInStore(context.guildId, data.member.user_id, data.member);
}

export function handleMemberLeft(data: any, context: GatewayHandlerContext): void {
  console.log('[WS] member.left', data);
  if (data.member.user_id === context.currentUserId) {
    GuildsService.handleGuildDeleted({ guild: { id: context.guildId } });
    return;
  }
  GuildsService.deleteGuildMemberFromStore(context.guildId, data.member.user_id);
}
