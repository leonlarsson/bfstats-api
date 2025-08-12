export const getUserDOStub = (env: CloudflareBindings, discordId: string) => {
  const id = env.USER_DO.idFromName(discordId);
  return env.USER_DO.get(id);
};
