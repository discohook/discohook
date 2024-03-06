import { SerializeFrom } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import {
  APIMessageActionRowComponent,
  APISelectMenuComponent,
  ButtonStyle,
  ComponentType,
} from "discord-api-types/v10";
import { useEffect, useReducer, useState } from "react";
import { useTranslation } from "react-i18next";
import { zx } from "zodix";
import { BRoutes, apiUrl } from "~/api/routing";
import { Button } from "~/components/Button";
import { CoolIcon } from "~/components/CoolIcon";
import { Header } from "~/components/Header";
import { StringSelect } from "~/components/StringSelect";
import { ActionRowEditor } from "~/components/editor/ComponentEditor";
import { FlowEditor } from "~/components/editor/FlowEditor";
import { Message } from "~/components/preview/Message";
import { getUser } from "~/session.server";
import { Flow } from "~/store.server";
import { QueryData } from "~/types/QueryData";
import { LoaderArgs } from "~/util/loader";
import { useLocalStorage } from "~/util/localstorage";
import { loader as apiComponentIdLoader } from "../api/v1/components.$id";

export const loader = async ({ request, context }: LoaderArgs) => {
  const user = await getUser(request, context, true);

  const { id } = zx.parseQuery(request, {
    id: zx.IntAsString,
  });

  return { componentId: id, user };
};

export default function ComponentEditorPage() {
  const { t } = useTranslation();
  const { componentId, user } = useLoaderData<typeof loader>();

  const [data, setData] = useState<QueryData>({
    messages: [
      {
        data: {
          content:
            "On this page, you can customize your component and the flow actions it can activate. Your real message data is not shown here because of technical limitations.",
          components: [
            {
              type: ComponentType.ActionRow,
              components: [
                {
                  type: ComponentType.Button,
                  style: ButtonStyle.Primary,
                  custom_id: "",
                },
              ],
            },
          ],
        },
      },
    ],
  });
  const [guild, setGuild] =
    useState<SerializeFrom<typeof apiComponentIdLoader>["guild"]>();

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

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    fetch(apiUrl(BRoutes.components(componentId)), { method: "GET" }).then(
      (r) => {
        if (r.status === 200) {
          r.json().then((d: any) => {
            const qd: SerializeFrom<typeof apiComponentIdLoader> = d;
            setGuild(qd.guild);
            if ("flow" in qd.component.data) {
              setFlow(qd.component.data.flow);
            } else if ("flows" in qd.component.data) {
              updateSelectFlows(qd.component.data.flows);
            }
            setComponent({
              ...qd.component.data,
              flow: undefined,
              // @ts-expect-error
              custom_id:
                qd.component.data.type === ComponentType.Button &&
                qd.component.data.style === ButtonStyle.Link
                  ? undefined
                  : qd.component.customId ?? "",
            });
          });
        }
      },
    );
  }, []);

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
                  emojis={guild?.emojis
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
                        custom_id: "",
                        options: [],
                      } as APISelectMenuComponent);
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
            // webhooks={
            //   resolved?.webhook
            //     ? [{ ...resolved.webhook, application_id: "0" } as APIWebhook]
            //     : []
            // }
          />
        </div>
      </div>
    </div>
  );
}
