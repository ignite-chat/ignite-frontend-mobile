import { MessagesService } from '@/services/messages';
import type { GatewayHandlerContext } from './types';

export function handleMessageCreated(data: any, _context: GatewayHandlerContext): void {
  console.log('[WS] message.created', data);
  MessagesService.handleMessageCreated(data);
}

export function handleMessageUpdated(data: any, _context: GatewayHandlerContext): void {
  console.log('[WS] message.updated', data);
  MessagesService.handleMessageUpdated(data);
}

export function handleMessageDeleted(data: any, _context: GatewayHandlerContext): void {
  console.log('[WS] message.deleted', data);
  MessagesService.handleMessageDeleted(data);
}
