import { DurableObject } from "cloudflare:workers";
import type { CloudflareBindings } from "@/types";
import { z } from "zod";

export const UserLastOptionsSchema = z.object({
  lastGame: z.string().optional(),
  lastSegment: z.string().optional(),
  lastPlatform: z.string().optional(),
  lastUsername: z.string().optional(),
});

export const UserSettingsSchema = z.object({
  preferredUsername: z.string().optional(),
});

export type UserLastOptions = z.infer<typeof UserLastOptionsSchema>;
export type UserSettings = z.infer<typeof UserSettingsSchema>;

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
  async getLastOptions(): Promise<UserLastOptions> {
    const options = await this.ctx.storage.get("last-options");
    return UserLastOptionsSchema.parse(options || {});
  }

  async setLastOptions(unsafeUserLastOptions: UserLastOptions): Promise<void> {
    const oldLastOptions = await this.getLastOptions();
    const newOptions = UserLastOptionsSchema.parse({ ...oldLastOptions, ...unsafeUserLastOptions });

    // Save the new options
    await this.ctx.storage.put<UserLastOptions>("last-options", newOptions);

    // Add the username (and platform) to the recent list
    this.addSearch(newOptions.lastGame || "", newOptions.lastUsername || "", newOptions.lastPlatform || "");
  }

  async getSettings(): Promise<UserSettings> {
    const settings = await this.ctx.storage.get("settings");
    return UserSettingsSchema.parse(settings || {});
  }

  async setSettings(unsafeUserSettings: UserSettings): Promise<void> {
    const oldSettings = await this.getSettings();
    const newSettings = UserSettingsSchema.parse({ ...oldSettings, ...unsafeUserSettings });
    await this.ctx.storage.put<UserSettings>("settings", newSettings);
  }

  getRecentSearches(): { game: string; username: string; platform: string }[] {
    const searches = this.ctx.storage.sql
      .exec<{ game: string; username: string; platform: string }>(
        "SELECT game, username, platform FROM searches ORDER BY created_at DESC LIMIT 5",
      )
      .toArray();
    return searches;
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

  deleteRecentSearches(): void {
    this.ctx.storage.sql.exec("DELETE FROM searches");
  }
}
