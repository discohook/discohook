import { REST } from "@discordjs/rest";
import { json } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import {
  APIEmoji,
  APIMessageActionRowComponent,
  APIWebhook,
  ButtonStyle,
  ComponentType,
  RESTGetAPIGuildEmojisResult,
  RESTGetAPIGuildRolesResult,
  Routes,
} from "discord-api-types/v10";
import { useReducer, useState } from "react";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { zx } from "zodix";
import { getDiscordUserOAuth } from "~/auth-discord.server";
import { Button } from "~/components/Button";
import { CoolIcon } from "~/components/CoolIcon";
import { Header } from "~/components/Header";
import { StringSelect } from "~/components/StringSelect";
import { ActionRowEditor } from "~/components/editor/ComponentEditor";
import { FlowEditor } from "~/components/editor/FlowEditor";
import { Message } from "~/components/preview/Message";
import { getUser } from "~/session.server";
import { Flow, getDb, getchGuild, upsertGuild } from "~/store.server";
import { QueryData } from "~/types/QueryData";
import {
  ZodAPIButtonComponent,
  ZodAPISelectMenuComponent,
} from "~/types/components";
import { isDiscordError } from "~/util/discord";
import { LoaderArgs } from "~/util/loader";
import { useLocalStorage } from "~/util/localstorage";
import { base64Decode } from "~/util/text";
import { jsonAsString } from "~/util/zod";

export const loader = async ({ request, context }: LoaderArgs) => {
  const user = await getUser(request, context, true);

  const zDataRef = jsonAsString(
    z.union([
      ZodAPIButtonComponent.partial(),
      ZodAPISelectMenuComponent.partial(),
    ]),
  );
  const zResolvedRef = jsonAsString(
    z.object({
      // guild: z
      //   .object({
      //     id: z.string(),
      //     name: z.string(),
      //     avatar: z.ostring().nullable(),
      //   })
      //   .optional(),
      guildId: z.string(),
      webhook: z
        .object({
          id: z.string(),
          name: z.string(),
          avatar: z.ostring().nullable(),
        })
        .optional(),
    }),
  );
  const { data, resolved } = zx.parseQuery(request, {
    data: z
      .string()
      .refine((v) => zDataRef.safeParse(base64Decode(v)).success)
      .transform((v) => zDataRef.parse(base64Decode(v))),
    resolved: z
      .string()
      .refine((v) => zResolvedRef.safeParse(base64Decode(v)).success)
      .transform((v) => zResolvedRef.parse(base64Decode(v))),
  });

  const rest = new REST().setToken(context.env.DISCORD_BOT_TOKEN);
  const db = getDb(context.env.DATABASE_URL);

  let isMember = false;
  if (user.discordUser) {
    const oauth = await getDiscordUserOAuth(
      db,
      context.env,
      user.discordUser.id,
    );

    try {
      if (oauth?.scope.includes("guilds.members.read")) {
        const r = new REST().setToken(oauth.accessToken);
        await r.get(Routes.userGuildMember(resolved.guildId), {
          authPrefix: "Bearer",
        });
      } else {
        await rest.get(
          Routes.guildMember(resolved.guildId, String(user.discordUser.id)),
        );
      }
      isMember = true;
    } catch (e) {
      if (isDiscordError(e)) {
        console.log(e);
        throw json(e.raw, 400);
      }
      console.error(e);
    }
  }

  if (!isMember) {
    throw json(
      {
        message: "You are not a member of this server.",
      },
      403,
    );
  }

  const guild = await getchGuild(rest, context.env.KV, resolved.guildId);
  await upsertGuild(db, guild);

  const emojis = (await rest.get(
    Routes.guildEmojis(guild.id),
  )) as RESTGetAPIGuildEmojisResult;

  const roles = (await rest.get(
    Routes.guildRoles(guild.id),
  )) as RESTGetAPIGuildRolesResult;

  return {
    user,
    guild,
    emojis: emojis
      .filter((e) => !!e.available)
      .map(
        (e) =>
          ({
            ...e,
            roles: undefined,
            require_colons: undefined,
            available: undefined,
            managed: undefined,
            user: undefined,
          }) satisfies APIEmoji,
      ),
    roles,
    data,
    resolved,
  };
};

