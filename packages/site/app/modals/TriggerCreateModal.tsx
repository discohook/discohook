import { Form } from "@remix-run/react";
import { TFunction } from "i18next";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { BRoutes, apiUrl } from "~/api/routing";
import type { action as ApiPostGuildTriggers } from "~/api/v1/guilds.$guildId.triggers";
import { Button } from "~/components/Button";
import { useError } from "~/components/Error";
import { StringSelect } from "~/components/StringSelect";
import { DraftFlow, TriggerEvent } from "~/store.server";
import { CacheManager } from "~/util/cache/CacheManager";
import { useSafeFetcher } from "~/util/loader";
import { FlowEditModal } from "./FlowEditModal";
import { Modal, ModalProps } from "./Modal";

const getTriggerEventOptions = (t: TFunction) =>
  [0, 1].map((value) => ({
    label: t(`triggerEventDescription.${value}`),
    value,
  })) as { label: string; value: TriggerEvent }[];

export const TriggerCreateModal = (
  props: ModalProps & {
    guildId: string;
    cache: CacheManager;
    setOpenTriggerId: React.Dispatch<React.SetStateAction<bigint | undefined>>;
    premium?: boolean;
  },
) => {
  const { t } = useTranslation();
  const [error, setError] = useError();

  const [event, setEvent] = useState<TriggerEvent>();
  const [editingFlow, setEditingFlow] = useState(false);
  const [flow, setFlow] = useState<DraftFlow>({ actions: [] });

  const fetcher = useSafeFetcher<typeof ApiPostGuildTriggers>({
    onError: setError,
  });

  // biome-ignore lint/correctness/useExhaustiveDependencies:
  useEffect(() => {
    if (!props.open) {
      setError(undefined);
      setEvent(undefined);
      setEditingFlow(false);
      fetcher.reset();
      // setFlow(undefined);
    }
  }, [props.open]);

  const options = getTriggerEventOptions(t);
  return (
    <Modal title={t("createTrigger.title")} {...props}>
      <FlowEditModal
        open={editingFlow}
        setOpen={setEditingFlow}
        flow={flow}
        setFlow={setFlow}
        cache={props.cache}
        premium={props.premium}
      />
      <Form
        onSubmit={async (e) => {
          e.preventDefault();

          const created = await fetcher.submitAsync(
            { event, flow },
            {
              action: apiUrl(BRoutes.guildTriggers(props.guildId)),
              method: "POST",
            },
          );
          props.setOpenTriggerId(created.id);
          props.setOpen(false);
        }}
      >
        {error}
        <div>
          <StringSelect
            label={t("createTrigger.when")}
            options={options}
            value={options.find((o) => o.value === event)}
            onChange={(o) => {
              const opt = o as (typeof options)[number];
              setEvent(opt?.value);
            }}
          />
        </div>
        <p className="text-sm mt-4 cursor-default">{t("createTrigger.then")}</p>
        <Button onClick={() => setEditingFlow(true)}>{t("editFlow")}</Button>
        <div className="flex w-full mt-4">
          <Button type="submit" className="mx-auto">
            {t("createTrigger.title")}
          </Button>
        </div>
      </Form>
    </Modal>
  );
};
