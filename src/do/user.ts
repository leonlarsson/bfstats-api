import { DurableObject } from "cloudflare:workers";
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
  async getLastOptions(): Promise<UserLastOptions> {
    const options = await this.ctx.storage.get("last-options");
    return UserLastOptionsSchema.parse(options || {});
  }

  async setLastOptions(unsafeUserLastOptions: UserLastOptions): Promise<void> {
    const oldLastOptions = await this.getLastOptions();
    const newOptions = UserLastOptionsSchema.parse({ ...oldLastOptions, ...unsafeUserLastOptions });
    await this.ctx.storage.put<UserLastOptions>("last-options", newOptions);
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
}
