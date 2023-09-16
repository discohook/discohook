import type { V2_MetaFunction } from "@remix-run/node";
import { useSearchParams } from "@remix-run/react";
import { APIWebhook } from "discord-api-types/v10";
import { useReducer, useState } from "react";
import { Button } from "~/components/Button";
import { Message } from "~/components/preview/Message";
import { TargetAddModal } from "~/modals/TargetAddModal";
import { QueryData, ZodQueryData } from "~/types/QueryData";
import { cdn } from "~/util/discord";
import { base64Decode } from "~/util/text";

export const meta: V2_MetaFunction = () => {
  return [
    { title: "Boogiehook" },
    {
      name: "description",
      content: "The funkiest webhook interface since Discohook.",
    },
  ];
};

export default function Index() {
  const [searchParams, setSearchParams] = useSearchParams();
  const parsed = ZodQueryData.safeParse(JSON.parse(base64Decode(searchParams.get("data") ?? "{}") ?? "{}"))
  const [data, setData] = useState<QueryData>(
    parsed.success ? { version: "d2", ...parsed.data } : { version: "d2", messages: [] }
  );

  type Targets = Record<string, APIWebhook>;
  const [targets, updateTargets] = useReducer(
    (d: Targets, partialD: Partial<Targets>) =>
      ({ ...d, ...partialD } as Targets),
    {}
  );
  const [addingTarget, setAddingTarget] = useState(false);

  const [tab, setTab] = useState<"editor" | "preview">("editor");

  return (
    <div className="h-screen">
      <TargetAddModal
        open={addingTarget}
        setOpen={setAddingTarget}
        updateTargets={updateTargets}
      />
      <div className="md:flex h-full">
        <div className="p-4 md:w-1/2 overflow-y-auto">
          {Object.values(targets).map((webhook) => {
            const avatarUrl = webhook.avatar
              ? cdn.avatar(webhook.id, webhook.avatar, { size: 64 })
              : cdn.defaultAvatar(5);

            return (
              <div
                key={`target-${webhook.id}`}
                className="flex rounded bg-gray-300 p-2 mb-2"
              >
                <img
                  className="rounded-full mr-4 h-12 my-auto"
                  src={avatarUrl}
                />
                <div className="my-auto grow">
                  <p className="font-bold">{webhook.name}</p>
                  <p className="text-sm">{webhook.user?.username}</p>
                </div>
              </div>
            );
          })}
          <Button
            onClick={() => setAddingTarget(true)}
            disabled={Object.keys(targets).length >= 10}
          >
            Add Webhook
          </Button>
          <hr className="border rounded border-gray-400 my-4" />
        </div>
        <div className="md:border-l-2 border-l-gray-400 p-4 md:w-1/2 overflow-y-auto">
          {data.messages.map((message, i) => (
            <Message key={`message-${i}`} message={message.data} />
          ))}
        </div>
      </div>
    </div>
  );
}
