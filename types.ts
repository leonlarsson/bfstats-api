/** What is stored in KV. */
export interface StatsObject {
    totalGuilds: number;
    totalChannels: number;
    totalMembers: number;
    totalStatsSent: TotalStatsSent;
    lastUpdated: LastUpdated;
}

export interface LastUpdated {
    /** Date.toUTCString(). */
    date: string;
    /** Last updated timestamp in milliseconds. */
    timestampMilliseconds: number;
    /** Last updated timestamp in seconds. */
    timestampSeconds: number;
}

export interface TotalStatsSent {
    /** Total amount of stats sent. */
    total: number;
    /** Total amount of stats sent, per game. */
    games: { [key: string]: number };
    /** Total amount of stats sent, per language. */
    languages: { [key: string]: number };
}

/** What can be received in a POST request. */
export interface ReceivedBody {
    /** Number to set totalGuilds to. */
    totalGuilds: number;
    /** Number to set totalChannels to. */
    totalChannels: number;
    /** Number to set totalMembers to. */
    totalMembers: number;
    /** Whether to increment totalStatsSent. */
    incrementTotalStatsSent?: boolean;
    /** The game to increment totalStatsSent for. */
    game?: string;
    /** The language to increment totalStatsSent for. */
    language?: string;
}