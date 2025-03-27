import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare";
import { useLoaderData, useSearchParams } from "@remix-run/react";
import { useEffect, useState } from "react";
import type { SafeParseError, SafeParseReturnType, ZodError } from "zod";
import { Header } from "~/components/Header";
import { Message } from "~/components/preview/Message.client";
import { FullscreenThrobber } from "~/root";
import { getUser } from "~/session.server";
import { type QueryData, ZodQueryData } from "~/types/QueryData";
import { INDEX_FAILURE_MESSAGE, INDEX_MESSAGE } from "~/util/constants";
import { useLocalStorage } from "~/util/localstorage";
import { getQdMessageId } from "~/util/query";
import { base64Decode } from "~/util/text";

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
  const user = await getUser(request, context);
  return { user, discordApplicationId: context.env.DISCORD_CLIENT_ID };
};

export const meta: MetaFunction = () => [
  { title: "Message Viewer - Discohook" },
  { name: "og:site_name", content: "Discohook" },
  { name: "og:title", content: "Message Viewer" },
  {
    name: "theme-color",
    content: "#58b9ff",
  },
];

export default () => {
  const { user, discordApplicationId } = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();

  // This page is mostly meant to be used in an iframe so we shouldn't be very
  // reliant on things like the client being logged in and localStorage data
  // const cache = useCache(!user);
  const [settings] = useLocalStorage();
  const [data, setData] = useState<QueryData>();

  useEffect(() => {
    let parsed:
      | SafeParseReturnType<QueryData, QueryData>
      | SafeParseError<QueryData>;
    try {
      parsed = ZodQueryData.safeParse(
        JSON.parse(
          searchParams.get("data")
            ? (base64Decode(searchParams.get("data") ?? "{}") ?? "{}")
            : JSON.stringify({ messages: [INDEX_MESSAGE] }),
        ),
      );
    } catch (e) {
      parsed = {
        success: false,
        error: { issues: [e] } as ZodError<QueryData>,
      };
    }

    if (parsed.success) {
      setData({ version: "d2", ...parsed.data });
    } else {
      console.error("QueryData failed parsing:", parsed.error.issues);
      setData({ version: "d2", messages: [INDEX_FAILURE_MESSAGE] });
    }
  }, [searchParams]);

  return data ? (
    <div>
      {searchParams.get("header") !== "false" && <Header user={user} />}
      <div>
        {data.messages.map((message, i) => {
          const id = getQdMessageId(message);
          return (
            <Message
              key={`preview-message-${id}`}
              message={message.data}
              // cache={cache}
              discordApplicationId={discordApplicationId}
              // webhooks={Object.values(targets)}
              index={i}
              data={data}
              // files={files[id]}
              // setImageModalData={setImageModalData}
              messageDisplay={settings.messageDisplay}
              compactAvatars={settings.compactAvatars}
            />
          );
        })}
      </div>
    </div>
  ) : (
    <FullscreenThrobber />
  );
};
