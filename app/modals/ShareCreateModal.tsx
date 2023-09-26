import { useFetcher } from "@remix-run/react";
import { APIWebhook } from "discord-api-types/v10";
import { useEffect, useState } from "react";
import LocalizedStrings from "react-localization";
import { Button } from "~/components/Button";
import { Checkbox } from "~/components/Checkbox";
import { TextInput } from "~/components/TextInput";
import { QueryData } from "~/types/QueryData";
import { copyText } from "~/util/text";
import { relativeTime } from "~/util/time";
import { action as shareCreateAction } from "../routes/api.share";
import { Modal, ModalProps } from "./Modal";

const strings = new LocalizedStrings({
  en: {
    title: "Share Message",
    copy: "Copy",
    expiresAt: "This link expires at {0} ({1}).",
    options: "Options",
  },
});

export const ShareCreateModal = (
  props: ModalProps & { targets: Record<string, APIWebhook>; data: QueryData }
) => {
  const { targets, data } = props;

  const [includeTargets, setIncludeTargets] = useState(false);

  const shareFetcher = useFetcher<typeof shareCreateAction>();
  useEffect(() => {
    if (props.open) {
      shareFetcher.submit(
        {
          data: JSON.stringify({
            ...data,
            targets: includeTargets
              ? Object.values(targets).map((t) => ({
                  url: `https://discord.com/api/webhooks/${t.id}/${t.token}`,
                }))
              : undefined,
          }),
        },
        { method: "POST", action: "/api/share" }
      );
    }
  }, [props.open, includeTargets, data, targets]);

  return (
    <Modal title={strings.title} {...props}>
      <div className="flex">
        <div className="grow">
          <TextInput
            label="URL"
            className="w-full"
            value={shareFetcher.data ? shareFetcher.data.url : ""}
            readOnly
          />
        </div>
        <Button
          disabled={!shareFetcher.data || shareFetcher.state !== "idle"}
          onClick={() =>
            copyText(shareFetcher.data ? shareFetcher.data.url : "")
          }
          className="ml-2 mt-auto"
        >
          {strings.copy}
        </Button>
      </div>
      {shareFetcher.data && (
        <p className="mt-1">
          {strings.formatString(
            strings.expiresAt,
            <span className="font-medium">
              {new Date(shareFetcher.data.expires).toLocaleString()}
            </span>,
            <>{relativeTime(new Date(shareFetcher.data.expires))}</>
          )}
        </p>
      )}
      <hr className="border border-gray-400 my-4" />
      <p className="text-sm font-medium">{strings.options}</p>
      <Checkbox
        label="Include webhook URLs"
        checked={includeTargets}
        onChange={(e) => setIncludeTargets(e.currentTarget.checked)}
      />
    </Modal>
  );
};