export default function ComponentEditorPage() {
  const { t } = useTranslation();
  const {
    user,
    guild,
    emojis,
    roles,
    data: rawData,
    resolved,
  } = useLoaderData<typeof loader>();

  const [data, setData] = useState<QueryData>({
    messages: [
      {
        data: {
          content:
            "On this page, you can customize your component and the flow actions it can activate. Your real message data is not shown here because of technical limitations.",
          components: [
            {
              type: 1,
              components: [rawData as APIMessageActionRowComponent],
            },
          ],
        },
      },
    ],
  });

  const [flow, setFlow] = useState<Flow>({
    name: "Flow",
    actions: [],
  });

  type SelectFlows = Record<string, Flow>;
  const [selectFlows, updateSelectFlows] = useReducer(
    (d: SelectFlows, partialD: Partial<SelectFlows>) =>
      ({ ...d, ...partialD }) as SelectFlows,
    {},
  );

  const component = data.messages[0].data.components?.[0].components[0];
  const setComponent = (c: APIMessageActionRowComponent) => {
    data.messages[0].data.components?.[0].components.splice(0, 1, c);
    setData(structuredClone(data));
  };

  // function isNonPartial(
  //   c: typeof component,
  // ): c is z.infer<typeof ZodAPIMessageActionRowComponent> {
  //   return ZodAPIMessageActionRowComponent.safeParse(component).success;
  // }
  // const row = isNonPartial(component)
  //   ? {
  //       type: 1,
  //       components: [component as APIMessageActionRowComponent],
  //     }
  //   : undefined;

  const [settings] = useLocalStorage();
  const [tab, setTab] = useState<"editor" | "preview">("editor");

  return (
    <div className="h-screen overflow-hidden">
      <Header user={user} />
      <div className="md:flex h-[calc(100%_-_3rem)]">
        <div
          className={`p-4 md:w-1/2 h-full overflow-y-scroll ${
            tab === "editor" ? "" : "hidden md:block"
          }`}
        >
          <div className="flex mb-2">
            <Button
              className="ml-auto md:hidden"
              onClick={() => setTab("preview")}
              discordstyle={ButtonStyle.Secondary}
            >
              {t("preview")} <CoolIcon icon="Chevron_Right" />
            </Button>
          </div>
          <div className="rounded bg-gray-100 dark:bg-gray-800 border-2 border-transparent dark:border-gray-700 p-2 dark:px-3 dark:-mx-1 mt-1 space-y-2">
            {component ? (
              <div>
                <ActionRowEditor
                  // biome-ignore lint/style/noNonNullAssertion:
                  row={data.messages[0].data.components![0]}
                  rowIndex={0}
                  message={data.messages[0]}
                  data={data}
                  setData={setData}
                  emojis={emojis
                    .map((e) => ({
                      id: e.id ?? undefined,
                      // biome-ignore lint/style/noNonNullAssertion: This is not a reaction emoji
                      name: e.name!,
                      animated: e.animated,
                    }))
                    // Discord client sorts alphabetically
                    .sort((a, b) => (a.name > b.name ? 1 : -1))}
                  open
                  notManageable
                />
                {component.type === ComponentType.Button && (
                  <FlowEditor flow={flow} setFlow={setFlow} />
                )}
              </div>
            ) : (
              <div>
                <StringSelect
                  options={[
                    {
                      label: "Button",
                      value: "2",
                    },
                    {
                      label: "Link Button",
                      value: "link-button",
                    },
                    {
                      label: "String Select Menu",
                      value: "3",
                    },

                    {
                      label: "User Select Menu",
                      value: "4",
                    },

                    {
                      label: "Role Select Menu",
                      value: "5",
                    },

                    {
                      label: "User & Role Select Menu",
                      value: "6",
                    },

                    {
                      label: "Channel Select Menu",
                      value: "7",
                    },
                  ]}
                  onChange={(opt) => {
                    const { label, value } = opt as {
                      label: string;
                      value: string;
                    };
                    console.log(value);
                    if (value === "link-button") {
                      setComponent({
                        type: ComponentType.Button,
                        label,
                        style: ButtonStyle.Link,
                        url: "https://discord.com",
                      });
                    } else if (value === "2") {
                      setComponent({
                        custom_id: "",
                        type: ComponentType.Button,
                        label,
                        style: ButtonStyle.Primary,
                      });
                    } else {
                      setComponent({
                        type: Number(value),
                      } as APIMessageActionRowComponent);
                    }
                  }}
                />
              </div>
            )}
          </div>
        </div>
        <div
          className={`md:border-l-2 border-l-gray-400 dark:border-l-[#1E1F22] p-4 md:w-1/2 h-full overflow-y-scroll relative ${
            tab === "preview" ? "" : "hidden md:block"
          }`}
        >
          <div className="md:hidden">
            <Button
              onClick={() => setTab("editor")}
              discordstyle={ButtonStyle.Secondary}
            >
              <CoolIcon icon="Chevron_Left" /> {t("editor")}
            </Button>
            <hr className="border border-gray-400 dark:border-gray-600 my-4" />
          </div>
          <Message
            index={0}
            message={data.messages[0].data}
            discordApplicationId="0"
            compactAvatars={settings.compactAvatars}
            messageDisplay={settings.messageDisplay}
            webhooks={
              resolved?.webhook
                ? [{ ...resolved.webhook, application_id: "0" } as APIWebhook]
                : []
            }
          />
        </div>
      </div>
    </div>
  );
}
