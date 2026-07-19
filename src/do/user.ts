import { DurableObject } from "cloudflare:workers";
import { z } from "zod";

// The payload sent by the bot when linking an account. linkedAt is set server-side
export const UserLinkPayloadSchema = z.object({
  platform: z.string().min(1).max(100),
  username: z.string().min(1).max(100),
  // Always used as the username we display in the bot. TRN BF6 identifier is a number, so in this case, the displayUsername is the human-readable username.
  // The bot will otherwise set displayUsername to the same value as username
  displayUsername: z.string().min(1).max(100),
});

export const UserLinkSchema = UserLinkPayloadSchema.extend({
  linkedAt: z.string(),
});

// All of a user's linked accounts, keyed by game command name (e.g. "bf1")
export const UserLinksSchema = z.record(z.string(), UserLinkSchema);

export type UserLink = z.infer<typeof UserLinkSchema>;
export type UserLinks = z.infer<typeof UserLinksSchema>;

export class UserDurableObject extends DurableObject {
  sql: SqlStorage;
  constructor(state: DurableObjectState, env: CloudflareBindings) {
    super(state, env);
    this.sql = this.ctx.storage.sql;

    // Create the table if it doesn't exist
    this.sql.exec(`
      CREATE TABLE IF NOT EXISTS searches (
        game TEXT,
        platform TEXT,
        username TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (game, platform, username)
        UNIQUE (game, platform, username) ON CONFLICT REPLACE
      );
    `);

    // Create the index if it doesn't exist
    this.sql.exec(`
        CREATE INDEX IF NOT EXISTS idx_created_at ON searches (created_at);
    `);
  }
  async getLinks(): Promise<UserLinks> {
    const links = await this.ctx.storage.get<UserLinks>("links");
    return UserLinksSchema.parse(links || {});
  }

  async setLink(game: string, unsafeLink: Omit<UserLink, "linkedAt">): Promise<void> {
    const links = await this.getLinks();
    links[game] = UserLinkSchema.parse({ ...unsafeLink, linkedAt: new Date().toISOString() });
    await this.ctx.storage.put<UserLinks>("links", links);
  }

  async deleteLink(game: string): Promise<void> {
    const links = await this.getLinks();
    delete links[game];
    await this.ctx.storage.put<UserLinks>("links", links);
  }

  getRecentUsernamesByGameAndPlatform(game: string, platform: string): string[] {
    const usernames = this.ctx.storage.sql
      .exec<{ username: string }>(
        "SELECT username FROM searches WHERE game = ? AND platform = ? ORDER BY created_at DESC LIMIT 5",
        game,
        platform,
      )
      .toArray();
    return usernames.map((row) => row.username);
  }

  addSearch(game: string, username: string, platform: string): void {
    this.ctx.storage.sql.exec(
      "INSERT INTO searches (game, username, platform) VALUES (?, ?, ?)",
      game,
      username,
      platform,
    );
  }
}
