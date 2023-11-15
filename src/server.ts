import { Router } from 'itty-router';
import { PlatformAlgorithm, isValidRequest } from 'discord-verify';
import { AWW_COMMAND, INVITE_COMMAND, respond } from './commands.js';
import { getCuteUrl } from './reddit.js';
import { InteractionType, InteractionResponseType, MessageFlags, APIInteraction } from 'discord-api-types/v10'

const router = Router();

router.get('/', (_, env) => {
  return new Response(`👋 ${env.DISCORD_APPLICATION_ID}`);
});

router.post('/', async (request, env) => {
  const { isValid, interaction } = await server.verifyDiscordRequest(
    request,
    env,
  );
  if (!isValid || !interaction) {
    return new Response('Bad request signature.', { status: 401 });
  }

  if (interaction.type === InteractionType.Ping) {
    return respond({ type: InteractionResponseType.Pong });
  }

  if (interaction.type === InteractionType.ApplicationCommand) {
    switch (interaction.data.name.toLowerCase()) {
      case AWW_COMMAND.name.toLowerCase(): {
        const cuteUrl = await getCuteUrl();
        return respond({
          type: InteractionResponseType.ChannelMessageWithSource,
          data: {
            content: cuteUrl,
          },
        });
      }
      case INVITE_COMMAND.name.toLowerCase(): {
        const applicationId = env.DISCORD_APPLICATION_ID;
        const INVITE_URL = `https://discord.com/oauth2/authorize?client_id=${applicationId}&scope=applications.commands`;
        return respond({
          type: InteractionResponseType.ChannelMessageWithSource,
          data: {
            content: INVITE_URL,
            flags: MessageFlags.Ephemeral,
          },
        });
      }
      default:
        return respond({ error: 'Unknown Type' });
    }
  }

  console.error('Unknown Type');
  return respond({ error: 'Unknown Type' });
});
router.all('*', () => new Response('Not Found.', { status: 404 }));

async function verifyDiscordRequest(request: Request, env: any) {
  const signature = request.headers.get('x-signature-ed25519');
  const timestamp = request.headers.get('x-signature-timestamp');
  const valid =
    signature &&
    timestamp &&
    (await isValidRequest(request, env.DISCORD_PUBLIC_KEY, PlatformAlgorithm.Cloudflare));
  if (!valid) {
    return { isValid: false };
  }

  const body = await request.json() as APIInteraction;
  return { interaction: body, isValid: true };
}

const server = {
  verifyDiscordRequest: verifyDiscordRequest,
  fetch: async function (request: Request, env: any) {
    return router.handle(request, env);
  },
};

export default server;
