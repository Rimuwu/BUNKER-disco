import { Server, Namespace } from 'socket.io';

export class EventBroadcaster {
  constructor(private io: Server | Namespace) {}

  public getChannel(roomId: string): string {
    return `room:${roomId}`;
  }

  public getPlayerChannel(roomId: string, playerId: string): string {
    return `room:${roomId}:player:${playerId}`;
  }

  public getBigScreenChannel(roomId: string): string {
    return `room:${roomId}:bigscreen`;
  }

  public broadcastToRoom(roomId: string, event: string, data: any): void {
    this.io.to(this.getChannel(roomId)).emit(event, data);
  }

  public broadcastToPlayer(roomId: string, playerId: string, event: string, data: any): void {
    this.io.to(this.getPlayerChannel(roomId, playerId)).emit(event, data);
  }

  public broadcastToBigScreen(roomId: string, event: string, data: any): void {
    this.io.to(this.getBigScreenChannel(roomId)).emit(event, data);
  }

  public broadcastLobbyUpdate(roomId: string, data: any): void {
    this.broadcastToRoom(roomId, 'lobby_update', data);
  }

  public broadcastPlayerConnected(roomId: string, data: { playerId: string; nickname: string }): void {
    this.broadcastToRoom(roomId, 'player_connected', data);
  }

  public broadcastPlayerDisconnected(roomId: string, data: { playerId: string }): void {
    this.broadcastToRoom(roomId, 'player_disconnected', data);
  }

  public broadcastSettingsUpdated(roomId: string, data: { settings: any }): void {
    this.broadcastToRoom(roomId, 'settings_updated', data);
  }

  public broadcastCardRevealed(
    roomId: string,
    data: { playerId: string; cardType: string; cardData: any; category?: string }
  ): void {
    this.broadcastToRoom(roomId, 'card_revealed', data);
  }

  public broadcastVoteStarted(roomId: string, data: { nomineeId: string; timeLimit: number; voterIds?: string[] }): void {
    this.broadcastToRoom(roomId, 'vote_started', data);
  }

  public broadcastVoteResult(
    roomId: string,
    data: { nomineeId: string; votesFor: number; votesAgainst: number; eliminated: boolean; tieBreak?: boolean }
  ): void {
    this.broadcastToRoom(roomId, 'vote_result', data);
  }

  public broadcastPlayerEliminated(roomId: string, data: { playerId: string; nickname: string; finalCards?: any[] }): void {
    this.broadcastToRoom(roomId, 'player_eliminated', data);
  }

  public broadcastPhase1Start(roomId: string, data: { revealOrder: string[]; round: number }): void {
    this.broadcastToRoom(roomId, 'phase1_start', data);
  }

  public broadcastPhase2Start(roomId: string, data: { bunkerState?: any; day: number; resources?: any }): void {
    this.broadcastToRoom(roomId, 'phase2_start', data);
  }

  public broadcastRoomClosed(roomId: string, data: { reason: string }): void {
    this.broadcastToRoom(roomId, 'room_closed', data);
  }

  public sendPrivateCardsDealt(roomId: string, playerId: string, cards: any): void {
    this.broadcastToPlayer(roomId, playerId, 'cards_dealt', { cards });
  }

  public sendPrivateDossierUpdate(roomId: string, playerId: string, dossier: any): void {
    this.broadcastToPlayer(roomId, playerId, 'player_stat_update', dossier);
  }
}
