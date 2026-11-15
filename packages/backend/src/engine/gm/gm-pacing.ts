export interface IPacingConfig {
  mode: 'fast' | 'standard' | 'extended';
  discussionDurationSeconds: number;
  votingDurationSeconds: number;
  draftDurationSeconds: number;
  reactionDurationSeconds: number;
}

export type GMSoundCue =
  | 'sound_alarm'
  | 'sound_blast_door_close'
  | 'sound_vote_chime'
  | 'sound_phone_ring'
  | 'sound_exile_bell'
  | 'sound_day_tick';

export class GMPacing {
  public static getConfig(mode: 'fast' | 'standard' | 'extended' = 'standard'): IPacingConfig {
    switch (mode) {
      case 'fast':
        return {
          mode: 'fast',
          discussionDurationSeconds: 30,
          votingDurationSeconds: 30,
          draftDurationSeconds: 20,
          reactionDurationSeconds: 15,
        };
      case 'extended':
        return {
          mode: 'extended',
          discussionDurationSeconds: 90,
          votingDurationSeconds: 90,
          draftDurationSeconds: 45,
          reactionDurationSeconds: 30,
        };
      case 'standard':
      default:
        return {
          mode: 'standard',
          discussionDurationSeconds: 60,
          votingDurationSeconds: 60,
          draftDurationSeconds: 30,
          reactionDurationSeconds: 20,
        };
    }
  }

  public static getNextSpeaker(currentSpeakerId: string | undefined, survivorIds: string[]): string | undefined {
    if (survivorIds.length === 0) return undefined;
    if (!currentSpeakerId) return survivorIds[0];

    const idx = survivorIds.indexOf(currentSpeakerId);
    if (idx === -1 || idx === survivorIds.length - 1) {
      return survivorIds[0];
    }
    return survivorIds[idx + 1];
  }
}
