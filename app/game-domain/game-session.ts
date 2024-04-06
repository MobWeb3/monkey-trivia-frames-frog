// import { PlayerOrderType } from "./Session";
// import { Topic } from "./Topic";

export interface MutableGameSession {
    sessionId: string;
    channelId: string;
    hostPlayerId: string;
    pointsToWin: number;
    numberPlayers: number;
    currentPhase?: string;
    gamePhase?: string;
}

// Define the read-only session interface based on the mutable session interface
export type GameSession = Readonly<MutableGameSession> | undefined;