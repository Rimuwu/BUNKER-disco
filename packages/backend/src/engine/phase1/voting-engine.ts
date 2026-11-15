import { IPlayerDocument } from '../../db/repositories/player.repository.js';
import { APEconomy, CANDIDATE_VETO_COST } from './ap-economy.js';

export interface IVotingSession {
  isOpen: boolean;
  timerExpiresAt: number;
  ballots: Record<string, string>; // voterId -> nomineeId
  nominees: string[];
  vetoedPlayerIds: string[];
  isTieBreakRound?: boolean;
  tiedCandidates?: string[];
}

export interface IVotingTallyResult {
  eliminatedNomineeId: string | null;
  voteCounts: Record<string, number>;
  totalVotes: number;
  isTie: boolean;
  tiedNominees: string[];
  needsRevote: boolean;
  resolvedByCoinToss: boolean;
}

export class VotingEngine {
  public static createSession(
    nominees: string[],
    durationSeconds = 60,
    isTieBreakRound = false,
    tiedCandidates: string[] = []
  ): IVotingSession {
    return {
      isOpen: true,
      timerExpiresAt: Date.now() + durationSeconds * 1000,
      ballots: {},
      nominees: isTieBreakRound ? tiedCandidates : [...nominees],
      vetoedPlayerIds: [],
      isTieBreakRound,
      tiedCandidates,
    };
  }

  public static castVote(
    session: IVotingSession,
    voter: IPlayerDocument,
    nomineeId: string
  ): void {
    if (!session.isOpen) {
      throw new Error('VOTING_SESSION_CLOSED: Voting session is not active.');
    }

    if (voter.isEliminated) {
      throw new Error('ELIMINATED_PLAYER: Eliminated players cannot vote.');
    }

    // STRICT INVARIANT: Self-voting forbidden
    if (voter.playerId === nomineeId) {
      throw new Error('SELF_VOTING_FORBIDDEN: Players are strictly forbidden from voting for themselves.');
    }

    if (!session.nominees.includes(nomineeId)) {
      throw new Error(`INVALID_NOMINEE: Player ${nomineeId} is not in the ballot nominees list.`);
    }

    if (session.vetoedPlayerIds.includes(nomineeId)) {
      throw new Error(`NOMINEE_VETOED: Nominee ${nomineeId} has invoked candidate veto this round.`);
    }

    session.ballots[voter.playerId] = nomineeId;
  }

  public static activateCandidateVeto(
    session: IVotingSession,
    player: IPlayerDocument,
    survivorsCount: number,
    targetCapacityK: number
  ): void {
    // Cannot veto in final elimination round
    if (survivorsCount <= targetCapacityK + 1) {
      throw new Error('VETO_FORBIDDEN_FINAL_ROUND: Candidate veto cannot be invoked in the final elimination round.');
    }

    if (player.isEliminated) {
      throw new Error('ELIMINATED_PLAYER: Eliminated player cannot veto.');
    }

    if (session.vetoedPlayerIds.includes(player.playerId)) {
      throw new Error('ALREADY_VETOED: Player has already invoked candidate veto.');
    }

    // Costs 2 AP
    APEconomy.spendAP(player, CANDIDATE_VETO_COST, 'Candidate Veto');

    session.vetoedPlayerIds.push(player.playerId);
    // Remove player from nominees list
    session.nominees = session.nominees.filter((id) => id !== player.playerId);
  }

  public static tally(session: IVotingSession): IVotingTallyResult {
    const voteCounts: Record<string, number> = {};
    for (const nomineeId of session.nominees) {
      voteCounts[nomineeId] = 0;
    }

    let totalVotes = 0;
    for (const [voterId, nomineeId] of Object.entries(session.ballots)) {
      if (voteCounts[nomineeId] !== undefined) {
        voteCounts[nomineeId] += 1;
        totalVotes += 1;
      }
    }

    // Determine highest vote count
    let maxVotes = -1;
    let topNominees: string[] = [];

    for (const [nomineeId, count] of Object.entries(voteCounts)) {
      if (count > maxVotes) {
        maxVotes = count;
        topNominees = [nomineeId];
      } else if (count === maxVotes && maxVotes > 0) {
        topNominees.push(nomineeId);
      }
    }

    // If no votes cast at all, select randomly from nominees
    if (maxVotes <= 0 && session.nominees.length > 0) {
      const randomPick = session.nominees[Math.floor(Math.random() * session.nominees.length)];
      return {
        eliminatedNomineeId: randomPick,
        voteCounts,
        totalVotes: 0,
        isTie: false,
        tiedNominees: [],
        needsRevote: false,
        resolvedByCoinToss: true,
      };
    }

    if (topNominees.length === 1) {
      // Clear majority
      return {
        eliminatedNomineeId: topNominees[0],
        voteCounts,
        totalVotes,
        isTie: false,
        tiedNominees: [],
        needsRevote: false,
        resolvedByCoinToss: false,
      };
    }

    // Tie detected!
    if (!session.isTieBreakRound) {
      // Round 1 of tie: needs a 60s tie-breaker revote
      return {
        eliminatedNomineeId: null,
        voteCounts,
        totalVotes,
        isTie: true,
        tiedNominees: topNominees,
        needsRevote: true,
        resolvedByCoinToss: false,
      };
    } else {
      // Revote was also a tie: resolved by server RNG coin toss / lottery
      const randomWinner = topNominees[Math.floor(Math.random() * topNominees.length)];
      return {
        eliminatedNomineeId: randomWinner,
        voteCounts,
        totalVotes,
        isTie: true,
        tiedNominees: topNominees,
        needsRevote: false,
        resolvedByCoinToss: true,
      };
    }
  }
}
