import { redirect } from "@remix-run/node";

export const loader = () => redirect(`https://discord.gg/${process.env.DISCORD_SUPPORT_INVITE_CODE}`)
