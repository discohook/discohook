import z from "zod";

export const ResponsibleUser = z.object({
  id: z.string(),
  username: z.string(),
  guild_permissions: z.string(),
  /** role ids */
  roles: z.string().array(),
  /** why the user is considered responsible (usually that they were the latest to edit something) */
  reason: z.string().optional(),
});

export type ResponsibleUser = z.infer<typeof ResponsibleUser>;
