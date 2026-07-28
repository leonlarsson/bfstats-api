export const AppEvent = {
  AppGuildInstall: "appGuildInstall",
  AppUserInstall: "appUserInstall",
  AppGuildUninstall: "appGuildUninstall",
  AppUserUninstall: "appUserUninstall",
  BfAccountLink: "bfAccountLink",
  BfAccountUnlink: "bfAccountUnlink",
  ApiImageGenerated: "apiImageGenerated",
  UserDataRedacted: "userDataRedacted",
} as const;

// The events exposed in public APIs like /events/recent and /events/daily-no-gaps
export const exposedAppEvents = [
  AppEvent.AppGuildInstall,
  AppEvent.AppGuildUninstall,
  AppEvent.AppUserInstall,
  AppEvent.AppUserUninstall,
  AppEvent.BfAccountLink,
  AppEvent.BfAccountUnlink,
  AppEvent.ApiImageGenerated,
];

// Typed as string, not the union, so values read from the DB still fit the response schemas.
export const appEventValues = Object.values(AppEvent) as [string, ...string[]];

// Used by both the base data counters and the payload enum.
export const GAMES = [
  "Battlefield 6",
  "Battlefield 2042",
  "Battlefield V",
  "Battlefield 1",
  "Battlefield Hardline",
  "Battlefield 4",
  "Battlefield 3",
  "Battlefield Bad Company 2",
  "Battlefield 2",
] as const;

// Used by both the base data counters and the payload enum.
export const LANGUAGES = [
  "English",
  "French",
  "Italian",
  "German",
  "Spanish",
  "Russian",
  "Polish",
  "Brazilian Portuguese",
  "Turkish",
  "Swedish",
  "Norwegian",
  "Danish",
  "Finnish",
  "Arabic",
  "Chinese",
  "Dutch",
  "Japanese",
] as const;
