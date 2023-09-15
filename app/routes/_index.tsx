import type { V2_MetaFunction } from "@remix-run/node";
import { useSearchParams } from "@remix-run/react";
import { APIWebhook } from "discord-api-types/v10";
import { useReducer, useState } from "react";
import { zx } from "zodix";
import { Button } from "~/components/Button";
import { TextInput } from "~/components/TextInput";
import { TargetAddModal } from "~/modals/TargetAddModal";
import { ZodQueryData } from "~/types/QueryData";
import { WEBHOOK_URL_RE } from "~/util/constants";
import { cdn, getWebhook } from "~/util/discord";

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
  const parsed = zx.parseQuerySafe(searchParams, { data: ZodQueryData });
  const [data, setData] = useState(
    parsed.success ? parsed.data.data : { messages: [] }
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
        <div className="p-4 w-1/2 overflow-y-auto">
          {Object.values(targets).map((webhook) => {
            const avatarUrl = webhook.avatar
              ? cdn.avatar(webhook.id, webhook.avatar, { size: 64 })
              : cdn.defaultAvatar(1);

            return (
              <div key={`target-${webhook.id}`} className="flex rounded bg-gray-300 p-2 mb-2">
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
        </div>
        <div className="border-l-4 border-l-gray-400 p-4 w-1/2 overflow-y-auto"></div>
      </div>
    </div>
  );
}
